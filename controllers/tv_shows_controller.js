var TVShowModel = require("../models/tv_show.js"),
    TVShowController = {};

TVShowController.show = function (req, res) {
	var genre = req.params.genre;
	TVShowModel.find({"tv_show_genre":genre}, function (err, tv_show) {
		if (err !== null) { 
			console.log("ERROR" + err);
			res.status(500).json(err);
		} else {
			if (tv_show.length > 0) {
				res.status(200).json(tv_show);
			} else {
				res.json(tv_show);
			}
		}
	});
};

TVShowController.search = function (req, res) {
	var tv_show_name = req.params.tv_show_name;
	TVShowModel.find({"tv_show_name":tv_show_name}, function (err, tv_show) {
		if (err !== null) { 
			console.log("ERROR" + err);
			res.status(500).json(err);
		} else {
			if (tv_show.length > 0) {
				res.status(200).json(tv_show);
			} else {
				res.json(tv_show);
			}
		}
	});
};

module.exports = TVShowController;