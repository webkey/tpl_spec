## В `<head>` временно закомментить подключение `main.js`
Выдает ошибку в консоли. Блочит выполнение скрипта спецверсии


## Код проверки на наличие куки спецверсии
`<?if($_COOKIE["special-version-on"] == 'true'):?> ... <?endif?>`


## Добавить empty.png
`local/templates/.default/assets/i`


## Залить на сервак и подключить стили, скрипты
1. gulpfile.js по команде buildDist собирает и переносит эти файлы в
`local/templates/.default/assets`
2. От сюда их нужно вручную обновить на серваке
3. Список файлов:
    * `local/templates/.default/assets/css/special-prevent.css` *// подключить в шапке*
    * `local/templates/.default/assets/css/special-version.css` *// подлючить через проверку куков*
    * `local/templates/.default/assets/js/special.js` *// подключить после скриптов*


## Подключить
в `local/templates/.default/header.php`
* `<!--Special-->`
* `<link href="<?= DEFAULT_ASSETS_PATH ?>/css/special-prevent.css" rel="stylesheet" media="screen">`


## Подключить
в `local/templates/.default/footer.php`
* `<!--Special-->`
* `<script type="text/javascript" src="/local/templates/.default/assets/js/special.js?v=201812261330"></script>`


## Добавить кнопку Версия для слабовидящих `<a class="spec-btn-switcher... >` в
* `local/templates/inner/header.php`, `local/templates/map/header.php`
в
`<header class="l-header--inner"> ... >`

* `local/templates/index/header.php`
в
`<header class="l-header"> ... >`


## Добавить следуюющие элементы
* в `local/templates/.default/header.php`

		<!--Special-->
		<div class="spec-panel ...
		
		<!--Special-->
		<div class="logo-spec-wrap ...
		
		<!--Special-->
		<div class="nav-box ...

	**@todo:** добавить реальную навигацию

* в `local/templates/index/footer.php`, `local/templates/inner/footer.php`

		<!--Special-->
		<div class="flex-row">
			<div class="spec-foot ...