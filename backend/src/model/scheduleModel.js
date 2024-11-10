const mongoose = require("mongoose");

const scheduleSchema = new Schema({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId(),
  },
  start_time: {
    type: Date,
    required: true,
  },
  end_time: {
    type: Date,
    required: true,
  },
  devices: [
    {
      type: Schema.Types.ObjectId,
      ref: "Device",
    },
  ],
});

const Schedule = mongoose.model("Schedule", scheduleSchema, "Schedule");

module.exports = Schedule;
