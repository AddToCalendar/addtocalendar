(function (w, d) {
    var
        atc_url = '//addtocalendar.com/atc/',
        atc_version = '1.5';


    if (!Array.indexOf) {
        Array.prototype.indexOf = function (obj) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (this[i] == obj) {
                    return i
                }
            }
            return -1
        }
    }

    if (!Array.prototype.map) {
        Array.prototype.map = function (f) {
            var result = [];
            for (var i = 0, l = this.length; i < l; i++) {
                result.push(f(this[i]))
            }
            return result
        }
    }

    var isArray = function (obj) {
        return Object.prototype.toString.call(obj) === "[object Array]"
    };

    var isFunc = function (obj) {
        return Object.prototype.toString.call(obj) === "[object Function]"
    };

    var ready = function (w, d) {
        var inited = false,
            loaded = false,
            queue = [],
            done, old;

        function go() {
            if (!inited) {
                if (!d.body) return setTimeout(go, 13);
                inited = true;
                if (queue) {
                    var j, k = 0;
                    while (j = queue[k++]) j.call(null);
                    queue = null
                }
            }
        }

        function check() {
            if (loaded) return;
            loaded = true;
            if (d.readyState === "complete") return go();
            if (d.addEventListener) {
                d.addEventListener("DOMContentLoaded", done, false);
                w.addEventListener("load", go, false)
            } else {
                if (d.attachEvent) {
                    d.attachEvent("onreadystatechange", done);
                    w.attachEvent("onload", go);
                    var k = false;
                    try {
                        k = w.frameElement == null
                    } catch (j) {}
                    if (b.doScroll && k) ie()
                } else {
                    old = w.onload;
                    w.onload = function (e) {
                        old(e);
                        go()
                    }
                }
            }
        }
        if (d.addEventListener) {
            done = function () {
                d.removeEventListener("DOMContentLoaded", done, false);
                go()
            }
        } else {
            if (d.attachEvent) {
                done = function () {
                    if (d.readyState === "complete") {
                        d.detachEvent("onreadystatechange", done);
                        go()
                    }
                }
            }
        }

        function ie() {
            if (inited) return;
            try {
                b.doScroll("left")
            } catch (j) {
                setTimeout(ie, 1);
                return
            }
            go()
        }
        return function (callback) {
            check();
            if (inited) {
                callback.call(null)
            } else {
                queue.push(callback)
            }
        }
    }(w, d);

    if (w.addtocalendar && typeof w.addtocalendar.start == "function") return;
    if (!w.addtocalendar) w.addtocalendar = {};

    addtocalendar.languages = {
        'de': 'In den Kalender',
        'en': 'Add to Calendar',
        'es': 'Añadir al Calendario',
        'fr': 'Ajouter au calendrier',
        'hi': 'कैलेंडर में जोड़ें',
        'in': 'Tambahkan ke Kalender',
        'ja': 'カレンダーに追加',
        'ko': '캘린더에 추가',
        'pt': 'Adicionar ao calendário',
        'ru': 'Добавить в календарь',
        'uk': 'Додати в календар',
        'zh': '添加到日历'
    };

    addtocalendar.calendar_urls = {

    }

    addtocalendar.loadSettings = function(element){
        var settings = {
            'language':'auto',
            'show-list-on':'click',
            'calendars':[
                'iCalendar',
                'Google Calendar',
                'Outlook',
                'Outlook Online',
                'Yahoo! Calendar'
            ],
            'secure':'auto',
            'on-button-click':function(){},
            'on-calendar-click':function(){}
        };

        for (var option in settings){
            var pname = 'data-' + option;
            var eattr = element.getAttribute(pname);
            if(eattr != null){

                if(isArray(settings[option])){
                    settings[option] = eattr.replace(/\s*,\s*/g,',').replace(/^\s+|\s+$/g, '').split(',');
                    continue;
                }

                if(isFunc(settings[option])){
                    var fn = window[eattr];
                    if(isFunc(fn)) {
                        settings[option]=fn;
                    }else {
                        settings[option]=eval('(function(mouseEvent){'+eattr+'})');
                    }
                    continue;
                }

                settings[option]=element.getAttribute(pname);
            }
        }

        return settings;
    };

    addtocalendar.load = ready(function () {

        var calendarsUrl = {
            'iCalendar':'ical',
            'Google Calendar':'google',
            'Outlook':'outlook',
            'Outlook Online':'outlookonline',
            'Yahoo! Calendar':'yahoo'
        };
        var utz = (-(new Date()).getTimezoneOffset().toString());

        var languages = addtocalendar.languages;

        var dom = document.getElementsByTagName('*');
        for (var tagnum = 0; tagnum < dom.length; tagnum++) {
            var tag_class = dom[tagnum].className;

            if (tag_class.length && tag_class.split(" ").indexOf('addtocalendar') != -1) {

                var settings = addtocalendar.loadSettings(dom[tagnum]);

                var protocol = 'http:';
                if(settings['secure'] == 'auto'){
                    protocol = location.protocol == 'https:' ? 'https:' : 'http:';
                } else if(settings['secure'] == 'true'){
                    protocol = 'https:';
                }

                var tag_id = dom[tagnum].id;
                var atc_button_title = languages['en'];
                if(settings['language'] == 'auto'){
                    var user_lang = "no_lang";
					if (typeof navigator.language === "string") {
					    user_lang = navigator.language.substr(0, 2)
					} else if (typeof navigator.browserLanguage === "string") {
					    user_lang = navigator.browserLanguage.substr(0, 2)
					}

                    if(languages.hasOwnProperty(user_lang)){
                        atc_button_title = languages[user_lang];
                    }
                }else if(languages.hasOwnProperty(settings['language'])){
                    atc_button_title = languages[settings['language']];
                }

                var url_paramteres = [
                    'utz=' + utz,
                    'uln=' + navigator.language,
                    'vjs=' + atc_version
                ];

                var addtocalendar_div = dom[tagnum].getElementsByTagName('var');
                var event_number = -1;
                for (var varnum = 0; varnum < addtocalendar_div.length; varnum++) {
                    var param_name = addtocalendar_div[varnum].className.replace("atc_","").split(" ")[0];
                    var param_value = addtocalendar_div[varnum].innerHTML;

                    if(param_name == 'event'){
                        event_number++;
                        continue;
                    }

                    if(param_name == addtocalendar_div[varnum].className){
                        if(param_name == 'atc-body'){
                            atc_button_title = param_value;
                        }
                        continue;
                    }

                    if(event_number == -1){
                        continue;
                    }

                    url_paramteres.push('e['+event_number+']['+param_name+']' + '=' + encodeURIComponent(param_value));
                }


                var atcb_link_id_val = (tag_id == ''?'':(tag_id + '_link') );
                var atcb_list = document.createElement('ul');
                atcb_list.className = 'atcb-list';

                var menu_links = '';
                for (var cnum in settings['calendars']){
                    if(!calendarsUrl.hasOwnProperty(settings['calendars'][cnum])){
                        continue;
                    }
                    var cal_id = calendarsUrl[settings['calendars'][cnum]];
                    var atcb_cal_link_id = (tag_id == '' ? '' : ('id="'+tag_id + '_' + cal_id + '_link"') );
                    menu_links += '<li class="atcb-item"><a '+atcb_cal_link_id+' class="atcb-item-link" href="' 
						+ (cal_id=='ical' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream ? 'webcal:' : protocol)
						+ atc_url
						+ cal_id + '?' + url_paramteres.join('&')
						+ '" target="_blank">' + settings['calendars'][cnum] + '</a></li>';
                }
                atcb_list.innerHTML = menu_links;

                if(dom[tagnum].getElementsByClassName('atcb-link')[0] == undefined){
                    var atcb_link = document.createElement('a');
                    atcb_link.className = 'atcb-link';
                    atcb_link.innerHTML = atc_button_title;
                    atcb_link.id = atcb_link_id_val;
                    atcb_link.tabIndex = 1;

                    dom[tagnum].appendChild(atcb_link);
                    dom[tagnum].appendChild(atcb_list);
                }else{
                    var atcb_link = dom[tagnum].getElementsByClassName('atcb-link')[0];
                    atcb_link.parentNode.appendChild(atcb_list);
                    atcb_link.tabIndex=1;
                    if(atcb_link.id == ''){
                        atcb_link.id = atcb_link_id_val;
                    }
                }

                dom[tagnum]
                    .getElementsByClassName('atcb-link')[0]
                    .addEventListener("click", settings['on-button-click'], false);

                var item_links = dom[tagnum].getElementsByClassName('atcb-item-link');

                for (var varnum = 0; varnum < item_links.length; varnum++) {
                    item_links[varnum].addEventListener("click", settings['on-calendar-click'], false);
                }

            }
        }
    });
})(window, document);
