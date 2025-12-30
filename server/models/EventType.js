const mongoose = require('mongoose');

const eventTypeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    duration: { type: Number, required: true },
    description: String,
    color: { type: String, default: 'bg-blue-600' },
    location: { type: String, enum: ['in-person', 'gmeet'], default: 'gmeet' },
    locationAddress: String, // For in-person address
    locationUrl: String, // Map URL
    host: String,
    eventImage: String, // Base64 or URL
    availability: String,
    repeaterFields: [{
        name: String,
        url: String
    }],
    emailVerify: { type: Boolean, default: false },
    phoneVerify: { type: Boolean, default: false },
    enablePhoneCheck: { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (doc, ret) {
            delete ret._id;
        }
    }
});

module.exports = mongoose.model('EventType', eventTypeSchema);
