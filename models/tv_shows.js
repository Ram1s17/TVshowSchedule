var mongoose = require("mongoose");

var tvShowSchema = mongoose.Schema({
    tv_show_name: String,
    tv_show_genre: String,
    tv_show_description: String,
    tv_show_age: String
});

var TVShowModel = mongoose.model("TVShowModel", tvShowSchema ,"tv_shows");

module.exports = TVShowModel;