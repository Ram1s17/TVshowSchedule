//текущая дата
var currentDate = new Date;
//словать вида: "День недели, число": "ГГГГ-ММ-ДД" 
var datesDictionary = new Map();
//словарь вида: "Канал": [["Время": "Событие"]]
var busyTimesDictionary = new Map();

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
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var textYesterdayDate = dateToString(yesterday);
    datesDictionary.set(daysOfWeek[yesterday.getDay()] + ", " + yesterday.getDate(), textYesterdayDate);
    var textCurrentDate = dateToString(currentDate);
    datesDictionary.set(daysOfWeek[currentDate.getDay()] + ", " + currentDate.getDate(), textCurrentDate);
    var date = new Date();
    var textDate;
    for (var i = 0; i < 7; i ++) {
        date.setDate(date.getDate() + 1);
        textDate = dateToString(date);
        datesDictionary.set(daysOfWeek[date.getDay()] + ", " + date.getDate(), textDate);
    }
};

//функция получения расписания на опредленную дату
var getTVprogramByDate = function(scheduleElement) {
    busyTimesDictionary.clear();
    var $main_tabs_cells = $(".schedule-list");
    var $main_tabs_cell, $main_channel_box, $main_event_box_element;
    var $main_channel_logo, $main_channel_name;
    var $main_event_time, $main_event_name;
    var timeAndEventArray = [];
    if (scheduleElement.length != 0) {
        (scheduleElement[0].schedule).forEach(function(channel_object) {
            //основной блок канала
            $main_tabs_cell = $("<div>").addClass("main-tabs-cell");
            //блок с логотипом и названием канала
            $main_channel_box = $("<div>").addClass("main-channel-box");
            //добавление логотипа канала
            $main_channel_logo = $("<div>").addClass("main-channel-logo");
            $main_channel_logo.append($("<img>").attr("src", "/img/tv-logo.png"));
            $main_channel_box.append($main_channel_logo);
            //добавление названия канала
            $main_channel_name =  $("<div>").addClass("main-channel-name");
            $main_channel_name.append(($("<a>").attr("href", "#channel")).text(channel_object.channel));
            $main_channel_box.append($main_channel_name);
            //добавление блока с логотипом и названием канала в основной блок канала
            $main_tabs_cell.append($main_channel_box);
            
            (channel_object.events).sort(function(a,b){
                return new Date(a.event_time) - new Date(b.event_time);
            });

            //цикл по телепрограмме определенного канал
            (channel_object.events).forEach(function(channel_event_object) {
                //блок с временем и названием передачи
                $main_event_box_element = $("<div>").addClass("main-event-box-element");
                //добавление времени передачи
                $main_event_time = $("<div>").addClass("main-event-time");
                $main_event_time.append($("<time>").text(channel_event_object.event_time.slice(11,16)));
                $main_event_box_element.append($main_event_time);
                //добавление названия передачи
                $main_event_name =  $("<div>").addClass("main-event-name");
                $main_event_name.append(($("<a>").attr("href", "#tv_show")).text(channel_event_object.event_name));
                $main_event_box_element.append($main_event_name);
                //добавление блока с временем и названием передачи в основной блок канала
                $main_tabs_cell.append($main_event_box_element);
                
                timeAndEventArray.push([channel_event_object.event_time.slice(11,16), channel_event_object.event_name]);
            });

            busyTimesDictionary.set(channel_object.channel, timeAndEventArray);

            //добавление основного блока канала в список
            $main_tabs_cells.append($main_tabs_cell);
        });
    }
    else {
        var $main_tabs_no_schedule = $("<div class='main-tabs-no-schedule'>");
        $main_tabs_cells.append($main_tabs_no_schedule);
        $main_tabs_no_schedule.append($("<img>").attr("src", "/img/warning.png").css({'width': '50%', 'height': '50%'}));
        $main_tabs_no_schedule.append($("<h2>").append(($("<i>").text("Телепрограмма отсутствует!"))));
    }
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
                var isFind = false;
                if (today_schedule.length > 0) {
                    today_schedule[0].schedule.forEach(function(channel_object) {
                        if (channel_object.channel==channel[0].channel_name) {
                            $(".popup-content").append(($("<div class = 'popup-left-info'>").append($("<ul>"))));
                            channel_object.events.forEach(function(event_object) {
                                $(".popup-left-info ul").append(($("<h3>").append($("<li>").text(event_object.event_time.slice(11,16) + " — " + event_object.event_name))));
                            });
                            isFind = true;
                        }
                    });
                }
                if (today_schedule.length == 0 || !isFind) {
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
                        if (today_schedule.length == 0 || !isFind) {
                            $(".popup-content").append(($("<div class = 'popup-center-info'>").append($("<h3>").text("Данная телепередача сегодня не транслируется"))));
                        }
                    });
                }
                else {
                    $(".popup-content").remove();
                    $(".popup").append($("<div class='popup-no-content'>"));
                    $(".popup-no-content").append($("<div class = 'popup-not-found-image'>").append($("<img src='/img/not-found.png'>")));
                    $(".popup-no-content").append(($("<div>").append($("<h2>").text("По запросу ­«" + value + "» ничего не найдено!"))));
                }
            });
        }
    });
};

var addEventToChannel = function(schedule, channelName){
    $(".cancel-button").attr('disabled', true); 
    $(".cancel-сhannel-button").attr('disabled', false); 
    $(".search-channel-button").attr('disabled', true);
    $(".delete-channel-button").attr('disabled', true);
    $("#channel-select").attr('disabled', true);
    $.getJSON("/tv_shows.json", function (tv_shows) {
        tv_shows.forEach(function(tv_show){
            $("#event-select").append($("<option value=''>").text(tv_show.tv_show_name));
        });
        $("#event-select").attr("selected", null);
        $("#event-select option:nth-child(1)").attr("selected", "selected");
        var $event_selected_option, eventName = $("#event-select option:selected").text();
        $("#event-select").change(function(){
            $event_selected_option = $("#event-select option:selected");
            eventName = $event_selected_option.text();
        });
        var selected_time = $("#event-time").val();
        $("#event-time").change(function(){
            selected_time = $("#event-time").val();
        });
        $(".add-event-button").on("click", function() {
            var input_array = [], isInvalidInput;
            var event_time = selected_time;
            input_array.push(event_time);
            var event_name = eventName;
            input_array.push(event_name);
            input_array.forEach(function(value){
                if (!(value !== null && value.trim() !== "")) {
                    isInvalidInput = true;
                }
            });
            if (isInvalidInput) {
                alert("Присутствует незаполненное поле! Попробуйте еще раз!");
            }
            if (busyTimesDictionary.has(channelName)) {
                var events_array = busyTimesDictionary.get(channelName);
                for (var i = 0; i < events_array.length; i++) {
                    if (events_array[i].includes(event_time)) {
                        alert("На " + event_time + " уже есть событие! Попробуйте еще раз!");
                        isInvalidInput = true;
                        break;
                    }
                }
            }
            if (!isInvalidInput) {
                var newEventForChannel = {
                    "date": $("#input-date-field").val(),
                    "channel": channelName,
                    "event_time": $("#input-date-field").val() + "T" + input_array[0] + ":00Z",
                    "event_name": input_array[1]
                };
                if (schedule == null) {
                    $.post("/channel_and_event", newEventForChannel, function() {
                        $("#channel-select").attr('disabled', false);
                        $(".search-channel-button").attr('disabled', false);
                        $(".delete-channel-button").attr('disabled', false);
                        $(".cancel-button").attr('disabled', false);
                        $(".cancel-сhannel-button").attr('disabled', true);  
                    }).done(function(response) {
                        alert('Новое событие для телеканала «'+ channelName +'» успешно добавлено!');
                        $(".subpanel-block").remove();
                        $("#input-date-field").change();
                    }).fail(function(jqXHR, textStatus, error) {
                        alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);
                    });
                }
                else {
                    $.post("/event", newEventForChannel, function() {
                        $("#event-time").val("");
                    }).done(function(response) {
                        alert('Новое событие для телеканала «'+ channelName +'» успешно добавлено!');
                        $(".search-channel-button").trigger("click");    
                        $("#input-date-field").change();
                    }).fail(function(jqXHR, textStatus, error) {
                        alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);
                    });
                }
            }
        });
    });
    
};

//формирование вкладки управления расписанием
var createScheduleTab = function() {
    $(".main-tab-body").append($("<div class='main-schedule-panel'><h2>ПАНЕЛЬ УПРАВЛЕНИЯ</h2>" +
                                "<form class='schedule-form'><input type='date' id='input-date-field' placeholder='Дата'  title='Дата'value=" + dateToString(currentDate) +">" + 
                                "<button class='search-schedule-button'>Найти</button>" +
                                "<button class='delete-schedule-button'>Удалить</button>" +
                                "<button class='cancel-button'>Отмена</button></form></div>"));
    $(".cancel-button").attr('disabled', true);                      
    $.get("/schedule/" + $("#input-date-field").val(), function(schedule) {
        getTVprogramByDate(schedule);
    });                          
    $("#input-date-field").change(function() {
        if ($("#input-date-field").val() != '') {
            $.get("/schedule/" + $("#input-date-field").val(), function(schedule) {
                $(".schedule-list").empty();
                getTVprogramByDate(schedule);
            });
        }
        else {
            $(".schedule-list").empty();
        }
         
    });
    $(".cancel-button").on("click", function(e) { 
        e.preventDefault();
        $(".cancel-button").attr('disabled', true);
        $("#input-date-field").attr('disabled', false);
        $(".search-schedule-button").attr('disabled', false);
        $(".delete-schedule-button").attr('disabled', false);
        $(".panel-block").remove();
    });
    $(".search-schedule-button").on("click", function(e) { 
        e.preventDefault();
        $(".cancel-button").attr('disabled', false);
        if ( $("#input-date-field").val() == '') {
            alert("Пожалуйста, выберите дату!")
        }
        else {
            $("#input-date-field").attr('disabled', true);
            $(".search-schedule-button").attr('disabled', true);
            $(".delete-schedule-button").attr('disabled', true);
            $(".panel-block").remove();
            $(".main-schedule-panel").append($("<div class='panel-block'>"));
            $(".panel-block").append($("<form class='channel-form'><select name='channel-select' id='channel-select'></form>"));  
            $.getJSON("/channels.json", function (channels) {
                channels.forEach(function(channel){
                    $("#channel-select").append($("<option value=''>").text(channel.channel_name));
                });
                $("#channel-select").attr("selected", null);
                $("#channel-select option:nth-child(1)").attr("selected", "selected");
                var $channel_selected_option, channelName = $("#channel-select option:selected").text();
                $("#channel-select").change(function(){
                    $channel_selected_option = $("#channel-select option:selected");
                    channelName = $channel_selected_option.text();
                });
                $(".channel-form").append($("<button class='search-channel-button'>Найти расписание</button>" +
                                            "<button class='delete-channel-button'>Удалить расписание</button>" +
                                            "<button class='cancel-сhannel-button'>Отмена</button></form>"));
                $(".cancel-сhannel-button").attr('disabled', true);
                $(".cancel-сhannel-button").on("click", function(e) { 
                    e.preventDefault();
                    $(".cancel-сhannel-button").attr('disabled', true);
                    $(".cancel-button").attr('disabled', false);
                    $("#channel-select").attr('disabled', false);
                    $(".search-channel-button").attr('disabled', false);
                    $(".delete-channel-button").attr('disabled', false);
                    $(".subpanel-block").remove();
                });
                $(".search-channel-button").on("click", function(e) {
                    e.preventDefault();
                    $(".subpanel-block").remove();
                    $(".panel-block").append($("<div class='subpanel-block'>"))
                    var body = {date: $("#input-date-field").val(), channel_name: channelName};
                    $.get("/channelByDate", body, function(scheduleOfChannelByDate){
                        $(".subpanel-block").append($("<div class='event-info-block'><input id='event-time' type='time' placeholder='Время' title='Время' value=''>" +
                                                        "<select id='event-select' title='Телепередача'></div>"));
                        $(".subpanel-block").append($("<button class='add-event-button'>Добавить телепередачу</button>"));
                        if (scheduleOfChannelByDate == null) {
                            if (confirm("Телеканал «" + channelName + "» не содержит телепрограмму на "+ $("#input-date-field").val() +". Хотите добавить?")) {
                                addEventToChannel(scheduleOfChannelByDate, channelName);
                            }
                            else {
                                $(".subpanel-block").remove();
                            }
                        }
                        else {
                            addEventToChannel(scheduleOfChannelByDate, channelName);
                            $.getJSON("/tv_shows.json", function (tv_shows) {
                                var i = 0;
                                var countOfEvents = 0;
                                (scheduleOfChannelByDate.schedule[0].events).sort(function(a,b){
                                    return new Date(a.event_time) - new Date(b.event_time);
                                });
                                scheduleOfChannelByDate.schedule[0].events.forEach(function(tv_event){
                                    $(".subpanel-block").append($("<div class='event-block" + i +"' channel_id='" + scheduleOfChannelByDate.schedule[0]._id +"'  event_id='" + tv_event._id +"' num="+ i + ">" + 
                                                            "<input id='time-of-event" + i + "' type='time' placeholder='Время' title='Время' value=''>" +
                                                            "<select id='select-of-event" + i + "' title='Телепередача'></div>"));
                                    $("#time-of-event" + i).val(tv_event.event_time.slice(11,16));
                                    $("#time-of-event" + i).change(function(){
                                        $(this).parent().children(".cancel-event-button").attr("disabled", false);
                                        $(this).parent().children(".delete-event-button").attr("disabled", true);
                                    });
                                    tv_shows.forEach(function(tv_show){
                                        $("#select-of-event" + i).append($("<option value='" + tv_show.tv_show_name + "'>").text(tv_show.tv_show_name));
                                    });
                                    $("#select-of-event" + i  + " option[value='" + tv_event.event_name + "']").prop('selected', true);
                                    $("#select-of-event" + i).change(function(){
                                        $(this).parent().children(".cancel-event-button").attr("disabled", false);
                                        $(this).parent().children(".delete-event-button").attr("disabled", true);
                                    });
                                    $(".event-block" + i).append($("<button class='delete-event-button'>Удалить</button>" +
                                                            "<button class='update-event-button'>Редактировать</button>" +
                                                            "<button class='cancel-event-button'>Отмена</button>"));
                                    i++;
                                    countOfEvents++;
                                });
                                $(".cancel-event-button").attr('disabled', true);
                                $(".delete-event-button").on("click", function(e){
                                    e.preventDefault();
                                    var $event_block = $(this).parent();
                                    var eventTime =  $event_block.children("input").val();
                                    var eventName = $event_block.children("select").children(":selected").val();
                                    if (confirm("Вы уверены, что хотите удалить событие «" + eventTime + " – " + eventName +  "» телеканала «" + channelName + "»?")) {
                                        $.ajax({ 
                                            'url': '/eventOfChannel/' + $("#input-date-field").val(),
                                            'type': 'DELETE',
                                            'data': {"channel_id": $event_block.attr("channel_id"), "event_id": $event_block.attr("event_id"), "count_of_events": countOfEvents},
                                            'success':function (data, status, xhr) {
                                                alert('Cобытие  «' + eventTime + ' – ' + eventName +  '» телеканала «' + channelName + '» успешно удалено!');
                                                if (countOfEvents - 1 > 0) 
                                                    $(".search-channel-button").trigger("click");
                                                else {
                                                    $(".cancel-сhannel-button").attr('disabled', true);
                                                    $(".cancel-button").attr('disabled', false);
                                                    $("#channel-select").attr('disabled', false);
                                                    $(".search-channel-button").attr('disabled', false);
                                                    $(".delete-channel-button").attr('disabled', false);
                                                    $(".subpanel-block").remove();
                                                }
                                                $("#input-date-field").change();
                                            },
                                            'error': function (jqXHR, exception) {
                                                alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);
                                            }
                                        });
                                    }
                                    
                                });
                                $(".update-event-button").on("click", function(e){
                                    e.preventDefault();
                                    var $event_block = $(this).parent();
                                    var num =  $event_block.attr("num");
                                    var newEventTime =  $event_block.children("input").val();
                                    var newEventName = $event_block.children("select").children(":selected").val();
                                    if (newEventTime == busyTimesDictionary.get(channelName)[num][0] && newEventName == busyTimesDictionary.get(channelName)[num][1]) {
                                        alert("Данные события не были изменены!");
                                    }
                                    else {
                                        var isInvalidInput = false;
                                        if (newEventTime != busyTimesDictionary.get(channelName)[num][0]) {                                        
                                            var events_array = busyTimesDictionary.get(channelName);
                                            for (var i = 0; i < events_array.length; i++) {
                                                if (events_array[i].includes(newEventTime)) {
                                                    alert("На " + newEventTime + " уже есть событие! Попробуйте еще раз!");
                                                    $("#time-of-event" + num).val(busyTimesDictionary.get(channelName)[num][0]);
                                                    isInvalidInput = true;
                                                    break;
                                            }
                                        }

                                        }
                                        if (!isInvalidInput) {
                                            $.ajax({ 
                                                'url': '/eventOfChannel/' + $("#input-date-field").val(),
                                                'type': 'PUT',
                                                'data': {
                                                    "channel_id": $event_block.attr("channel_id"), 
                                                    "event_id": $event_block.attr("event_id"),
                                                    "event_time": $("#input-date-field").val() + "T" + newEventTime + ":00Z",
                                                    "event_name": newEventName
                                                },
                                                'success':function (data, status, xhr) {
                                                    alert('Данные события телеканала «' + channelName + '» успешно изменены!');
                                                    $(".search-channel-button").trigger("click");
                                                    $("#input-date-field").change();
                                                },
                                                'error': function (jqXHR, exception) {
                                                    alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);
                                                }
                                            });
                                        }
                                    }
                                });
                                $(".cancel-event-button").on("click", function(e){
                                    e.preventDefault();
                                    $("#input-date-field").change();
                                    var num =  $(this).parent().attr("num");
                                    var $event_block = $(this).parent();
                                    $event_block.children(".cancel-event-button").attr("disabled", true);
                                    $event_block.children(".delete-event-button").attr("disabled", false);
                                    $("#time-of-event" + num).val(busyTimesDictionary.get(channelName)[num][0]);
                                    $("#select-of-event" + num  + " option[value='" + busyTimesDictionary.get(channelName)[num][1] + "']").prop('selected', true);
                                });
                            });
                        }
                    });
    
                });
                $(".delete-channel-button").on("click", function(e) {
                    e.preventDefault();
                    $(".cancel-channel-button").attr('disabled', true);
                    var date = $("#input-date-field").val();
                    var body = {date: $("#input-date-field").val(), channel_name: channelName};
                    $.get("/channelByDate", body, function(schedule){
                        if(schedule != null) {
                            if (confirm("Вы уверены, что хотите удалить телепрограмму  телеканала «" + channelName + "» на " + date + "?")) {
                                $.ajax({ 
                                    'url': '/scheduleOfChannel/' + date,
                                    'type': 'DELETE',
                                    'data': {"channel_name": channelName},
                                    'success':function (data, status, xhr) {
                                        alert('Телепрограмма телеканала «' + channelName + '» на '+ date +' успешно удалена!');
                                        $("#input-date-field").change();
                                    },
                                    'error': function (jqXHR, exception) {
                                        alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);
                                    }
                                });
                            }
                        }
                        else {
                            alert("Для телеканала «" + channelName + "» на " + date + " отсутствует телепрограмма!");
                        }
                    });
                    
                });
            });
        }
    });
    $(".delete-schedule-button").on("click", function(e) {
        e.preventDefault();
        if ( $("#input-date-field").val() == '') {
            alert("Пожалуйста, выберите дату!")
        }
        else {
            var date = $("#input-date-field").val();
            $.get("/schedule/" + date, function(schedule) {
                if(schedule.length != 0) {
                    if (confirm("Вы уверены, что хотите удалить телепрограмму на " + date + "?")) {
                        $.ajax({
                            'url': '/schedule/' + date,
                            'type': 'DELETE',
                        }).done(function(responde) {
                            alert('Телепрограмма на '+ date +' успешно удалена!');
                            $("#input-date-field").change();
                        }).fail(function(jqXHR, textStatus, error) {
                            alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);	
                        });
                    }
                }
                else {
                    alert("Телепрограмма на данную дату отсутствует в системе!");
                }
            });
        }
    });
    $(".main-tab-body").append($("<div class='main-schedule-list'>"));
    $(".main-schedule-list").append($("<h2>Расписание телепередач</h2>"));
    $(".main-schedule-list").append($("<div class='schedule-list'>"));
};

//функция обновления данных телеканала
var updateChannel = function(values_array, input_array) {
    var i = 0, isChanged = false, isInvalidInput = false;
    input_array.forEach(function(value){
        if (!(value !== null && value.trim() !== "")) {
            isInvalidInput = true;
        }
        if (values_array[i] != value){
            isChanged = true;
        }
        i++;
    });
    if (isInvalidInput) {
        alert("Присутствуют незаполненные поля! Попробуйте еще раз!");
    }
    if (!isInvalidInput) {
        if (!isChanged) {
            alert("Данные телеканала не были изменены!");
        }
        else {
            $.ajax({
                'url': '/channel/' + values_array[0],
                'type': 'PUT',
                'data': {
                    'channel_name': input_array[0],
                    'channel_topics': input_array[1],
                    'channel_description': input_array[2]
                }
            }).done(function(responde) {
                alert('Данные телеканала успешно изменены!');
            }).fail(function(jqXHR, textStatus, error) {
                alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);	
            });
            location.reload();
        }
    }
};

//функция формирования вкладки для управления телеканалами
var createChannelsTab = function() {
    $(".main-tab-body").append($("<div class='main-channels-panel'><h2>ПАНЕЛЬ УПРАВЛЕНИЯ</h2>"+
                                "<form class='channel-form'> <input id='input-channel-field' type='text' placeholder='Название телеканала' title='Название телеканала'value=''>" +
                                "<button class='search-channel-button'>Найти</button>" +
                                "<button class='delete-channel-button'>Удалить</button>" +
                                "<button class='cancel-button'>Отмена</button></form></div>"));
    $(".cancel-button").attr('disabled', true);
    $(".cancel-button").on("click", function(e) {
        e.preventDefault();
        $(".cancel-button").attr('disabled', true);
        $("#input-channel-field").attr('disabled', false);
        $(".search-channel-button").attr('disabled', false);
        $(".delete-channel-button").attr('disabled', false);
        $(".panel-block").remove();
    });
    $(".search-channel-button").on("click", function(e) {
        e.preventDefault();
        $(".cancel-button").attr('disabled', false);
        $(".panel-block").remove();
        var channel_name = $("#input-channel-field").val();
        if (channel_name !== null && channel_name.trim() !== "") {
            $.get("/channel/" + channel_name.trim().toUpperCase(), function(channel) {
                $(".main-channels-panel").append($("<div class='panel-block'>"));
                $(".panel-block").append($("<input id='channel-topics-input' type='text' placeholder='Тематика' title='Тематика' value=''>"));
                $(".panel-block").append($("<textarea id='channel-description-textarea' style='resize: none;' placeholder='Описание' rows='15' cols='35' title='Описание'>"));
                if (channel.length != 0) {
                    var values_array = [];
                    $(".search-channel-button").attr('disabled', true);
                    $(".delete-channel-button").attr('disabled', true);
                    $("#channel-topics-input").val(channel[0].channel_topics);
                    $("#channel-description-textarea").text(channel[0].channel_description);
                    $(".panel-block").append($("<button class='update-channel-button'>Изменить</button>"));
                    values_array.push(channel_name.trim().toUpperCase());
                    values_array.push(channel[0].channel_topics);
                    values_array.push(channel[0].channel_description);
                    $(".update-channel-button").on("click", function() {
                        var input_array = [];
                        input_array.push($("#input-channel-field").val().trim().toUpperCase());
                        if (values_array[0] == input_array[0]) {
                            input_array.push($("#channel-topics-input").val().trim());
                            input_array.push($("#channel-description-textarea").val().trim());
                            updateChannel(values_array, input_array);
                        }
                        else {
                            $.get("/channel/" + $("#input-channel-field").val().trim().toUpperCase(), function(tv_channel) {
                                if (tv_channel.length != 0) {
                                    alert("Телеканал с названием «" + $("#input-channel-field").val().trim().toUpperCase() +"» уже существует!");
                                }
                                else {
                                    input_array.push($("#channel-topics-input").val().trim());
                                    input_array.push($("#channel-description-textarea").val().trim());
                                    updateChannel(values_array, input_array);
                                }
                            });
                        }
                    });
                }
                else {
                    if (confirm("Данный телеканал отсутствует в системе. Хотите добавить?")) { 
                        $(".search-channel-button").attr('disabled', true);
                        $(".delete-channel-button").attr('disabled', true);
                        $("#input-channel-field").attr('disabled', true);
                        $(".panel-block").append($("<button class='add-channel-button'>Добавить</button>"));
                        $(".add-channel-button").on("click", function() {
                            var input_array = [], isInvalidInput;
                            var channel_topics = $("#channel-topics-input").val().trim();
                            input_array.push(channel_topics);
                            var channel_description = $("#channel-description-textarea").val().trim();
                            input_array.push(channel_description);
                            input_array.forEach(function(value){
                                if (!(value !== null && value.trim() !== "")) {
                                    isInvalidInput = true;
                                }
                            });
                            if (isInvalidInput) {
                                alert("Присутствуют незаполненные поля! Попробуйте еще раз!");
                            }
                            else {
                                var  newChannel = {
                                    "channel_name": channel_name.trim().toUpperCase(),
                                    "channel_topics": channel_topics,
                                    "channel_description": channel_description
                                };
                                $.post("/channels", newChannel, function() {
                                    $("#input-channel-field").attr('disabled', false);
                                }).done(function(response) {
                                    alert('Новый телеканал успешно создан!');
                                }).fail(function(jqXHR, textStatus, error) {
                                    alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);
                                });
                                location.reload();
                            }
                        });
                    }
                    else 
                        $(".panel-block").remove();
                }
            });
        }
        else
            alert("Название телеканала не задано!");
    });
    $(".delete-channel-button").on("click", function(e) {
        e.preventDefault();
        $(".cancel-button").attr('disabled', false);
        $(".panel-block").remove();
        var channel_name = $("#input-channel-field").val();
        if (channel_name !== null && channel_name.trim() !== "") {
            $.get("/channel/" + channel_name.trim().toUpperCase(), function(channel) {
                if(channel.length != 0) {
                    if (confirm("Вы уверены, что хотите удалить телеканал  «" + channel_name.trim() + "»?")) {
                        $.ajax({
                            'url': '/channel/' + channel_name.trim().toUpperCase(),
                            'type': 'DELETE',
                        }).done(function(responde) {
                            alert('Телеканал успешно удален!');
                        }).fail(function(jqXHR, textStatus, error) {
                            alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);	
                        });
                        location.reload();
                    }
                    else {
                        $(".cancel-button").attr('disabled', true);
                    }
                }
                else {
                    alert("Данный телеканал отсутствует в системе!");
                    $("#input-channel-field").val("");
                }
            });
        }
        else
            alert("Название телеканала не задано!");
    });
    $(".main-tab-body").append($("<div class='main-channels-list'>"));
    $(".main-channels-list").append($("<h2>Список телеканалов</h2>"));
    $(".main-channels-list").append($("<div class='channels-list'>"));
    $(".channels-list").append($("<ul>"));
    $.getJSON("/channels.json", function (channels) {
        channels.forEach(function(channel){
            $(".channels-list").append($("<li>").text("«" + channel.channel_name + "»"));
        });
	}); 
};

//функция обновления данных телепередачи
var updateTVShow = function(values_array, input_array) {
    var i = 0, isChanged = false, isInvalidInput = false;
    input_array.forEach(function(value){
        if (!(value !== null && value.trim() !== "")) {
            isInvalidInput = true;
        }
        if (values_array[i] != value){
            isChanged = true;
        }
        i++;
    });
    if (isInvalidInput) {
        alert("Присутствуют незаполненные поля! Попробуйте еще раз!");
    }
    if (input_array[input_array.length -1] < 0 ||  input_array[input_array.length -1] > 21 ) {
        alert("Некорректное возрастное ограничение! Допустимые значения от 0 до 21");
        isInvalidInput = true;
    }
    if (!isInvalidInput) {
        if (!isChanged) {
            alert("Данные телепередачи не были изменены!");
        }
        else {
            $.ajax({
                'url': '/tv_show/' + values_array[0],
                'type': 'PUT',
                'data': {
                    'tv_show_name': input_array[0],
                    'tv_show_genre': input_array[1],
                    'tv_show_description': input_array[2],
                    'tv_show_age': input_array[3] + "+"
                }
            }).done(function(responde) {
                alert('Данные телепередачи успешно изменены!');
            }).fail(function(jqXHR, textStatus, error) {
                alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);	
            });
            location.reload();
        }
    }
};

//формирование вкладки управления телепередачами
var createTVShowsTab = function() {
    $(".main-tab-body").append($("<div class='main-tv-shows-panel'><h2>ПАНЕЛЬ УПРАВЛЕНИЯ</h2>"+
                                "<form class='tv-show-form'> <input id='input-show-field' type='text' placeholder='Название телепередачи' title='Название телепередачи'value=''>" +
                                "<button class='search-tv-show-button'>Найти</button>" +
                                "<button class='delete-tv-show-button'>Удалить</button>" +
                                "<button class='cancel-button'>Отмена</button></form></div>"));
    $(".cancel-button").attr('disabled', true);
    $(".cancel-button").on("click", function(e) {
        e.preventDefault();
        $(".cancel-button").attr('disabled', true);
        $("#input-show-field").attr('disabled', false);
        $(".search-tv-show-button").attr('disabled', false);
        $(".delete-tv-show-button").attr('disabled', false);
        $(".panel-block").remove();
    });
    $(".search-tv-show-button").on("click", function(e) {
        e.preventDefault();
        $(".cancel-button").attr('disabled', false);
        $(".panel-block").remove();
        var show_name = $("#input-show-field").val();
        if (show_name !== null && show_name.trim() !== "") {
            $.get("/tv_show/" + show_name.trim(), function(tv_show) {
                $(".main-tv-shows-panel").append($("<div class='panel-block'>"));
                $(".panel-block").append($("<input id='show-genre-input' type='text' placeholder='Жанр' title='Жанр' value=''>"));
                $(".panel-block").append($("<textarea id='show-description-textarea' style='resize: none;' placeholder='Описание' rows='15' cols='35' title='Описание'>"));
                $(".panel-block").append($("<input id='show-age-input' type='number' placeholder='Возраст' value='' min='0' max='21' title='Возрастное ограничение'>"));
                if (tv_show.length != 0) {
                    var values_array = [];
                    $(".search-tv-show-button").attr('disabled', true);
                    $(".delete-tv-show-button").attr('disabled', true);
                    $("#show-genre-input").val(tv_show[0].tv_show_genre);
                    $("#show-description-textarea").text(tv_show[0].tv_show_description);
                    $("#show-age-input").val((tv_show[0].tv_show_age.split("+"))[0]);
                    $(".panel-block").append($("<button class='update-tv-show-button'>Изменить</button>"));
                    values_array.push(show_name.trim());
                    values_array.push(tv_show[0].tv_show_genre);
                    values_array.push(tv_show[0].tv_show_description);
                    values_array.push((tv_show[0].tv_show_age.split("+"))[0]);
                    $(".update-tv-show-button").on("click", function() {
                        var input_array = [];
                        input_array.push($("#input-show-field").val().trim());
                        if (values_array[0] == input_array[0]) {
                            input_array.push($("#show-genre-input").val().trim());
                            input_array.push($("#show-description-textarea").val().trim());
                            input_array.push($("#show-age-input").val());
                            updateTVShow(values_array, input_array);
                        }
                        else {
                            $.get("/tv_show/" + $("#input-show-field").val().trim(), function(show) { 
                                if (show.length != 0) {
                                    alert("Телепередача с названием «" + $("#input-show-field").val().trim() +"» уже существует!");
                                }
                                else {
                                    input_array.push($("#show-genre-input").val().trim());
                                    input_array.push($("#show-description-textarea").val().trim());
                                    input_array.push($("#show-age-input").val());
                                    updateTVShow(values_array, input_array);
                                }
                            });
                        }
                    });
                }
                else {
                    if (confirm("Данная телепередача отсутствует в системе. Хотите добавить?")) { 
                        $(".search-tv-show-button").attr('disabled', true);
                        $(".delete-tv-show-button").attr('disabled', true);
                        $("#input-show-field").attr('disabled', true);
                        $(".panel-block").append($("<button class='add-tv-show-button'>Добавить</button>"));
                        $(".add-tv-show-button").on("click", function() {
                            var input_array = [], isInvalidInput;
                            var show_genre = $("#show-genre-input").val().trim();
                            input_array.push(show_genre);
                            var show_description = $("#show-description-textarea").val().trim();
                            input_array.push(show_description);
                            var show_age = $("#show-age-input").val();
                            input_array.push(show_age);
                            input_array.forEach(function(value){
                                if (!(value !== null && value.trim() !== "")) {
                                    isInvalidInput = true;
                                }
                            });
                            if (isInvalidInput) {
                                alert("Присутствуют незаполненные поля! Попробуйте еще раз!");
                            }
                            if (input_array[input_array.length -1] < 0 ||  input_array[input_array.length -1] > 21 ) {
                                alert("Некорректное возрастное ограничение! Допустимые значения от 0 до 21");
                                isInvalidInput = true;
                            }
                            if (!isInvalidInput) {
                                var  newTvShow = {
                                    "tv_show_name": show_name.trim(),
                                    "tv_show_genre": show_genre,
                                    "tv_show_description": show_description,
                                    "tv_show_age": show_age + "+"
                                };
                                $.post("/tv_shows", newTvShow, function() {
                                    $("#input-show-field").attr('disabled', false);
                                }).done(function(response) {
                                    alert('Новая телепередача успешно создана!');
                                }).fail(function(jqXHR, textStatus, error) {
                                    alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);
                                });
                                location.reload();
                            }
                        });
                    }
                    else 
                        $(".panel-block").remove();
                }
            });
        }
        else
            alert("Название телепередачи не задано!");
    });
    $(".delete-tv-show-button").on("click", function(e) {
        e.preventDefault();
        $(".cancel-button").attr('disabled', false);
        $(".panel-block").remove();
        var show_name = $("#input-show-field").val();
        if (show_name !== null && show_name.trim() !== "") {
            $.get("/tv_show/" + show_name.trim(), function(tv_show) {
                if(tv_show.length != 0) {
                    if (confirm("Вы уверены, что хотите удалить телепередачу «" + show_name + "»?")) {
                        $.ajax({
                            'url': '/tv_show/' + show_name.trim(),
                            'type': 'DELETE',
                        }).done(function(responde) {
                            alert('Телепередача успешно удалена!');
                        }).fail(function(jqXHR, textStatus, error) {
                            alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);	
                        });
                        location.reload();
                    }
                    else {
                        $(".cancel-button").attr('disabled', true);
                    }
                }
                else {
                    alert("Данная телепередача отсутствует в системе!");
                    $("#input-show-field").val("");
                }
            });
        }
        else
            alert("Название телепередачи не задано!");
    });
    $(".main-tab-body").append($("<div class='main-tv-shows-list'>"));
    $(".main-tv-shows-list").append($("<h2>Список телепередач</h2>"));
    $(".main-tv-shows-list").append($("<div class='tv-shows-list'>"));
    $(".tv-shows-list").append($("<ul>"));
    $.getJSON("/tv_shows.json", function (tv_shows) {
        tv_shows.forEach(function(tv_show){
            $(".tv-shows-list").append($("<li>").text("«" + tv_show.tv_show_name + "»"));
        });
	}); 
};

var main = function(){
    "use strict"
    $(".main-tab-items a").toArray().forEach(function (element) {
	    $(element).on("click", function () {
	        var $element = $(element);
	        $(".main-tab-items a span").removeClass("active");
            $(".main-tab-items a").removeClass("active");
            $element.children().addClass("active"); 
	        $element.addClass("active");
	        $(".main-tab-body").empty();
            if ($element.children().parent().is(":nth-child(1)")) { 
	            createScheduleTab();
	        } 
	        else if ($element.children().parent().is(":nth-child(2)")) { 
		        createChannelsTab();
	        } 
	        else if ($element.children().parent().is(":nth-child(3)")) { 
		        createTVShowsTab();
	        }
	        return false;
	    });
    });
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
            $(".popup-no-content").append($("<div class = 'popup-not-found-image'>").append($("<img src='/img/not-found.png'>")));
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
    $(".main-tab-items a.active").trigger("click");
}

$(document).ready(function() {
	main();
});