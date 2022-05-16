var ScheduleModel = require("../models/schedule.js"),
	mongoose = require("mongoose"),
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
	ScheduleModel.find({"date":new Date(date)}, function (err, schedule) {
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

ScheduleController.searchChannelByDate = function (req, res) {
	var date = req.query.date;
	var channel_name = req.query.channel_name;
	ScheduleModel.findOne({"date": new Date(date), "schedule.channel": channel_name}, {"schedule": {$elemMatch: {"channel": channel_name}}}, function (err, schedule) {
		if (err !== null) { 
			console.log("ERROR" + err);
			res.status(500).json(err);
		} else {
			if (schedule != 0) {
				res.status(200).json(schedule);
			} else {
				res.json(schedule);
			}
		}
	});
};

ScheduleController.createChannelWithEvent = function (req, res) {
	var date = req.body.date;
	var channel_name = req.body.channel;
	var event_time = req.body.event_time;
	var event_name = req.body.event_name;
	ScheduleModel.find({"date":new Date(date)}, function (err, schedule) {
		if (err !== null) { 
			console.log("ERROR" + err);
			res.status(500).json(err);
		} else {
			if (schedule.length > 0) {
				var newChannel = {
					"channel": channel_name,
					"events" : [
						{
							"event_time": new Date(event_time),
							"event_name": event_name
						}
					]
				};
				ScheduleModel.updateOne({"date":new Date(date)}, {$push: {"schedule": newChannel}}, function (err, event) {
					if (err !== null) {
						res.status(500).json(err);
					} 
					else {
						res.status(200).json(event);
					}
				});
			} 
			else {
				var newSchedule = new ScheduleModel({
					"date": new Date(date),
					"schedule": [
						{
							"channel": channel_name,
							"events" : [
								{
									"event_time": new Date(event_time),
									"event_name": event_name
								}
							]
						}
					]
				});
				newSchedule.save(function(err, result) {
					if (err !== null) {
						res.json(500, err); 
					} else {
						res.json(200, result);
					}
				});
			}
		}
	});
};

ScheduleController.createEventForChannel = function (req, res) {
	var date = req.body.date;
	var channel_name = req.body.channel;
	var event_time = req.body.event_time;
	var event_name = req.body.event_name;
	ScheduleModel.updateOne({"date": new Date(date), "schedule": {$elemMatch: {"channel": channel_name}}}, 
				{$push: {"schedule.$[outer].events": {"_id": new mongoose.Types.ObjectId(), "event_time": new Date(event_time), "event_name": event_name}}},
				{"arrayFilters": [{"outer.channel": channel_name}]}, function (err, schedule) {
		if (err !== null) { 
			console.log("ERROR" + err);
			res.status(500).json(err);
		} else {
			if (schedule != 0) {
				res.status(200).json(schedule);
			} else {
				res.json(schedule);
			}
		}
	});
};

ScheduleController.updateEventOfChannel = function (req, res) {
	var date = req.params.date;
	var channel_id = req.body.channel_id;
	var event_id = req.body.event_id;
	var event_time = req.body.event_time;
	var event_name = req.body.event_name;
	ScheduleModel.updateOne({"date": new Date(date), "schedule": {$elemMatch: {"_id": new mongoose.Types.ObjectId(channel_id), "events._id": new mongoose.Types.ObjectId(event_id)}}}, 
				{$set: {"schedule.$[outer].events.$[inner].event_time": new Date(event_time),  "schedule.$[outer].events.$[inner].event_name": event_name}},
				{"arrayFilters": [{"outer._id": new mongoose.Types.ObjectId(channel_id)}, {"inner._id": new mongoose.Types.ObjectId(event_id)}]}, function (err, schedule) {
		if (err !== null) { 
			console.log("ERROR" + err);
			res.status(500).json(err);
		}
		else {
            res.status(200).json(schedule);
        }
	});
};

ScheduleController.destroySchedule = function(req, res) {
    var date = req.params.date;
    ScheduleModel.deleteOne({"date": new Date(date)}, function (err, schedule) {
        if (err !== null) {
            res.status(500).json(err);
        } 
        else {
            res.status(200).json(schedule);
        }
    });
};

ScheduleController.destroyScheduleOfChannel = function(req, res) {
    var date = req.params.date;
	var channel_name = req.body.channel_name;
    ScheduleModel.updateOne({"date": new Date(date)}, {$pull: {"schedule": {"channel": channel_name}}}, function (err, schedule_by_date) {
        if (err !== null) {
            res.status(500).json(err);
        } 
        else {
			ScheduleModel.findOne({"date":new Date(date)}, function (err1, schedule1) {
				if (err1 !== null) { 
					console.log("ERROR" + err);
					res.status(500).json(err1);
				} else {
					if (schedule1.schedule.length == 0) {
						ScheduleModel.deleteOne({"date": new Date(date)}, function (err2, schedule2) {
							if (err !== null) {
								res.status(500).json(err2);
							} 
							else {
								res.status(200).json(schedule2);
							}
						});
					} else {
						res.status(200).json(schedule1);
					}
				}
			});
        }
    });
};

ScheduleController.destroyEventOfChannel = function (req, res) {
	var date = req.params.date;
	var channel_id = req.body.channel_id;
	var event_id = req.body.event_id;
	var count_of_events = req.body.count_of_events;
	ScheduleModel.updateOne({"date": new Date(date), "schedule": {$elemMatch: {"_id": new mongoose.Types.ObjectId(channel_id), "events._id": new mongoose.Types.ObjectId(event_id)}}}, 
				{$pull: {"schedule.$[outer].events": {"_id": new mongoose.Types.ObjectId(event_id)}}},
				{"arrayFilters": [{"outer._id": new mongoose.Types.ObjectId(channel_id)}]}, function (err, schedule) {
		if (err !== null) { 
			console.log("ERROR" + err);
			res.status(500).json(err);
		} else {
			if (count_of_events - 1 == 0) {
				ScheduleModel.updateOne({"date": new Date(date)}, {$pull: {"schedule": {"_id": mongoose.Types.ObjectId(channel_id)}}}, function (err, schedule_by_date) {
					if (err !== null) {
						res.status(500).json(err);
					} 
					else {
						ScheduleModel.findOne({"date":new Date(date)}, function (err1, schedule1) {
							if (err1 !== null) { 
								console.log("ERROR" + err);
								res.status(500).json(err1);
							} else {
								if (schedule1.schedule.length == 0) {
									ScheduleModel.deleteOne({"date": new Date(date)}, function (err2, schedule2) {
										if (err !== null) {
											res.status(500).json(err2);
										} 
										else {
											res.status(200).json(schedule2);
										}
									});
								} else {
									res.status(200).json(schedule1);
								}
							}
						});
					}
				});
			}
			else {
				res.status(200).json(schedule);
			}
		}
	});
};

module.exports = ScheduleController;