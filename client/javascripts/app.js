 var getTVprogramByDate = function(tabObjects, date) { 
     console.log(date)
    var $main_tabs_cells = $(".main-tabs-cells");
    var $main_tabs_cell, $main_channel_box, $main_event_box_element;
    var $main_channel_logo, $main_channel_name;
    var $main_event_time, $main_event_name;
    //цикл по телепрограмме на определенную дату
    (tabObjects[date].schedule).forEach(function(channel) {
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
        $main_channel_name.append(($("<a>").attr("href", "#")).text(channel.channel_name));
        $main_channel_box.append($main_channel_name);
        //добавление блока с логотипом и названием канала в основной блок канала
        $main_tabs_cell.append($main_channel_box);
        //цикл по телепрограмме определенного канала
        (channel.channel_events).forEach(function(channel_event) {
            //блок с временем и названием передачи
            $main_event_box_element = $("<div>").addClass("main-event-box-element");
            $main_event_box_element.attr("genre", channel_event.tv_show_genre);
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
	        if ($element.parent().is(":nth-child(1)")) { 
                getTVprogramByDate(tabObjects, 0);
	        } 
            else if ($element.parent().is(":nth-child(2)")) { 
                getTVprogramByDate(tabObjects, 1);
	        } 
            else if ($element.parent().is(":nth-child(13)")) { 
                getTVprogramByDate(tabObjects, 2);
	        }
            getShowByGenre();
            return false;
	    });
    })
    $(".main-tabs-items a span.today").trigger("click");
    
};

$(document).ready(function () { 
	$.getJSON("/data.json", function (tabObjects) { 
		main(tabObjects); 
	}); 
});