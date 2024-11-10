const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema({
    longtidue: Number,
    latidue: Number,
    status: Boolean,
    brightness: Number,
},{timestamps: false});

const Device = mongoose.model('Device', DeviceSchema, 'Device');
module.exports = Device;