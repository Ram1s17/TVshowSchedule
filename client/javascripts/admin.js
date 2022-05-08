var main = function (UsersObjects) {
	"use strict";

    $(".hello-banner h2").text("Добро пожаловать, " + UsersObjects[0].username + "!");

	for (var i = 1; i < UsersObjects.length; i++) {
        $(".users-list").append($("<h3>").text(UsersObjects[i].username));
    }

	$(".add-user-button").on("click", function() {
		var username = $(".input-username-field").val();
		if (username !== null && username.trim() !== "") {
			var newUser = {"username": username};
			$.post("/users", newUser, function(result) {
				console.log(result);
			}).done(function(response) {
				alert('Аккаунт сотрудника успешно создан!');
			}).fail(function(jqXHR, textStatus, error) {
				if (jqXHR.status === 501) {
					alert("Такой пользователь уже существует!");
				} else {					
					alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);	
				}
			});
		}
		else
            alert("Логин не задан!");
	});

	$(".update-user-button").on("click", function(e) {
        e.preventDefault();
		if ($(".input-username-field").val() !== null && $(".input-username-field").val().trim() !== "") {
			var username = $(".input-username-field").val();
            $.get("/user/" + username, function(user){
                if (user != null) {
                    if (user.role != "Администратор") {
                        var newUsername = prompt("Введите новый логин для сотрудника", $(".input-username-field").val());
                        if (newUsername !== null && newUsername.trim() !== "") {
                            $.ajax({
                                'url': '/users/' + username,
                                'type': 'PUT',
                                'data': {'username': newUsername}
                            }).done(function(responde) {
                                alert('Логин сотрудника успешно изменен!');
                            }).fail(function(jqXHR, textStatus, error) {
                                alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);	
                            });
                            location.reload();
                        }
                        else 
                            alert("Новый логин не задан!");
                    }
                    else {
                        alert("Изменение аккаунта администратора запрещено!");
                        $(".input-username-field").val("");
                    }
                }
                else {
                    alert("Данный сотрудник отсутствует в системе!");
                    $(".input-username-field").val("");
                }
            });
		}
        else
            alert("Логин не задан!");
	});

	$(".delete-user-button").on("click", function(e) {
		e.preventDefault();
		if ($(".input-username-field").val() !== null && $(".input-username-field").val().trim() !== "") {
			var username = $(".input-username-field").val();
            $.get("/user/" + username, function(user){
                if (user != null) {
                    if (user.role != "Администратор") {
                        if (confirm("Вы уверены, что хотите удалить сотрудника с логином " + username + "?")) {
                            $.ajax({
                                'url': '/users/' + username,
                                'type': 'DELETE',
                            }).done(function(responde) {
                                alert('Аккаунт сотрудника успешно удален!');
                            }).fail(function(jqXHR, textStatus, error) {
                                alert("Ошибка! Статус: " + jqXHR.status + " – " + jqXHR.textStatus);	
                            });
                            location.reload();
                        }
                    }
                    else {
                        alert("Удаление аккаунта администратора запрещено!");
                        $(".input-username-field").val("");
                    }
                }
                else {
                    alert("Данный сотрудник отсутствует в системе!");
                    $(".input-username-field").val("");
                }
            });
		}
        else
            alert("Логин не задан!");
	});
}

$(document).ready(function() {
	$.getJSON("/users.json", function (UsersObjects) {
		main(UsersObjects);
	});
});