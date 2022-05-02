var ScheduleModel = require("../models/schedule.js"),
    ScheduleController = {};

ScheduleController.index = function(req, res) {
    ScheduleModel.find({}, function (err, schedule) {
		if (err !== null) {
			res.json(500, err);
		}
		else {
			res.status(200).json(schedule);
		}
	});
}

ScheduleController.search = function (req, res) {
	var date = req.params.date;
	ScheduleModel.find({"_id":new Date(date)}, function (err, schedule) {
		if (err !== null) { 
			console.log("ERROR" + err);
			res.status(500).json(err);
		} else {
			if (schedule.length > 0) {
				res.status(200).json(schedule);
			} else {
				res.json(schedule);
			}
		}
	});
};

module.exports = ScheduleController;