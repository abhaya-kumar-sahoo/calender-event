const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true }, // Sparse unique index allows multiple nulls
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Hashed password
    name: { type: String, required: true },
    picture: String,
    phoneNumber: String,
    address: String,
    bio: String,
    website: String,
    mapLink: String,
    timezone: { type: String, default: 'UTC' },
    refreshToken: String,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
