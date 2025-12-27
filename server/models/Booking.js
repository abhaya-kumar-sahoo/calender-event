const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventType', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Host ID for easy querying
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
    additionalGuests: [String],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    notes: String,
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    googleEventId: String,
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
