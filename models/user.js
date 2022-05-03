var mongoose = require("mongoose");

var UserSchema = mongoose.Schema({
	username: String,
	role: String
});

var User = mongoose.model("User", UserSchema);

module.exports = User;