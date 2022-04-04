 var main = function (tabObjects) { 
    "use strict";
    var $main_tabs_cells = $(".main-tabs-cells");
    var $main_tabs_cell, $main_channel_box, $main_event_box_element;
    var $main_channel_logo, $main_channel_name;
    var $main_event_time, $main_event_name;
    //основной цикл
    tabObjects.forEach(function(tabObject) {
        //цикл по телепрограмме на определенную дату
        (tabObject.schedule).forEach(function(channel) {
            //основной блок канала
            $main_tabs_cell = $("<div>").addClass("main-tabs-cell");
            //блок с логотипом и названием канала
            $main_channel_box = $("<div>").addClass("main-channel-box");
            //добавление логотипа канала
            $main_channel_logo = $("<div>").addClass("main-channel-logo");
            $main_channel_logo.append($("<img>").attr("src", "../images/tv-logo.png"));
            $main_channel_box.append($main_channel_logo);
            //добавление названия канала
            $main_channel_name =  $("<div>").addClass("main-channel-name");
            $main_channel_name.append(($("<a>").attr("href", "#")).text(channel.channel_name));
            $main_channel_box.append($main_channel_name);
            //добавление блока с логотипом и названием канала в основной блок канала
            $main_tabs_cell.append($main_channel_box);
            //цикл по телепрограмме определенного канала
            (channel.channel_events).forEach(function(channel_event) {
                //блок с временем и названием передачи
                $main_event_box_element = $("<div>").addClass("main-event-box-element");
                //добавление времени передачи
                $main_event_time = $("<div>").addClass("main-event-time");
                $main_event_time.append($("<time>").text(channel_event.tv_show_time));
                $main_event_box_element.append($main_event_time);
                 //добавление названия передачи
                $main_event_name =  $("<div>").addClass("main-event-name");
                $main_event_name.append(($("<a>").attr("href", "#")).text(channel_event.tv_show_name));
                $main_event_box_element.append($main_event_name);
                //добавление блока с временем и названием передачи в основной блок канала
                $main_tabs_cell.append($main_event_box_element);
            });
            //добавление основного блока канала в блок вкладки
            $main_tabs_cells.append($main_tabs_cell);
        }); 
    });
};

$(document).ready(function () { 
	$.getJSON("../scripts/data.json", function (tabObjects) { 
		main(tabObjects); 
	}); 
});