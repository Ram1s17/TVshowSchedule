//текущая дата
var currentDate = new Date;
//словать вида: "День недели, число": "ГГГГ-ММ-ДД" 
var datesDictionary = new Map();

//функция формирования вкладок
var creationOfTabs = function() {
    var daysOfWeek = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    //добавление вчерашней даты в словарь
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var textYesterdayDate = yesterday.toISOString().split('T')[0];
    datesDictionary.set(daysOfWeek[yesterday.getDay()] + ", " + yesterday.getDate(), textYesterdayDate);
    //добавление сегодняшней даты в словарь
    var textCurrentDate = currentDate.toISOString().split('T')[0];
    datesDictionary.set(daysOfWeek[currentDate.getDay()] + ", " + currentDate.getDate(), textCurrentDate);
    //добавление дат на следующую неделю в словарь
    var date = new Date();
    var textDate;
    for (var i = 0; i < 7; i ++) {
        date.setDate(date.getDate() + 1);
        textDate = date.toISOString().split('T')[0];
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
var getTVprogramByDate = function(tabObjects, textOfTab) {
    //поиск нужного документа на заданную дату
    var currentSchedule = null;
    tabObjects.forEach(function(tabObject){
        if ((tabObject._id).split("T")[0] == datesDictionary.get(textOfTab)) {
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
            $main_channel_name.append(($("<a>").attr("href", "#")).text(channel_object.channel));
            $main_channel_box.append($main_channel_name);
            //добавление блока с логотипом и названием канала в основной блок канала
            $main_tabs_cell.append($main_channel_box);
            //цикл по телепрограмме определенного канала
            (channel_object.events).forEach(function(channel_event_object) {
                //блок с временем и названием передачи
                $main_event_box_element = $("<div>").addClass("main-event-box-element");

                //$main_event_box_element.attr("genre", channel_event_object.tv_show_genre);

                //добавление времени передачи
                $main_event_time = $("<div>").addClass("main-event-time");
                $main_event_time.append($("<time>").text(channel_event_object.event_time.slice(11,16)));
                $main_event_box_element.append($main_event_time);
                //добавление названия передачи
                $main_event_name =  $("<div>").addClass("main-event-name");
                $main_event_name.append(($("<a>").attr("href", "#")).text(channel_event_object.event_name));
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

 var getShowByGenre = function() {
    var $tv_show_selected_option;
    $("#tv-show-select").change(function(){
        $(".main-event-box-element").css({'background':'#01D8DD'})
        $tv_show_selected_option = $("#tv-show-select option:selected");
        $(".main-event-box-element").toArray().forEach(function(elem){
            if($(elem).attr("genre") == $tv_show_selected_option.text()){
                $(elem).css({'background': 'red'});
            }
        });
    });
 };
 
 var main = function (tabObjects) { 
    "use strict";
    $("#tv-show-select").attr("selected", null);
    $("#tv-show-select option:nth-child(1)").attr("selected", "selected");
    $(".main-tabs-items a span").toArray().forEach(function (element) {
	    $(element).on("click", function () {
	        var $element = $(element);
	        $(".main-tabs-items a span").removeClass("active");
            $(".main-tabs-items a").removeClass("active");
            $(element).parent().addClass("active"); 
	        $(element).addClass("active");
	        $("main .main-tabs-cells").empty();
            getTVprogramByDate(tabObjects, $element.text());
            //getShowByGenre();
            return false;
	    });
    })
    $(".main-tabs-items a span.today").trigger("click");
    
};

$(document).ready(function () { 
	$.getJSON("/data.json", function (tabObjects) { 
        creationOfTabs();
		main(tabObjects); 
	}); 
});