var UserModel = require("../models/user.js"),
    UserController = {};

UserController.index = function(req, res) {
    UserModel.find(function (err, users) {
        if (err !== null) {
            res.json(500, err);
        } else {
            res.status(200).json(users);
        }
    });
};

UserController.search = function(req, res) {
    var username = req.params.username;
    UserModel.findOne({"username": username}, function (err, user) {
        if (err !== null) {
            res.json(500, err);
        } else {
            res.status(200).json(user);
        }
    });
};

UserController.show = function(req, res) {
    UserModel.find({'username': req.params.username}, function(err, result) {
        if (err) {
            console.log(err);
        } else if (result.length !== 0) {
            if (result[0].role == "Администратор") {
                res.sendfile('./client/admin_panel.html');
            }
            else {
                res.sendfile('./client/moderator_panel.html');
            }
        } else {
            res.send(404);
        }
    });
};

UserController.create = function(req, res) {
    var username = req.body.username;
    UserModel.find({"username": username}, function (err, result) {
        if (err) {
            res.send(500, err);
        } else if (result.length !== 0) {
            res.status(501).send("Пользователь уже существует!"); 
        } else {
            var newUser = new UserModel({
                "username": username,
                "role": "Сотрудник телекомпании"
            });
            newUser.save(function(err, result) {
                if (err !== null) {
                    res.json(500, err); 
                } else {
                    res.json(200, result);
                }
            });
        }
    }); 
};

UserController.update = function(req, res) {
    var username = req.params.username;
    var newUsername = {$set: {username: req.body.username}};
    UserModel.updateOne({"username": username}, newUsername, function (err,user) {
        if (err !== null) {
            res.status(500).json(err);
        } else {
            res.status(200).json(user);
        }
    });
};

UserController.destroy = function(req, res) {
    var username = req.params.username;
    UserModel.deleteOne({"username": username}, function (err, user) {
        if (err !== null) {
            res.status(500).json(err);
        } 
        else {
            res.status(200).json(user);
        }
    });
};

module.exports = UserController;