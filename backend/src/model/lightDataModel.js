const mongoose = require("mongoose");

const lightDataSchema = new Schema({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId(),
  },
  light_level: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  device: {
    type: Schema.Types.ObjectId,
    ref: "Device",
    unique: true, // One-to-one relationship with Device
  },
});

const LightData = mongoose.model("LightData", lightDataSchema, "LightData");
module.exports = LightData;
