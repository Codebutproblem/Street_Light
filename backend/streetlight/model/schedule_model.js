const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
    start_time: Date,
    end_time: Date,
    device_ids: Array
},{timestamps: false});

const Schedule = mongoose.model('Schedule', ScheduleSchema, 'Schedule');

module.exports = Schedule;