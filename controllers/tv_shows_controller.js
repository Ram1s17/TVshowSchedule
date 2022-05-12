var TVShowModel = require("../models/tv_show.js"),
    TVShowController = {};

TVShowController.index = function(req, res) {
	TVShowModel.find({}).sort({"tv_show_name": 1}).exec(function (err, tv_shows) {
		if (err !== null) {
			res.json(500, err);
		}
		else {
			res.status(200).json(tv_shows);
		}
	});
}


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

TVShowController.create = function(req, res) {
	var newTvShow = new TVShowModel(req.body);
	newTvShow.save(function(err, result) {
		if (err !== null) {
			res.json(500, err); 
		} else {
			res.json(200, result);
		}
	});

};

TVShowController.update = function(req, res) {
    var show_name = req.params.tv_show_name;
    var updatedShow = req.body;
    TVShowModel.updateOne({"tv_show_name": show_name}, updatedShow, function (err,tv_show) {
        if (err !== null) {
            res.status(500).json(err);
        } else {
            res.status(200).json(tv_show);
        }
    });
};

TVShowController.destroy = function(req, res) {
    var show_name = req.params.tv_show_name;
    TVShowModel.deleteOne({"tv_show_name": show_name}, function (err, tv_show) {
        if (err !== null) {
            res.status(500).json(err);
        } 
        else {
            res.status(200).json(tv_show);
        }
    });
};

module.exports = TVShowController;