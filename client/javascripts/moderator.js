//текущая дата
var currentDate = new Date;
//словать вида: "День недели, число": "ГГГГ-ММ-ДД" 
var datesDictionary = new Map();
//var currentTabText, tabContent;

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
}

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
}

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
    $(".main-tabs-body").append($("<div class='main-channels-panel'><h2>ПАНЕЛЬ УПРАВЛЕНИЯ</h2>"+
                                "<form class='channel-form'> <input id='input-channel-field' type='text' placeholder='Название телеканала' title='Название телеканала'value=''>" +
                                "<button class='search-channel-button'>Найти</button>" +
                                "<button class='delete-channel-button'>Удалить</button>" +
                                "<button class='cancel-button'>Отмена</button></form></div>"));
    $(".cancel-button").on("click", function(e) {
        e.preventDefault();
        $("#input-channel-field").attr('disabled', false);
        $(".search-channel-button").attr('disabled', false);
        $(".delete-channel-button").attr('disabled', false);
        $(".panel-block").remove();
    });
    $(".search-channel-button").on("click", function(e) {
        e.preventDefault();
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
        $(".panel-block").remove();
        var channel_name = $("#input-channel-field").val();
        if (channel_name !== null && channel_name.trim() !== "") {
            $.get("/channel/" + channel_name.trim(), function(channel) {
                if(channel.length != 0) {
                    if (confirm("Вы уверены, что хотите удалить телеканал  «" + channel_name.trim() + "»?")) {
                        $.ajax({
                            'url': '/channel/' + channel_name.trim(),
                            'type': 'DELETE',
                        }).done(function(responde) {
                            alert('Телеканал успешно удален!');
                        }).fail(function(jqXHR, textStatus, error) {
                            alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);	
                        });
                        location.reload();
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
    $(".main-tabs-body").append($("<div class='main-channels-list'>"));
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
    $(".main-tabs-body").append($("<div class='main-tv-shows-panel'><h2>ПАНЕЛЬ УПРАВЛЕНИЯ</h2>"+
                                "<form class='tv-show-form'> <input id='input-show-field' type='text' placeholder='Название телепередачи' title='Название телепередачи'value=''>" +
                                "<button class='search-tv-show-button'>Найти</button>" +
                                "<button class='delete-tv-show-button'>Удалить</button>" +
                                "<button class='cancel-button'>Отмена</button></form></div>"));
    $(".cancel-button").on("click", function(e) {
        e.preventDefault();
        $("#input-show-field").attr('disabled', false);
        $(".search-tv-show-button").attr('disabled', false);
        $(".delete-tv-show-button").attr('disabled', false);
        $(".panel-block").remove();
    });
    $(".search-tv-show-button").on("click", function(e) {
        e.preventDefault();
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
    $(".main-tabs-body").append($("<div class='main-tv-shows-list'>"));
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
    $(".main-tabs-items a").toArray().forEach(function (element) {
	    $(element).on("click", function () {
	        var $element = $(element);
	        $(".main-tabs-items a span").removeClass("active");
            $(".main-tabs-items a").removeClass("active");
            $element.children().addClass("active"); 
	        $element.addClass("active");
	        $(".main-tabs-body").empty();
            if ($element.children().parent().is(":nth-child(1)")) { 
	            console.log("1");
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
    $(".main-tabs-items a.active").trigger("click");
}

$(document).ready(function() {
	main();
});