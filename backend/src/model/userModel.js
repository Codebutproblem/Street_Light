const mongoose = require("mongoose");

const userSchema = new Schema({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId(),
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  devices: [
    {
      type: Schema.Types.ObjectId,
      ref: "Device",
    },
  ],
});

const User = mongoose.model("User", userSchema, "User");

module.exports = User;
