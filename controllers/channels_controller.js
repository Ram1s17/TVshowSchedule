var ChannelModel = require("../models/channels.js"),
    ChannelController = {};

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
    var id = req.params.id;
    ChannelModel.find({"_id":id}, function (err, channel) {
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

module.exports = ChannelController;