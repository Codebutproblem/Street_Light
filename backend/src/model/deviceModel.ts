import mongoose, { Schema, model, Document } from "mongoose";

// Define the TypeScript interface for the Device document
interface IDevice extends Document {
  id: string;
  deviceName: string;
  longitude?: number;
  latitude?: number;
  status: string;
  brightness: number;
  lightIntensity?: number;
  user?: Schema.Types.ObjectId; // Reference to User model
  lightData?: Schema.Types.ObjectId; // Reference to LightData model
  schedule?: Schema.Types.ObjectId; // Reference to Schedule model,
  updatedAt: String;
}

// Define the Mongoose schema
const deviceSchema = new Schema<IDevice>({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  deviceName: {
    type: String,
    required: true,
  },
  longitude: {
    type: Number,
  },
  latitude: {
    type: Number,
  },
  status: {
    type: String,
    required: true,
  },
  brightness: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  lightIntensity: {
    type: Number,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  lightData: {
    type: Schema.Types.ObjectId,
    ref: "LightData",
  },
  schedule: {
    type: Schema.Types.ObjectId,
    ref: "Schedule",
  },
  updatedAt: {
    type: String,
    default: new Date().toISOString(),
  },
});

// Create the model and export it
const Device = model<IDevice>("Device", deviceSchema, "Device");
export default Device;
