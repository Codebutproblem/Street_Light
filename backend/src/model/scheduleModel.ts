import { Schema, Document, model } from "mongoose";
import mongoose from "mongoose";

interface ISchedule extends Document {
  start_time: Date;
  end_time: Date;
  devices: mongoose.Types.ObjectId[];
}

const scheduleSchema = new Schema<ISchedule>({
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

const Schedule = model<ISchedule>("Schedule", scheduleSchema, "Schedule");

export default Schedule;
