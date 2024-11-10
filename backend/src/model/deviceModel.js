const mongoose = require("mongoose");

const deviceSchema = new Schema({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId(),
  },
  longitude: {
    type: Number,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
  brightness: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lightData: {
    type: Schema.Types.ObjectId,
    ref: "LightData",
  },
  schedule: {
    type: Schema.Types.ObjectId,
    ref: "Schedule",
  },
});

const Device = mongoose.model("Device", deviceSchema, "Device");
module.exports = Device;
