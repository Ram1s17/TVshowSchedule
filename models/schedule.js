var mongoose = require("mongoose");

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

var ScheduleModel = mongoose.model("Schedule", scheduleSchema, "schedule_by_dates");

module.exports = ScheduleModel;