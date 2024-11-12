import { Schema, Document, model, Types } from "mongoose";
import mongoose from "mongoose";

interface ISchedule extends Document {
  start_time: string;
  end_time: string;
  createdAt: string;
  devices: Types.ObjectId[];
}

const scheduleSchema: Schema<ISchedule> = new Schema({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  start_time: {
    type: String,
    required: true,
  },
  end_time: {
    type: String,
    required: true,
  },
  devices: [
    {
      type: Schema.Types.ObjectId,
      ref: "Device",
    },
  ],
  createdAt: {
    type: String,
    required: true,
    default: new Date().toISOString(),
  },
});

const Schedule = model<ISchedule>("Schedule", scheduleSchema, "Schedule");

export default Schedule;
