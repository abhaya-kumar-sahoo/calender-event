const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
    eventTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventType', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    guestConfirmation: {
        subject: { type: String, default: "Confirmation: {{eventTitle}} with {{hostName}}" },
        body: { type: String },
        bodyBlocks: { type: [String], default: [""] }
    },
    hostNotification: {
        subject: { type: String, default: "New Booking: {{guestName}} - {{eventTitle}}" },
        body: { type: String }
    }
}, { timestamps: true });

// Ensure one template per event type
emailTemplateSchema.index({ eventTypeId: 1 }, { unique: true });

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
