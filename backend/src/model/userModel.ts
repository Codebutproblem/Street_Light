import mongoose, { Schema, Model } from "mongoose";
import { Document, Types } from "mongoose";

export interface IUser extends Document {
  id: string;
  email: string;
  username: string;
  password: string;
  role: string;
  devices: Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
    required: true,
  },
  devices: [
    {
      type: Schema.Types.ObjectId,
      ref: "Device",
    },
  ],
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema, "User");

export default User;
