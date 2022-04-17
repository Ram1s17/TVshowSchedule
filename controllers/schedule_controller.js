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

module.exports = ScheduleController;