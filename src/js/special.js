'use strict';

// /**
//  * !Detected touchscreen devices
//  * */
// var TOUCH = Modernizr.touchevents;
// var DESKTOP = !TOUCH;

/**
 * !Special Version
 * */
(function ($) {
    'use strict';

    var Spec = function (element, config) {
        var self,
            $html = $('html'),
            $body = $('body'),
            $element = $(element),
            $switcher = $(config.switcher),
            $btn = $element.find(config.btn),
            $settingsBtn = $element.find(config.settingOpener),
            $settingsDrop = $element.find(config.settingDrop),
            $settingsResetBtn = $element.find(config.settingReset),
            $scrollToContentBtn = $element.find(config.btnScrollToContent),
            pref = 'jq-spec',
            pluginClasses = {
                initClass: pref + '--initialized',
                panel: pref + '__toolbar',
                switcher: pref + '__switcher'
            },
            // path = cssPath,
            path = 'css/',
            cookieName = {
                specVersionOn: 'special-version-on',
                specVersionSettings: 'special-version-settings',
                fullSettingsOpened: 'special-version-settings-opened'
            };

        var callbacks = function () {
            /** track events */
            // $.each(config, function (key, value) {
            // 	if (typeof value === 'function') {
            // 		$element.on('spec.' + key, function (e, param) {
            // 			return value(e, $element, param);
            // 		});
            // 	}
            // });
        }, setCookie = function (name, value, options) {
            // https://learn.javascript.ru/cookie
            options = options || {};

            var expires = options.expires;

            if (typeof expires === "number" && expires) {
                var d = new Date();
                d.setTime(d.getTime() + expires * 1000);
                expires = options.expires = d;
            }
            if (expires && expires.toUTCString) {
                options.expires = expires.toUTCString();
            }

            value = encodeURIComponent(value);

            var updatedCookie = name + "=" + value;

            for (var propName in options) {
                updatedCookie += "; " + propName;
                var propValue = options[propName];
                if (propValue !== true) {
                    updatedCookie += "=" + propValue;
                }
            }

            document.cookie = updatedCookie;
        }, getCookie = function (name) {
            // https://learn.javascript.ru/cookie
            var matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        }, setCookieMod = function (name, val) {
            var date = new Date;
            setCookie(name, val, {
                expires: date.setDate(date.getDate() + 365),
                // domain: ".belpost.by",
                path: "/"
            });
        }, focusing = function () {
            /**
             * !Clear focus state after mouse key up
             */
            $btn.add($settingsBtn).add($settingsResetBtn).add($scrollToContentBtn).mouseup(function () {
                $(this).blur();
            })
        }, getDefaultSettingsObj = function () {
            /**
             * Create object from default active buttons
             */
            var defaultSettingsObj = {};
            if (typeof config.settingsDefault === 'object' && config.settingsDefault !== null) {
                for (var key in config.settingsDefault) {
                    defaultSettingsObj[key] = config.settingsDefault[key];
                }
            } else {
                var $btnByDefaultActive = $btn.filter('[data-default=true]');

                $.each($btnByDefaultActive, function () {
                    var $this = $(this);
                    defaultSettingsObj[$this.attr('data-mod-name')] = $this.attr('data-mod-value');
                });
            }
            return defaultSettingsObj;
        }, toggleTitle = function ($btn) {
            var title = (!!$btn.hasClass(config.modifiers.activeClass) && $btn.attr('data-title-on') !== undefined)
                ? $btn.attr('data-title-on')
                : $btn.attr('data-title-off');

            $btn.attr('title', title).attr('aria-label', title);
        }, toggleSpec = function () {
            /**
             * !Toggle special version
             */
            // Если для cпец. версии создаются отдельные шаблоны,
            // этот функционал не нужен
            $switcher.click(function (e) {
                e.preventDefault();
                $('body').addClass(config.modifiers.hidePage); // first hide content
                // toggle special version cookie
                var val = getCookie(cookieName.specVersionOn) !== 'true';
                setCookieMod(cookieName.specVersionOn, val);

                location.reload(); // reload page
            });
        }, setActiveState = function ($btn) {
            /**
             * !Set active state to the button
             */

            // Add active class
            $btn
                .addClass(config.modifiers.activeClass)
                .attr('aria-checked', 'true');

            // Add tabindex="-1". For pass focus
            // Add aria-checked="true". See: http://prgssr.ru/development/ispolzovanie-aria-v-html5.html
            $btn.not('[data-toggle]')
                .attr('tabindex', '-1');

            if ($btn.attr('data-toggle') !== undefined) {
                toggleTitle($btn);
            }

        }, setInactiveState = function ($btn) {
            /**
             * !Set inactive state to the button
             */

            // Remove active class
            // Reset tabindex
            // Add aria-checked="false". See: http://prgssr.ru/development/ispolzovanie-aria-v-html5.html
            $btn
                .removeClass(config.modifiers.activeClass)
                .attr('tabindex', '')
                .attr('aria-checked', 'false');

            if ($btn.attr('data-toggle') !== undefined) {
                toggleTitle($btn);
            }

        }, changeSettings = function (initialObj, currentObj) {
            /* время выполнения скрипта (метка начала) */
            /** var time = performance.now(); */

            /**
             * !Change setting of a special version
             */
            var keyRemove, keyAdd;

            // Remove special classes from html
            for (keyRemove in initialObj) {
                $html.removeClass(initialObj[keyRemove]);
            }

            // Reset state for all buttons
            setInactiveState($btn);

            // Merge current object of settings into initial object of settings
            $.extend(true, initialObj, currentObj);
            // console.log("mergeSettings: ", initialObj);
            // console.log('===========================');

            // For the merged object of default settings
            for (keyAdd in initialObj) {
                // Add modifier classes to html
                $html.addClass(initialObj[keyAdd]);
                // console.log("newKey: ", defaultSettingObj[keyAdd]);

                // Reset all buttons in group
                var $allBtnInGroup = $element.find('[data-mod-name*=' + keyAdd + ']');
                setInactiveState($allBtnInGroup);

                // Set active state for active buttons
                var $activeBtn = $element.find('[data-mod-value*=' + initialObj[keyAdd] + ']');
                setActiveState($activeBtn);
            }

            // Save settings in cookie
            setCookieMod(cookieName.specVersionSettings, JSON.stringify(initialObj));

            /* время выполнения скрипта (вывод значения) */
            /** time -= performance.now(); */
            /** console.log('Время выполнения = ', -time); */

            return false;
        }, settingOnLoad = function () {
            /**
             * !Set settings of special version after page load
             * todo: В идеале, этот этап нужно сделать на php
             * */

            if (getCookie(cookieName.specVersionOn) === 'true') {
                // Take saved settings object or create new one
                var savedSettingsStr = getCookie(cookieName.specVersionSettings),
                    savedSettingsObj = savedSettingsStr ? JSON.parse(savedSettingsStr) : {};
                // console.log("savedSettingsObj: ", savedSettingsObj);

                changeSettings(getDefaultSettingsObj(), savedSettingsObj);
            }

        }, selectSetting = function () {
            /**
             * !Select setting for special version
             * */
            $btn.click(function (e) {
                var $curBtn = $(this),
                    settingsStr = getCookie(cookieName.specVersionSettings),
                    modName = $curBtn.attr('data-mod-name'),
                    modVal = $curBtn.attr('data-mod-value');

                // Create object of current setting
                var currentSettingsObj = {};
                currentSettingsObj[modName] = modVal;
                // console.log("currentSettingsObj: ", currentSettingsObj);

                // Take saved settings object or create new one
                var saveSettingsObj = settingsStr ? JSON.parse(settingsStr) : {};
                // console.log("saveSettingsObj: ", saveSettingsObj);

                // If the button is checkbox-type
                if ($curBtn.attr('data-toggle') !== undefined && $curBtn.hasClass(config.modifiers.activeClass)) {
                    currentSettingsObj[modName] = null;
                }

                changeSettings(saveSettingsObj, currentSettingsObj);

                e.preventDefault();
            });
        }, toggleDropSettings = function () {
            /**
             * !Open / Close full settings
             * */
            var settingsBtnActivate = function () {
                $element.data('drop-is-open', true).addClass(config.modifiers.settingsOpenClass);
                $settingsBtn.addClass(config.modifiers.activeClass);
                $settingsDrop.find(config.settingOpener).removeClass(config.modifiers.activeClass); // Remove active class for buttons in the drop
            };

            /**
             * !After document ready
             * */
            if (getCookie(cookieName.fullSettingsOpened) === 'true') {
                settingsBtnActivate();
                $settingsDrop.show();
                // $settingsDrop.hide();
                $settingsDrop.css('display', 'block');
            }

            /**
             * !On events
             * */
            $settingsBtn.click(function (event) {
                if ($settingsDrop.is(':animated')) {
                    return;
                }

                if ($element.data('drop-is-open') === true) {
                    $element.data('drop-is-open', false).removeClass(config.modifiers.settingsOpenClass);
                    $settingsBtn.removeClass(config.modifiers.activeClass);
                    setCookieMod(cookieName.fullSettingsOpened, "false");
                    $settingsDrop.stop().slideUp();
                } else {
                    settingsBtnActivate();
                    setCookieMod(cookieName.fullSettingsOpened, "true");
                    $settingsDrop.stop().slideDown();
                }

                event.preventDefault();
            })
        }, settingsReset = function () {
            /**
             * !Reset setting by default for special version
             * */

            $settingsResetBtn.click(function (event) {

                // Take saved settings object or create new one
                var savedSettingsStr = getCookie(cookieName.specVersionSettings),
                    savedSettingsObj = savedSettingsStr ? JSON.parse(savedSettingsStr) : {},
                    clearedSettingsObj = {};

                for (var key in savedSettingsObj) {
                    clearedSettingsObj[key] = savedSettingsObj[key];
                }
                for (var keyClear in clearedSettingsObj) {
                    clearedSettingsObj[keyClear] = null;
                }
                // console.log("savedSettingsObj: ", savedSettingsObj);
                // console.log("clearedSettingsObj: ", clearedSettingsObj);

                changeSettings(savedSettingsObj, clearedSettingsObj);

                changeSettings(clearedSettingsObj, getDefaultSettingsObj());

                event.preventDefault();
            })
        }, scrollToContent = function () {
            $scrollToContentBtn.click(function (event) {
                if (!$(this).is(':animated')) {
                    $('html,body').stop().animate({scrollTop: $(config.content).offset().top - 20}, 300);
                }

                event.preventDefault();
            })
        }, init = function () {

            $element.addClass(pluginClasses.panel + ' ' + pluginClasses.initClass).addClass(config.modifiers.initClass);

            // Если для cпец. версии создаются отдельные шаблоны,
            // этот функционал не нужен
            /**
             * !include special css and add special class on a body
             */
            if (getCookie(cookieName.specVersionOn) === 'true' && !$('#' + config.cssId).length) {
                $('<link/>', {
                    id: config.cssId,
                    rel: 'stylesheet',
                    href: path + 'special-version.css'
                }).appendTo('head');

                $('<meta/>', {
                    id: config.viewportId,
                    name: 'viewport',
                    content: 'width=device-width, initial-scale=1.0, maximum-scale=2'
                }).appendTo('head');

                $body.addClass(config.modifiers.specOn);
            }

            // $element.trigger('spec.afterInit');
        };

        self = {
            callbacks: callbacks,
            focusing: focusing,
            toggleSpec: toggleSpec,
            settingOnLoad: settingOnLoad,
            selectSetting: selectSetting,
            toggleDropSettings: toggleDropSettings,
            settingsReset: settingsReset,
            scrollToContent: scrollToContent,
            init: init
        };

        return self;
    };

    $.fn.spec = function () {
        var elem = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = elem.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if (typeof opt === 'object' || typeof opt === 'undefined') {
                elem[i].spec = new Spec(elem[i], $.extend(true, {}, $.fn.spec.defaultOptions, opt));
                elem[i].spec.init();
                elem[i].spec.focusing();
                elem[i].spec.callbacks();
                elem[i].spec.toggleSpec();
                elem[i].spec.settingOnLoad();
                elem[i].spec.selectSetting();
                elem[i].spec.toggleDropSettings();
                elem[i].spec.settingsReset();
                elem[i].spec.scrollToContent();
            } else {
                ret = elem[i].spec[opt].apply(elem[i].spec, args);
            }
            if (typeof ret !== 'undefined') {
                return ret;
            }
        }
        return elem;
    };

    $.fn.spec.defaultOptions = {
        switcher: '.spec-btn-switcher-js',
        btn: '.spec-btn-js',
        btnGroup: '.spec-btn-group-js',
        settingOpener: '.spec-btn-settings-js',
        settingDrop: '.spec-settings-js',
        settingReset: '.spec-btn-reset-js',
        settingsDefault: null,
        btnScrollToContent: '.spec-btn-content-js',
        content: '.spec-content-js',
        event: 'click',
        cssId: 'special-version',
        viewportId: 'viewport',
        modifiers: {
            initClass: null,
            specOn: 'vspec',
            hidePage: 'vspec--hide-page',
            activeClass: 'active', // active class of the buttons
            settingsOpenClass: 'settings-is-open'
        }
    };

    /**
     * You can set default settings options
     * add data-default="true" to a button
     * or in options
     * or global param of the plugin
     * @example:
     * $.fn.spec.defaultOptions.settingsDefault = {
     *	"scheme-color":"vspec-mod_scheme-color_blue",
     *	"font-size":"vspec-mod_font-size_lg",
     *	"spacing":"vspec-mod_spacing_md",
     *	"img":"vspec-mod_img_off"
     *};
     */

})(jQuery);

/**
 * !Multi accordion jquery plugin
 * */
(function ($) {
    var MultiAccordion = function (settings) {
        var options = $.extend({
            collapsibleAll: false, // если установить значение true, сворачиваются идентичные панели НА СТРАНИЦЕ, кроме текущего
            resizeCollapsible: false, // если установить значение true, при ресайзе будут соворачиваться все элементы
            container: null, // общий контейнер
            item: null, // непосредственный родитель открывающегося элемента
            handler: null, // открывающий элемента
            handlerWrap: null, // если открывающий элемент не является непосредственным соседом открывающегося элемента, нужно указать элемент, короный является оберткой открывающего элемета и лежит непосредственно перед открывающимся элементом (условно, является табом)
            panel: null, // открывающийся элемент
            openClass: 'active', // класс, который добавляется при открытии
            currentClass: 'current', // класс текущего элемента
            animateSpeed: 300, // скорость анимации
            collapsible: false // сворачивать соседние панели
        }, settings || {});

        this.options = options;
        var container = $(options.container);
        this.$container = container;
        this.$item = $(options.item, container);
        this.$handler = $(options.handler, container);
        this.$handlerWrap = $(options.handlerWrap, container);
        this._animateSpeed = options.animateSpeed;
        this.$totalCollapsible = $(options.totalCollapsible);
        this._resizeCollapsible = options.resizeCollapsible;

        this.modifiers = {
            active: options.openClass,
            current: options.currentClass
        };

        this.bindEvents();
        this.totalCollapsible();
        this.totalCollapsibleOnResize();

    };

    MultiAccordion.prototype.totalCollapsible = function () {
        var self = this;
        self.$totalCollapsible.click(function () {
            self.$panel.slideUp(self._animateSpeed, function () {
                self.$container.trigger('accordionChange');
            });
            self.$item.removeClass(self.modifiers.active);
        })
    };

    MultiAccordion.prototype.totalCollapsibleOnResize = function () {
        var self = this;
        $(window).resize(function () {
            if (self._resizeCollapsible) {
                self.$panel.slideUp(self._animateSpeed, function () {
                    self.$container.trigger('accordionChange');
                });
                self.$item.removeClass(self.modifiers.active);
            }
        });
    };

    MultiAccordion.prototype.bindEvents = function () {
        var self = this;
        var $container = this.$container;
        var $item = this.$item;
        var panel = this.options.panel;

        $container.on('click', self.options.handler, function (e) {
            var $currentHandler = self.options.handlerWrap ? $(this).closest(self.options.handlerWrap) : $(this);
            var $currentItem = $currentHandler.closest('li');

            if ($currentItem.has($(panel)).length) {
                e.preventDefault();

                if ($currentHandler.next(panel).is(':visible')) {
                    self.closePanel($currentItem);

                    return;
                }

                if (self.options.collapsibleAll) {
                    self.closePanel($($container).not($currentHandler.closest($container)).find($item));
                }

                if (self.options.collapsible) {
                    self.closePanel($currentItem.siblings());
                }

                self.openPanel($currentItem, $currentHandler);
            }
        })
    };

    MultiAccordion.prototype.closePanel = function ($currentItem) {
        var self = this;
        var panel = self.options.panel;
        var openClass = self.modifiers.active;

        $currentItem.removeClass(openClass).find(panel).filter(':visible').slideUp(self._animateSpeed, function () {
            self.$container.trigger('mAccordionAfterClose').trigger('mAccordionAfterChange');
        });

        $currentItem
            .find(self.$item)
            .removeClass(openClass);
    };

    MultiAccordion.prototype.openPanel = function ($currentItem, $currentHandler) {
        var self = this;
        var panel = self.options.panel;

        $currentItem.addClass(self.modifiers.active);

        $currentHandler.next(panel).slideDown(self._animateSpeed, function () {
            self.$container.trigger('mAccordionAfterOpened').trigger('mAccordionAfterChange');
        });
    };

    window.MultiAccordion = MultiAccordion;
}(jQuery));

$(document).ready(function () {
    var mainSpecialClass = 'vspec',
        specIsOn;

    var specVersionInit = function () {
        var $specSwitcher = $('.spec-btn-switcher'),
            $specPanel = $('.spec-panel-js');
        if ($specSwitcher.length) {
            $specPanel.spec({
                content: '#content',
                modifiers: {
                    specOn: mainSpecialClass
                }
            });

            specIsOn = $('body').hasClass(mainSpecialClass);
        }
    };

    specVersionInit();

    /**
     * !Set tabindex -1 for a hidden element on page
     */
    // Всем уазанным элементам и находящимся в них ссылкам добавить tabindex: -1
    function untab() {
        if (specIsOn) {
            var $hideElements = $('.spec-hide');
            $.each($hideElements, function () {
                $(this).attr('tabindex', '-1').find('a').attr('tabindex', '-1');
            })
        }
    }

    untab();

    /**
     * !Back to top
     * */
    function backToTop() {
        var $btnToTop = $('.back-to-top');

        if ($btnToTop.length) {
            $btnToTop.click(function (e) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            });
        }
    }

    backToTop();

    /**
     * !Navigation accordion initial
     * */
    function navAccordionInit() {

        var navMenu = '.nav__list-js',
            $navMenu = $(navMenu),
            $drop = $('li', $navMenu).children('ul'),
            angleTpl = '<span class="nav__angle nav__handler-js"><i>&nbsp;</i></span>';

        // Add arrow
        $drop.before(angleTpl);

        // Init navigation accordion
        if ($navMenu.length) {
            new MultiAccordion({
                container: navMenu,
                item: 'li',
                handler: '.nav__handler-js',
                handlerWrap: '.nav__handler-js',
                panel: 'ul',
                openClass: 'is-open',
                animateSpeed: 300,
                // collapsible: true
            });
        }

        // Add class has-drop
        $drop.closest('li').addClass('has-drop');
    }

    navAccordionInit();

    /**
     * Toggle mobile menu
     */

    function toggleMobileMenu() {
        $('.nav-opener-js').click(function (event) {
            event.preventDefault();

            var $btn = $(this),
                $nav = $btn.parent().find('.nav-js'),
                activeMod = 'nav-is-open';

            if ($nav.is(':animated')) {
                return;
            }

            if ($nav.data(activeMod) === true) {
                $btn.removeClass(activeMod);
                $nav.data(activeMod, false).removeClass(activeMod);
                $nav.slideUp();
            } else {
                $btn.addClass(activeMod);
                $nav.data(activeMod, true).addClass(activeMod);
                $nav.slideDown();
            }
        })
    }

    toggleMobileMenu();

    $('__img').each(function () {
        var $img = $(this);
        if ($img.attr('alt') && !$img.next('.for-spec')) {
            $('<span>', {
                class: 'for-spec img-alt-spec',
                html: $img.attr('alt')
            }).clone().insertAfter($img);
        }
    })
});