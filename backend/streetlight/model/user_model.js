const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: String
}, { timestamps: false });

const User = mongoose.model('User', UserSchema, 'User');

module.exports = User;