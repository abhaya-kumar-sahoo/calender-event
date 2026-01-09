const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
    domain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }, // Optional if linked directly to User, but Tenant is better for scaling
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Linking to user for now as Tenant might not exist typically yet
    verificationToken: { type: String, required: true },
    verified: { type: Boolean, default: false },
    sslStatus: {
        type: String,
        enum: ['none', 'pending', 'issued', 'failed'],
        default: 'none'
    },
    sslError: { type: String },
    verifiedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Domain', domainSchema);
