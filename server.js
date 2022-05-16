var express = require("express"),
    http = require("http"),
    app = express(),
    mongoose = require("mongoose"),
    ScheduleController = require("./controllers/schedule_controller.js"),
    TVShowController = require("./controllers/tv_shows_controller.js"),
    ChannelController = require("./controllers/channels_controller.js"),
    UserController = require("./controllers/users_controller.js");

app.use('/', express.static(__dirname + "/client"));

app.use(express.urlencoded({ extended: true}));

mongoose.connect('mongodb://localhost/tv_show_schedule',{
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true
}).then(res => {
    console.log("DB connected");
}).catch(err => {
    console.log("ERROR" + err);
});

http.createServer(app).listen(3000);

app.get("/data.json", ScheduleController.index);
app.get("/schedule/:date", ScheduleController.search);
app.get("/channelByDate", ScheduleController.searchChannelByDate);
app.post("/channel_and_event", ScheduleController.createChannelWithEvent);
app.post("/event", ScheduleController.createEventForChannel);
app.put("/eventOfChannel/:date", ScheduleController.updateEventOfChannel);
app.delete("/eventOfChannel/:date", ScheduleController.destroyEventOfChannel);
app.delete("/scheduleOfChannel/:date", ScheduleController.destroyScheduleOfChannel);
app.delete("/schedule/:date", ScheduleController.destroySchedule);

app.get("/tv_shows.json", TVShowController.index);
app.get("/tv_shows/:genre", TVShowController.show); 
app.get("/tv_show/:tv_show_name", TVShowController.search);
app.post("/tv_shows", TVShowController.create);
app.put("/tv_show/:tv_show_name", TVShowController.update);
app.delete("/tv_show/:tv_show_name", TVShowController.destroy);

app.get("/channels.json", ChannelController.index);
app.get("/channels/:topic", ChannelController.show);
app.get("/channel/:channel_name", ChannelController.search);
app.post("/channels", ChannelController.create);
app.put("/channel/:channel_name", ChannelController.update);
app.delete("/channel/:channel_name", ChannelController.destroy);

app.get("/users.json", UserController.index);
app.get("/user/:username", UserController.search);
app.get("/users/:username", UserController.show);
app.post("/users", UserController.create);
app.put("/users/:username", UserController.update);
app.delete("/users/:username", UserController.destroy);