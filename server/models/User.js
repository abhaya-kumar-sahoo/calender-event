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
    businessName: String,
    instagram: String,
    facebook: String,
    refreshToken: String,
    emailTemplates: {
        guestConfirmation: {
            subject: { type: String, default: "Confirmation: {{eventTitle}} with {{hostName}}" },
            intro: { type: String },
            outro: { type: String },
            body: { type: String },
            bodyBlocks: { type: [String], default: [] }
        },
        hostNotification: {
            subject: { type: String, default: "New Booking: {{guestName}} - {{eventTitle}}" },
            body: { type: String }
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
