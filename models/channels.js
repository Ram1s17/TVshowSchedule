var mongoose = require("mongoose");

var channelSchema = mongoose.Schema({
    _id: String,
    channel_topics: String,
    channel_description: String,
    channel_events: [String]
});

var ChannelModel = mongoose.model("ChannelModel", channelSchema ,"channels");

module.exports = ChannelModel;