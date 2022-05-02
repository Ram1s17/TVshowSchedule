var TVShowModel = require("../models/tv_shows.js"),
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
	var id = req.params.id;
	TVShowModel.find({"_id":id}, function (err, tv_show) {
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