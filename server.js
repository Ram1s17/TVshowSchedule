var express = require("express"),
    http = require("http"),
    app = express(),
    mongoose = require("mongoose"),
    ScheduleController = require("./controllers/schedule_controller.js");

app.use(express.static(__dirname + "/client"));

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