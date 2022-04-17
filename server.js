var express = require("express"),
    http = require("http"),
    app = express(),
    mongoose = require("mongoose");

app.use(express.static(__dirname + "/client"));

app.use(express.urlencoded({ extended: true}));

mongoose.connect('mongodb://localhost/tv_show_schedule');

var scheduleSchema = mongoose.Schema({
	_id: Date,
    schedule: [{
                    channel: String,
                    events: [
                                {
                                    event_time: Date,
                                    event_name: String   
                                }
                            ]
                }
              ]
});

var scheduleModel = mongoose.model("Schedule", scheduleSchema, "schedule_by_dates");

http.createServer(app).listen(3000);

app.get("/data.json", function (req, res) {
	scheduleModel.find({}, function (err, schedule) {
		if (err !== null) {
			console.log("ERROR" + err);
		}
		else {
			res.json(schedule);
		}
	});
});