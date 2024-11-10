const mongoose = require("mongoose");

const LightDataSchema = new mongoose.Schema({
    light_level: Number,
    DateTime: Date
},{timestamps: false});

const LightData = mongoose.model('LightData', LightDataSchema, 'LightData');
module.exports = LightData;