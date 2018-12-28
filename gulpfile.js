'use strict';

var gulp = require('gulp'), // Подключаем Gulp
	sass = require('gulp-sass'), // Подключаем Sass пакет https://github.com/dlmanning/gulp-sass
	browserSync = require('browser-sync').create(), // Подключаем Browser Sync
	reload = browserSync.reload,
	concat = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
	uglify = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
	cssnano = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
	concatCss = require('gulp-concat-css'),
	rename = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
	del = require('del'), // Подключаем библиотеку для удаления файлов и папок
	imagemin = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
	pngquant = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
	cache = require('gulp-cache'), // Подключаем библиотеку кеширования
	autoprefixer = require('gulp-autoprefixer'), // Подключаем библиотеку для автоматического добавления префиксов
	sourcemaps = require('gulp-sourcemaps'), // Подключаем Source Map для дебагинга sass-файлов https://github.com/floridoo/gulp-sourcemaps
	fileinclude = require('gulp-file-include'),
	markdown = require('markdown'),
	htmlbeautify = require('gulp-html-beautify'), // Причесываем
	fs = require('fs'), // For compiling modernizr.min.js
	modernizr = require('modernizr'), // For compiling modernizr.min.js
	config = require('./modernizr-config'), // Path to modernizr-config.json
	replace = require('gulp-string-replace'),
	strip = require('gulp-strip-comments'), // Удалить комментарии
	stripCssComments = require('gulp-strip-css-comments'), // Удалить комментарии (css)
	removeEmptyLines = require('gulp-remove-empty-lines'), // Удалить пустые строки
	revts = require('gulp-rev-timestamp'), // Дабавить версии к подключаемым файлам
	beautify = require('gulp-beautify') // Причесать js
	, index = require('gulp-index') // Для создания списка страниц https://www.npmjs.com/package/gulp-index
	;

/**
 * @description
 * Список тасков, которые нужно запускать отдельно, по необходимости:
 * 1) copyLocal
 * 2) modernizr
 * 3) normalize, также нужно разкомментировать @import в special-version.sass
 * 4) copyCssLibs
 * 5) copyScriptsLibs
 *
 * Запускать перед таском default
 */

var path = {
	'dist': 'dist',
	'local': 'local/templates/.default/assets'
};

/**
 * Копирование файлов изображений, стилей, скриптов с сервера (нужно предварительно выкачать).
 * Этот таск отвечает за то, чтобы перед сборкой локального проекта
 * скопировать все скачанные файлы с сервака в папку src.
 * Из src напрямую к этим файлам нет доступа.
 * Модуль 'copyLocal' нужно запускать одельно
 */
gulp.task('copyLocal', function () {
	// local
	gulp.src(path.local + '/fonts/**/*')
		.pipe(gulp.dest('src/' + path.local + '/fonts'));

	gulp.src(path.local + '/i/**/*')
		.pipe(gulp.dest('src/' + path.local + '/i'));

	gulp.src(path.local + '/userimg/**/*')
		.pipe(gulp.dest('src/' + path.local + '/userimg'));

	gulp.src(path.local + '/css/*.css')
		.pipe(gulp.dest('src/' + path.local + '/css'));

	gulp.src(path.local + '/js/**/*')
		.pipe(gulp.dest('src/' + path.local + '/js'));
});

/**
 * Для спецверсии запустить отдельно, если нужно подключить modernizr
 */
gulp.task('modernizr', function (done) { // Таск для формирования кастомного modernizr
	modernizr.build(config, function (code) {
		fs.writeFile('src/js/modernizr.min.js', code, done);
	});
});

/**
 * Таск формирования ДОМ страниц
 */
gulp.task('htmlCompilation', function () {
	return gulp.src(['src/__*.html'])
		.pipe(fileinclude({
			filters: {
				markdown: markdown.parse
			}
		}))
		.pipe(rename(function (path) {
			path.basename = path.basename.substr(2);
		}))
		.pipe(htmlbeautify({
			"indent_with_tabs": true,
			"max_preserve_newlines": 0
		}))
		.pipe(gulp.dest('./src/'));
});

/**
 * Таск создания списка всех страниц
 */
gulp.task('html:buildAllPages', ['htmlCompilation'], function() {
	var pref = "all-pages";
	return gulp.src(['!src/__*.html', '!src/_tpl_*.html', '!src/_temp_*.html', './src/*.html'])
		.pipe(index({
			// written out before index contents
			'prepend-to-output': () => `<head> <title>All pages</title><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0"><link rel="shortcut icon" href="favicon.ico"></head><body>`,
			'title': 'All pages',
			'title-template': (title) =>`<h1 class="` + pref + `__title">${title}</h1>`,
			'section-template': (sectionContent) => `<section class="` + pref + `__section"> ${sectionContent}</section>`,
			'section-heading-template': (heading) => `<!--<h2 class="` + pref + `__section-heading">${heading}</h2>-->`,
			'list-template': (listContent) => `<ul class="` + pref + `__list"> ${listContent}</ul>`,
			'item-template': (filepath, filename) => `<li class="` + pref + `__item"><a class="` + pref + `__item-link" href="./${filename}">${filename}</a></li>`,
			'outputFile': './all-pages.html'
		}))
		.pipe(htmlbeautify({
			"indent_with_tabs": true,
			"max_preserve_newlines": 0
		}))
		.pipe(gulp.dest('./src/'));
});

/**
 * Таск для переноса normalize
 * В обольшенстве случаев для спецверсии выполнять не нужно
 */
gulp.task('normalize', function () {
	return gulp.src('src/libs/normalize-scss/sass/**/*.+(scss|sass)')
		.pipe(stripCssComments())
		// .pipe(removeEmptyLines())
		.pipe(gulp.dest('src/_temp/'));
});

/**
 * Создаем таск для компиляции sass файлов
 */
gulp.task('sassCompilation', function () {
	return gulp.src('src/sass/**/*.+(scss|sass)')
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'expanded', // nested (default), expanded, compact, compressed
			indentType: 'tab',
			indentWidth: 1,
			precision: 3,
			linefeed: 'lf' // cr, crlf, lf or lfcr
		}).on('error', sass.logError)) // Преобразуем Sass в CSS посредством gulp-sass
		.pipe(replace('../../', '../')) /// в css файлах меняем пути к файлам с ../../ на ../
		.pipe(replace('@charset "UTF-8";', ''))
		.pipe(autoprefixer([
			'last 5 versions', '> 1%', 'ie > 9', 'and_chr >= 2.3' //, 'ie 8', 'ie 7'
		], {
			cascade: true
		})) // Создаем префиксы
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./src/css'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

/**
 * Таск для мержа css библиотек
 */
gulp.task('copyCssLibs', function () {
	return gulp.src([
		// 'src/libs/example.css' // пример подключения
	]) // Выбираем файлы для конкатенации
		.pipe(concatCss("src/css/libs.css", {
			rebaseUrls: false
		}))
		.pipe(gulp.dest('./')) // Выгружаем в папку src/css несжатую версию
		.pipe(cssnano()) // Сжимаем
		.pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
		.pipe(gulp.dest('src/css/lib')); // Выгружаем в папку src/css сжатую версию
});

/**
 * Таск для мераж js библиотек
 * В обольшенстве случаев для спецверсии выполнять не нужно
 */
gulp.task('copyScriptsLibs', function () {
	return gulp.src([
		// 'src/libs/example.js' // пример подключения
	])
		.pipe(concat('libs.js')) // Собираем их в кучу в новом файле libs.min.js
		.pipe(gulp.dest('src/js'))
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('src/js/lib')); // Выгружаем в папку src/js
});

/**
 * Таск для копирования jquery в js папку
 * Для спецверсии запустить отдельно, если нужно подключить jquery
 */
gulp.task('copyJquery', function () {
	return gulp.src([
		'src/libs/jquery/dist/jquery.min.js'
	])
		.pipe(gulp.dest('src/js'));
});

/**
 * Таск browserSync
 */
gulp.task('browserSync', function (done) {
	browserSync.init({
		server: {
			baseDir: "./src"
		},
		notify: false
	});
	browserSync.watch(['src/*.html', 'src/js/**/*.js', 'src/includes/**/*.json', 'src/includes/**/*.svg']).on("change", browserSync.reload);
	done();
});

/**
 * Таск наблюдения за изменением файлов
 */
// gulp.task('watch', ['modernizr', 'browserSync', 'htmlCompilation', 'sassCompilation', 'copyCssLibs', 'copyScriptsLibs'], function () {
gulp.task('watch', ['browserSync', 'html:buildAllPages', 'sassCompilation'], function () {
	gulp.watch(['src/_tpl_*.html', 'src/__*.html', 'src/includes/**/*.json', 'src/includes/**/*.svg'], ['html:buildAllPages']); // Наблюдение за tpl
	// файлами в папке include
	gulp.watch('src/sass/**/*.+(scss|sass)', ['sassCompilation']); // Наблюдение за sass файлами в папке sass
});

/**
 * Назначаем таск watch дефолтным
 */
gulp.task('default', ['watch']);



/************************************************************
 * Create Distribution folder and move files to it
 ************************************************************/

/**
 * Копирование изображений
 */
gulp.task('copyImgToDist', function () {
	return gulp.src('src/i/**/*')
		// .pipe(cache(imagemin({ // Сжимаем их с наилучшими настройками с учетом кеширования
		// 	interlaced: true,
		// 	progressive: true,
		// 	svgoPlugins: [{removeViewBox: false}],
		// 	optimizationLevel: 7, //степень сжатия от 0 до 7
		// 	use: [pngquant()]
		// })))
		.pipe(gulp.dest(path.dist + '/i'));
});

/**
 * Таск для компиляции sass файлов без мапинга.
 * Специально для релизной версии
 */
gulp.task('sassCompilationForDist', function () {
	return gulp.src('src/sass/**/*.+(scss|sass)')
		.pipe(sass({
			outputStyle: 'expanded',
			indentType: 'tab',
			indentWidth: 1,
			precision: 3,
			linefeed: 'lf'
		}).on('error', sass.logError))
		.pipe(replace('../../', '../'))
		.pipe(replace('@charset "UTF-8";', ''))
		.pipe(autoprefixer([
			'last 5 versions', '> 1%', 'ie >= 9', 'and_chr >= 2.3'
		], {
			cascade: true
		}))
		.pipe(removeEmptyLines()) // Удаление пустыч строки
		.pipe(gulp.dest(path.dist + '/css'))
});

// gulp.task('buildDist', ['htmlCompilation', 'copyImgToDist', 'sassCompilation', 'copyCssLibs', 'copyScriptsLibs', 'modernizr'], function () {
gulp.task('buildDist', ['html:buildAllPages', 'copyImgToDist', 'sassCompilationForDist'], function () {

	// Переносим special.js в продакшен
	gulp.src('src/js/special.js')
		.pipe(strip({
			safe: true,
			ignore: /\/\*\*\s*\n([^\*]*(\*[^\/])?)*\*\//g // Не удалять /**...*/
		}))
		.pipe(removeEmptyLines())  // Удаляем пустые строки
		.pipe(beautify({  // Причесываем код
			"indent_with_tabs": true,
			"space_after_anon_function": true,
			"max_preserve_newlines": 2
		}))
		.pipe(gulp.dest(path.dist + '/js'));

	// Переносим остальные скрипты в продакшен
	gulp.src([
		'src/js/jquery.min.js', // jquery
		'src/js/modernizr.min.js', // modernizr - нужен для определения сенсорных экранов
	])
		.pipe(gulp.dest(path.dist + '/js'));
});

gulp.task('cleanDist', function () {
	// return del.sync([path.dist + '/']); // Удаляем папку dist
});

gulp.task('clearCache', function () { // Создаем такс для очистки кэша
	return cache.clearAll();
});