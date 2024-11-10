const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
    start_time: Date,
    end_time: Date,
    device_id: String,
},{timestamps: false});