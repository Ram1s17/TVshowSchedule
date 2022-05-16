var ChannelModel = require("../models/channel.js"),
    ScheduleModel = require("../models/schedule.js"),
    ChannelController = {};

ChannelController.index = function(req, res) {
    ChannelModel.find({}).sort({"channel_name": 1}).exec(function (err, channels) {
        if (err !== null) {
            res.json(500, err);
        }
        else {
            res.status(200).json(channels);
        }
    });
};

ChannelController.show = function (req, res) {
    var topic = req.params.topic;
    ChannelModel.find({"channel_topics":topic}, function (err, channels) {
        if (err !== null) { 
            console.log("ERROR" + err);
            res.status(500).json(err);
        } else {
            if (channels.length > 0) {
                res.status(200).json(channels);
            } else {
                res.json(channels);
            }
        }
    });
};

ChannelController.search = function (req, res) {
    var channel_name = req.params.channel_name;
    ChannelModel.find({"channel_name":channel_name}, function (err, channel) {
        if (err !== null) { 
            console.log("ERROR" + err);
            res.status(500).json(err);
        } else {
            if (channel.length > 0) {
                res.status(200).json(channel);
            } else {
                res.json(channel);
            }
        }
    });
};

ChannelController.create = function(req, res) {
	var newChannel = new ChannelModel(req.body);
	newChannel.save(function(err, result) {
		if (err !== null) {
			res.json(500, err); 
		} else {
			res.json(200, result);
		}
	});

};

ChannelController.update = function(req, res) {
    var channel_name = req.params.channel_name;
    var updatedChannel = req.body;
    ChannelModel.updateOne({"channel_name": channel_name}, updatedChannel, function (err, channel) {
        if (err !== null) {
            res.status(500).json(err);
        } else {
            ScheduleModel.updateMany({"schedule": {$elemMatch: {"channel": channel_name}}},
                                     {$set: {"schedule.$[outer].channel": updatedChannel.channel_name}},
                                     {"arrayFilters": [{"outer.channel": channel_name}]},  function (err1, channelInSchedule) {
                if (err1 !== null) {
                    res.status(500).json(err1);
                }
                else {
                    res.status(200).json(channelInSchedule);
                }
            });
        }
    });
};

ChannelController.destroy = function(req, res) {
    var channel_name = req.params.channel_name;
    ChannelModel.deleteOne({"channel_name": channel_name}, function (err, channel) {
        if (err !== null) {
            res.status(500).json(err);
        } 
        else {
            ScheduleModel.updateMany({"schedule": {$elemMatch: {"channel": channel_name}}}, {$pull: {"schedule": {"channel": channel_name}}}, function (err1, schedule_by_date) {
                if (err1 !== null) {
                    res.status(500).json(err1);
                } 
                else {
                    ScheduleModel.deleteMany({"schedule": {$eq: []}}, function (err2, schedule) {
                        if (err2 !== null) {
                            res.status(500).json(err2);
                        } 
                        else {
                            res.status(200).json(schedule);
                        }
                    });
                }
            });
        }
    });
};

module.exports = ChannelController;