//текущая дата
var currentDate = new Date;
//словать вида: "День недели, число": "ГГГГ-ММ-ДД" 
var datesDictionary = new Map();
var currentTabText, tabContent;
var flag = false

//функция получения даты в формате "ГГГГ-MM-ДД"
var dateToString = function(date) {
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    return [date.getFullYear(),
        (mm>9 ? '' : '0') + mm,
        (dd>9 ? '' : '0') + dd
       ].join('-');
};

//функция формирования вкладок
var creationOfTabs = function() {
    var daysOfWeek = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    //добавление вчерашней даты в словарь
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var textYesterdayDate = dateToString(yesterday);
    datesDictionary.set(daysOfWeek[yesterday.getDay()] + ", " + yesterday.getDate(), textYesterdayDate);
    //добавление сегодняшней даты в словарь
    var textCurrentDate = dateToString(currentDate);
    datesDictionary.set(daysOfWeek[currentDate.getDay()] + ", " + currentDate.getDate(), textCurrentDate);
    //добавление дат на следующую неделю в словарь
    var date = new Date();
    var textDate;
    for (var i = 0; i < 7; i ++) {
        date.setDate(date.getDate() + 1);
        textDate = dateToString(date);
        datesDictionary.set(daysOfWeek[date.getDay()] + ", " + date.getDate(), textDate);
    }
    //map iterator с ключами словаря
    var days = datesDictionary.keys();
    //формирование вкладок на странице
    $(".main-tabs-items span").toArray().forEach(function (span_element) {
        $(span_element).text(days.next().value);
    });
}

//функция формирования содержания вкладки
var getTVprogramByDate = function() {
    //поиск нужного документа на заданную дату
    var currentSchedule = null;
    tabContent.forEach(function(tabObject){
        if ((tabObject.date).split("T")[0] == datesDictionary.get(currentTabText)) {
            currentSchedule = tabObject;
        }
    });
    var $main_tabs_cells = $(".main-tabs-cells");
    var $main_tabs_cell, $main_channel_box, $main_event_box_element;
    var $main_channel_logo, $main_channel_name;
    var $main_event_time, $main_event_name;
    //в случае удачного поиска
    if (currentSchedule != null) {
        //цикл по телепрограмме на определенную дату
        (currentSchedule.schedule).forEach(function(channel_object) {
            //основной блок канала
            $main_tabs_cell = $("<div>").addClass("main-tabs-cell");
            //блок с логотипом и названием канала
            $main_channel_box = $("<div>").addClass("main-channel-box");
            //добавление логотипа канала
            $main_channel_logo = $("<div>").addClass("main-channel-logo");
            $main_channel_logo.append($("<img>").attr("src", "img/tv-logo.png"));
            $main_channel_box.append($main_channel_logo);
            //добавление названия канала
            $main_channel_name =  $("<div>").addClass("main-channel-name");
            $main_channel_name.append(($("<a>").attr("href", "#channel")).text(channel_object.channel));
            $main_channel_box.append($main_channel_name);
            //добавление блока с логотипом и названием канала в основной блок канала
            $main_tabs_cell.append($main_channel_box);
            //цикл по телепрограмме определенного канала
            (channel_object.events).forEach(function(channel_event_object) {
                //блок с временем и названием передачи
                $main_event_box_element = $("<div>").addClass("main-event-box-element");
                //добавление времени пsередачи
                $main_event_time = $("<div>").addClass("main-event-time");
                $main_event_time.append($("<time>").text(channel_event_object.event_time.slice(11,16)));
                $main_event_box_element.append($main_event_time);
                //добавление названия передачи
                $main_event_name =  $("<div>").addClass("main-event-name");
                $main_event_name.append(($("<a>").attr("href", "#tv_show")).text(channel_event_object.event_name));
                $main_event_box_element.append($main_event_name);
                //добавление блока с временем и названием передачи в основной блок канала
                $main_tabs_cell.append($main_event_box_element);
            });
            //добавление основного блока канала в блок вкладки
            $main_tabs_cells.append($main_tabs_cell);
        });
    }
    //иначе
    else {
        $main_tabs_cells.append($("<h2>").append(($("<i>").text("Телепрограмма еще не загружена. Приносим извинения!"))));
        $main_tabs_cells.append($("<img>").attr("src", "img/warning.png").css({'width': '15%', 'height': '15%'}));
    }
};

//функция отображения на странице каналов, соответствующих тематике, выбранной в селекторе
var selectChannelByTopic = function(channels) {
    $(".main-tabs-cells").empty();
    getTVprogramByDate();
    $(".main-channel-name a").toArray().forEach(function(elem){
        channels.forEach(function(channel){
            if (channel.channel_name != $(elem).text()){
                $(elem).parent().parent().parent().remove();
            }
        });
    });
    if ($(".main-tabs-cell").toArray().length == 0) {
        $(".main-tabs-cells").empty();
        $(".main-tabs-cells").append($("<h2>").append(($("<i>").text("Каналы с данной тематикой не найдены!"))));
        $(".main-tabs-cells").append($("<img>").attr("src", "img/no-results.png").css({'width': '15%', 'height': '15%'}));
    }
};

//функция получения каналов из БД согласно выбранной тематике
var getChannelsByTopic = function () {
    var $channel_selected_option;
    $("#channel-select").change(function(){
        $channel_selected_option = $("#channel-select option:selected");
        if ($channel_selected_option.text() == "Все каналы") {
            $(".main-tabs-cells").empty();
            getTVprogramByDate();
        }
        else {
            $.get("/channels/" + $channel_selected_option.text(), function(channels) {
                if (channels.length > 0) {
                    selectChannelByTopic(channels);
                }
                else {
                    $(".main-tabs-cells").empty();
                    $(".main-tabs-cells").append($("<h2>").append(($("<i>").text("Каналы с данной тематикой не найдены!"))));
                    $(".main-tabs-cells").append($("<img>").attr("src", "img/no-results.png").css({'width': '15%', 'height': '15%'}));
                }
            });
        }
        $("#tv-show-select").change();
    });
};

//функция выделения на странице тепередач, соответствующих жанру, выбранному в селекторе
var selectTVShowbyGenre = function(tv_shows) {
    $(".main-event-name a").toArray().forEach(function(elem){
        tv_shows.forEach(function(tv_show){
            if (tv_show.tv_show_name == $(elem).text()){
                $(elem).parent().parent().css({'background': 'red'});
            }
         });
    });
};

//функция получения телепередач из БД согласно выбранному жанру
 var getTVShowsByGenre = function() {
    var $tv_show_selected_option;
    $("#tv-show-select").change(function(){
        $(".main-event-box-element").css({'background':'#01D8DD'});
        $tv_show_selected_option = $("#tv-show-select option:selected");
        $.get("/tv_shows/" + $tv_show_selected_option.text(), function(tv_shows) {
            if (tv_shows.length > 0) {
                selectTVShowbyGenre(tv_shows);
            }
        });
    });
 };     

 //функция создания всплывающего окна при поиске
var getPopupContent = function(value) {
    var today;
    $.get("/channel/" + value.toUpperCase(), function(channel) {
        if (channel.length > 0) {
            $(".popup-content").append(($("<div class = 'popup-info-text'>").append($("<h2>").text("Название телеканала"))));
            $(".popup-content").append(($("<div class = 'popup-center-info'>").append($("<h3>").text(channel[0].channel_name))));
            $(".popup-content").append(($("<div class = 'popup-info-text'>").append($("<h2>").text("Тематика"))));
            $(".popup-content").append(($("<div class = 'popup-center-info'>").append($("<h3>").text(channel[0].channel_topics))));
            $(".popup-content").append(($("<div class = 'popup-info-text'>").append($("<h2>").text("Описание"))));            
            $(".popup-content").append(($("<div class = 'popup-left-info'>").append($("<h3>").text(channel[0].channel_description))));
            $(".popup-content").append(($("<div class = 'popup-info-text'>").append($("<h2>").text("Расписание на сегодняшний день"))));
            today = dateToString(currentDate);
            $.get("/schedule/" + today, function(today_schedule) {
                if (today_schedule.length > 0) {
                    today_schedule[0].schedule.forEach(function(channel_object) {
                        if (channel_object.channel==channel[0].channel_name) {
                            $(".popup-content").append(($("<div class = 'popup-left-info'>").append($("<ul>"))));
                            channel_object.events.forEach(function(event_object) {
                                $(".popup-left-info ul").append(($("<h3>").append($("<li>").text(event_object.event_time.slice(11,16) + " — " + event_object.event_name))));
                            });
                        }
                    });
                }
                else {
                    $(".popup-content").append(($("<div class = 'popup-center-info'>").append($("<h3>").text("Для данного телеканала расписание на сегодня отстутствует"))));
                }
            });
        }
        else {
            $.get("/tv_show/" + value, function(tv_show) {
                if (tv_show.length > 0) {
                    $(".popup-content").append(($("<div class = 'popup-info-text'>").append($("<h2>").text("Название телепередачи"))));
                    $(".popup-content").append(($("<div class = 'popup-center-info'>").append($("<h3>").text(tv_show[0].tv_show_name))));
                    $(".popup-content").append(($("<div class = 'popup-info-text'>").append($("<h2>").text("Жанр"))));
                    $(".popup-content").append(($("<div class = 'popup-center-info'>").append($("<h3>").text(tv_show[0].tv_show_genre))));
                    $(".popup-content").append(($("<div class = 'popup-info-text'>").append($("<h2>").text("Описание"))));            
                    $(".popup-content").append(($("<div class = 'popup-left-info'>").append($("<h3>").text(tv_show[0].tv_show_description))));
                    $(".popup-content").append(($("<div class = 'popup-info-text'>").append($("<h2>").text("Возрастное ограничение"))));
                    $(".popup-content").append(($("<div class = 'popup-center-info'>").append($("<h3>").text(tv_show[0].tv_show_age))));
                    $(".popup-content").append(($("<div class = 'popup-info-text'>").append($("<h2>").text("В сегодняшней телепрограмме"))));
                    today = dateToString(currentDate);
                    $.get("/schedule/" + today, function(today_schedule) {
                        var isFind = false;
                        if (today_schedule.length > 0) {
                            today_schedule[0].schedule.forEach(function(channel_object) {
                                channel_object.events.forEach(function(event_object) {
                                    if (event_object.event_name == tv_show[0].tv_show_name) {
                                        $(".popup-content").append(($("<div class = 'popup-left-info'>").append($("<h3>").text(event_object.event_time.slice(11,16) + " — " + event_object.event_name +  " (на телеканале «" + channel_object.channel + "»)"))));
                                        isFind = true;
                                    }
                                });
                            });
                        }
                        else if (today_schedule.length == 0 || !isFind) {
                            $(".popup-content").append(($("<div class = 'popup-center-info'>").append($("<h3>").text("Данная телепередача сегодня не транслируется"))));
                        }
                    });
                }
                else {
                    $(".popup-content").remove();
                    $(".popup").append($("<div class='popup-no-content'>"));
                    $(".popup-no-content").append($("<div class = 'popup-not-found-image'>").append($("<img src='img/not-found.png'>")));
                    $(".popup-no-content").append(($("<div>").append($("<h2>").text("По запросу " + value + " ничего не найдено!"))));
                }
            });
        }
    });
}

 var main = function () { 
    "use strict";
    $("#tv-show-select").attr("selected", null);
    $("#tv-show-select option:nth-child(1)").attr("selected", "selected");
    $("#channel-select").attr("selected", null);
    $("#channel-select option:nth-child(1)").attr("selected", "selected");
    $(".main-tabs-items a span").toArray().forEach(function (element) {
	    $(element).on("click", function () {
	        var $element = $(element);
	        $(".main-tabs-items a span").removeClass("active");
            $(".main-tabs-items a").removeClass("active");
            $(element).parent().addClass("active"); 
	        $(element).addClass("active");
	        $("main .main-tabs-cells").empty();
            currentTabText = $element.text();
            getTVprogramByDate(tabContent, currentTabText);
            $("#channel-select").change();
            return false;
	    });
    });
    getTVShowsByGenre();
    getChannelsByTopic();
    $(document).on('click', "a[href='#channel']", function(e) {
        $(".popup").append($("<div class='popup-content'>"));
        e.preventDefault();
        $('.popup-bg').fadeIn(800);
        $('html').addClass('no-scroll');
        $.get("/channel/" + $(this).text(), function(channel) {
            if (channel.length > 0) {
                $(".popup-content").append(($("<div class = 'popup-info-text'>").append($("<h2>").text("Название телеканала"))));
                $(".popup-content").append(($("<div class = 'popup-center-info'>").append($("<h3>").text(channel[0].channel_name))));
                $(".popup-content").append(($("<div class = 'popup-info-text'>").append($("<h2>").text("Тематика"))));
                $(".popup-content").append(($("<div class = 'popup-center-info'>").append($("<h3>").text(channel[0].channel_topics))));
                $(".popup-content").append(($("<div class = 'popup-info-text'>").append($("<h2>").text("Описание"))));            
                $(".popup-content").append(($("<div class = 'popup-left-info'>").append($("<h3>").text(channel[0].channel_description))));
            }
        });
    });
    $(document).on('click', "a[href='#tv_show']", function(e) {
        $(".popup").append($("<div class='popup-content'>"));
        e.preventDefault();
        $('.popup-bg').fadeIn(800);
        $('html').addClass('no-scroll');
        $.get("/tv_show/" + $(this).text(), function(tv_show) {
            if (tv_show.length > 0) {
                $(".popup-content").append(($("<div class = 'popup-info-text'>").append($("<h2>").text("Название телепередачи"))));
                $(".popup-content").append(($("<div class = 'popup-center-info'>").append($("<h3>").text(tv_show[0].tv_show_name))));
                $(".popup-content").append(($("<div class = 'popup-info-text'>").append($("<h2>").text("Жанр"))));
                $(".popup-content").append(($("<div class = 'popup-center-info'>").append($("<h3>").text(tv_show[0].tv_show_genre))));
                $(".popup-content").append(($("<div class = 'popup-info-text'>").append($("<h2>").text("Описание"))));            
                $(".popup-content").append(($("<div class = 'popup-left-info'>").append($("<h3>").text(tv_show[0].tv_show_description))));
                $(".popup-content").append(($("<div class = 'popup-info-text'>").append($("<h2>").text("Возрастное ограничение"))));
                $(".popup-content").append(($("<div class = 'popup-center-info'>").append($("<h3>").text(tv_show[0].tv_show_age))));
            }
        });  
    });
    $('.open-popup').click(function(e) {
        e.preventDefault();
        $('.popup-bg').fadeIn(800);
        $('html').addClass('no-scroll');
        if ($(".input-field").val() == "") {
            $(".popup").append($("<div class='popup-no-content'>"));
            $(".popup-no-content").append($("<div class = 'popup-not-found-image'>").append($("<img src='img/not-found.png'>")));
            $(".popup-no-content").append(($("<div>").append($("<h2>").text("В поле поиска ничего не было введено!"))));
        }
        else {
            $(".popup").append($("<div class='popup-content'>"));
            getPopupContent($(".input-field").val());
        }
    });
    $('.close-popup').click(function() {
        $('.popup-bg').fadeOut(800);
        $('html').removeClass('no-scroll');
        $(".popup-content").remove();
        $(".popup-no-content").remove();
        $(".input-field").val("");
    });
    $(".main-tabs-items a span.today").trigger("click");
};

$(document).ready(function () {
	$.getJSON("/data.json", function (tabObjects) { 
        tabContent = tabObjects;
        creationOfTabs();
		main(tabContent); 
	}); 
});