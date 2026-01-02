// Simple in-memory storage for OTPs (In production, use Redis or similar)
const otpStore = new Map();
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

module.exports = {
    otpStore,
    OTP_EXPIRY
};
