const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventType' }, // Optional for quick meetings
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Host ID
    title: { type: String }, // For quick meetings or snapshot
    duration: { type: Number }, // For quick meetings or snapshot
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
    guestMobile: { type: String }, // Mobile number
    additionalGuests: [String],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    notes: String,
    location: { type: String, enum: ['in-person', 'gmeet'] },
    locationAddress: String,
    locationUrl: String,
    host: String,
    eventImage: String,
    availability: String,
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    googleEventId: String,
    timezone: String,
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

module.exports = mongoose.model('Booking', bookingSchema);
