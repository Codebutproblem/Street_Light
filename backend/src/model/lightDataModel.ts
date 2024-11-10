import { Schema, Document, model } from "mongoose";
import mongoose from "mongoose";

interface ILightData extends Document {
  light_level: number;
  name: string;
  timestamp: string;
  device: mongoose.Types.ObjectId;
}

const lightDataSchema = new Schema<ILightData>({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: { type: String, required: true },

  light_level: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: String,
    default: new Date().toISOString(),
    required: true,
  },
  device: {
    type: Schema.Types.ObjectId,
    ref: "Device",
    unique: true,
  },
});

const LightData = model<ILightData>("LightData", lightDataSchema, "LightData");

export default LightData;
