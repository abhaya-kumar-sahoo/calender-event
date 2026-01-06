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
    availabilities: {
        // Legacy string field for backward compatibility
        note: String,
        // Structured availability data
        weeklyHours: [{
            day: { type: String, enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] },
            isAvailable: { type: Boolean, default: true },
            timeRanges: [{
                start: String, // e.g., "09:00"
                end: String    // e.g., "17:00"
            }]
        }],
        dateOverrides: [{
            date: String, // ISO date string YYYY-MM-DD
            isAvailable: { type: Boolean, default: false },
            timeRanges: [{
                start: String,
                end: String
            }]
        }],
        timezone: { type: String, default: 'Asia/Kolkata' }
    },
    // Meeting limits
    meetingLimits: {
        enabled: { type: Boolean, default: false },
        maxPerSlot: { type: Number, default: 1 }
    },
    // Group meetings
    groupMeeting: {
        enabled: { type: Boolean, default: false },
        maxGuests: { type: Number, default: 10 },
        showRemainingSpots: { type: Boolean, default: true }
    },
    repeaterFields: [{
        name: String,
        url: String
    }],
    emailVerify: { type: Boolean, default: false },
    phoneVerify: { type: Boolean, default: false },
    enablePhoneCheck: { type: Boolean, default: false },
    showNotes: { type: Boolean, default: true },
    showAdditionalLinks: { type: Boolean, default: true },
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
