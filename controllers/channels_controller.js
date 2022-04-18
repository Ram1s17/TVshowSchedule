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

module.exports = ChannelController;