var UserModel = require("../models/user.js"),
    UserController = {};

UserController.show = function(req, res) {
    UserModel.find({'username': req.params.username}, function(err, result) {
        if (err) {
            console.log(err);
        } else if (result.length !== 0) {
            if (result[0].role == "Администратор") {
                //res.sendfile('./client/index.html');
                //Переходим в режим администратора
            }
            else {
                //res.sendfile('./client/index.html');
                //Переходим в режим сотрудника телекомпании
            }
        } else {
            res.send(404);
        }
    });
};

module.exports = UserController;