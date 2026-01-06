const express = require("express");
const router = express.Router();
const EventType = require("../models/EventType");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { createCalendarEvent } = require("../utils/googleCalendar");
const { sendConfirmationEmail } = require("../utils/email");
const {
    getGuestEmailHtml,
    getHostEmailHtml,
    getOtpEmailHtml,
} = require("../utils/emailTemplates");
const { upload } = require("../utils/s3");

const { otpStore, OTP_EXPIRY } = require("../utils/otpStore");

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
};

// --- Event Types (Protected) ---
router.get("/events", isAuthenticated, async (req, res) => {
    try {
        const events = await EventType.find({ userId: req.user._id });
        console.log({ events });

        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post(
    "/events",
    isAuthenticated,
    upload.single("eventImage"),
    async (req, res) => {
        try {
            const eventData = { ...req.body };
            if (
                eventData.repeaterFields &&
                typeof eventData.repeaterFields === "string"
            ) {
                try {
                    eventData.repeaterFields = JSON.parse(eventData.repeaterFields);
                } catch (e) {
                    console.error("Failed to parse repeaterFields", e);
                }
            }

            // Parse availability if it's a JSON string
            if (eventData.availability && typeof eventData.availability === "string") {
                try {
                    eventData.availability = JSON.parse(eventData.availability);
                } catch (e) {
                    console.error("Failed to parse availability", e);
                }
            }

            // Parse availabilities if it's a JSON string
            if (eventData.availabilities && typeof eventData.availabilities === "string") {
                try {
                    eventData.availabilities = JSON.parse(eventData.availabilities);
                } catch (e) {
                    console.error("Failed to parse availabilities", e);
                }
            }

            if (req.file) {
                eventData.eventImage = req.file.location;
            }

            // Basic unique slug check
            const existing = await EventType.findOne({ slug: eventData.slug });
            if (existing) {
                eventData.slug = `${eventData.slug}-${Math.floor(
                    Math.random() * 1000
                )}`;
            }
            const event = await EventType.create({
                ...eventData,
                userId: req.user._id,
            });
            res.json(event);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

router.put(
    "/events/:id",
    isAuthenticated,
    upload.single("eventImage"),
    async (req, res) => {
        try {
            const updateData = { ...req.body };
            if (
                updateData.repeaterFields &&
                typeof updateData.repeaterFields === "string"
            ) {
                try {
                    updateData.repeaterFields = JSON.parse(updateData.repeaterFields);
                } catch (e) {
                    console.error("Failed to parse repeaterFields", e);
                }
            }

            // Parse availability if it's a JSON string
            if (updateData.availability && typeof updateData.availability === "string") {
                try {
                    updateData.availability = JSON.parse(updateData.availability);
                } catch (e) {
                    console.error("Failed to parse availability", e);
                }
            }

            // Parse availabilities if it's a JSON string
            if (updateData.availabilities && typeof updateData.availabilities === "string") {
                try {
                    updateData.availabilities = JSON.parse(updateData.availabilities);
                } catch (e) {
                    console.error("Failed to parse availabilities", e);
                }
            }

            if (req.file) {
                updateData.eventImage = req.file.location;
            }

            const event = await EventType.findOneAndUpdate(
                { _id: req.params.id, userId: req.user._id },
                updateData,
                { new: true }
            );
            res.json(event);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

router.delete("/events/:id", isAuthenticated, async (req, res) => {
    try {
        const event = await EventType.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.json({ message: "Event deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Public Access for Booking Page ---
router.get("/public/events/:id", async (req, res) => {
    try {
        const event = await EventType.findById(req.params.id).populate(
            "userId",
            "name email picture timezone"
        );
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Bookings ---
router.post("/bookings", async (req, res) => {
    try {
        const {
            eventId,
            guestName,
            guestEmail,
            guestMobile, // Extract mobile
            additionalGuests,
            startTime,
            notes,
            title, // Optional, for quick meetings
            duration, // Optional, for quick meetings
            timezone, // Guest's selected timezone
            selectedLink,
        } = req.body;

        let host,
            eventTitle,
            eventDuration,
            eventData = {};

        if (eventId) {
            const eventType = await EventType.findById(eventId).populate("userId");
            if (!eventType)
                return res.status(404).json({ message: "Event Type not found" });
            host = eventType.userId;
            eventTitle = eventType.title;
            eventDuration = eventType.duration;
            eventData = {
                location: eventType.location,
                locationAddress: eventType.locationAddress,
                locationUrl: eventType.locationUrl,
                host: eventType.host,
                eventImage: eventType.eventImage,
                availability: eventType.availability,
                availabilities: eventType.availabilities,
            };
        } else {
            // Quick meeting flow: Must be authenticated to act as host
            if (!req.user) {
                return res
                    .status(401)
                    .json({
                        message: "Unauthorized: Host not authenticated for quick meeting",
                    });
            }
            host = req.user;
            eventTitle = title || "Quick Meeting";
            eventDuration = duration || 30;
        }

        const endTime = new Date(
            new Date(startTime).getTime() + eventDuration * 60000
        );

        let googleEventData = null;
        let meetingLink = null;

        try {
            const gEvent = await createCalendarEvent(host, {
                title: `Meeting: ${guestName} - ${eventTitle}`,
                notes: `Mobile: ${guestMobile || "N/A"}\n${notes || ""}\nLocation: ${eventData.locationAddress || eventData.location || "N/A"
                    }`, // Append mobile and location to Google Calendar notes
                startTime: startTime,
                endTime: endTime.toISOString(),
                guestEmail,
                additionalGuests,
                timezone,
                location: eventData.location // Pass location to determine if meeting link is needed
            });
            googleEventData = gEvent;
            meetingLink = gEvent.hangoutLink;
        } catch (gError) {
            console.error("Failed to sync with Google Calendar", gError);
        }

        const booking = await Booking.create({
            eventId: eventId || undefined,
            userId: host._id,
            guestName,
            guestEmail,
            guestMobile, // Save mobile to DB
            additionalGuests,
            startTime,
            endTime,
            notes,
            title: eventTitle,
            duration: eventDuration,
            ...eventData,
            googleEventId: googleEventData ? googleEventData.id : null,
            timezone,
            selectedLink,
            status: "confirmed",
        });

        const emailSubject = `Confirmation: ${eventTitle} with ${host.name}`;
        const allGuests = [guestEmail, ...(additionalGuests || [])];

        const formattedDate = new Date(startTime).toLocaleString("en-US", {
            timeZone: timezone || "Asia/Kolkata",
            dateStyle: "full",
            timeStyle: "short",
        });

        // Format for Guest Email
        const guestEmailHtml = getGuestEmailHtml({
            guestName,
            eventTitle,
            formattedDate,
            timezone,
            eventData,
            meetingLink,
            guestMobile,
            notes,
        });

        // Format for Host Email
        const hostEmailHtml = getHostEmailHtml({
            hostName: host.name,
            guestName,
            guestEmail,
            eventTitle,
            formattedDate,
            guestMobile,
            eventData,
            meetingLink,
            additionalGuests,
            startTime,
            notes,
            duration: eventDuration,
            timezone,
            selectedLink,
        });

        // Send to Guests
        allGuests.forEach((email) =>
            sendConfirmationEmail(email, emailSubject, guestEmailHtml)
        );

        // Send to Host
        sendConfirmationEmail(
            host.email,
            `New Booking: ${guestName} - ${eventTitle}`,
            hostEmailHtml
        );

        res.json(booking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get("/bookings", isAuthenticated, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.put("/bookings/:id", isAuthenticated, async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        ).populate("userId"); // Ensure userId is populated to get host email

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Send cancellation email if status is changed to 'cancelled'
        if (req.body.status === "cancelled") {
            const host = booking.userId;
            const bookingTitle = booking.title || "Meeting"; // Fallback if title not saved

            const emailSubject = `Cancelled: ${bookingTitle} with ${host.name}`;
            const emailHtml = `
                <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Meeting Cancelled</h2>
                    <p>The following meeting has been cancelled:</p>
                    <p><strong>Event:</strong> ${bookingTitle}</p>
                    <p><strong>Host:</strong> ${host.name}</p>
                    <p><strong>Original Date & Time:</strong> ${new Date(
                booking.startTime
            ).toLocaleString("en-US", {
                timeZone: booking.timezone || "Asia/Kolkata",
                dateStyle: "full",
                timeStyle: "short",
            })} (${booking.timezone || "Asia/Kolkata"})</p>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">This notification was sent via Invite.</p>
                </div>
             `;

            // Send to guest
            sendConfirmationEmail(booking.guestEmail, emailSubject, emailHtml);

            // Send to associated guests
            if (booking.additionalGuests && booking.additionalGuests.length > 0) {
                booking.additionalGuests.forEach((email) =>
                    sendConfirmationEmail(email, emailSubject, emailHtml)
                );
            }

            // Send to host
            sendConfirmationEmail(
                host.email,
                `Cancelled: ${booking.guestName} - ${bookingTitle}`,
                emailHtml
            );
        }

        res.json(booking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// --- User Profile ---
router.put(
    "/user/profile",
    isAuthenticated,
    upload.single("picture"),
    async (req, res) => {
        try {
            const updateData = { ...req.body };
            if (req.file) {
                updateData.picture = req.file.location;
            }

            const user = await User.findByIdAndUpdate(
                req.user._id,
                { $set: updateData },
                { new: true }
            );
            res.json(user);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

router.delete("/bookings/:id", isAuthenticated, async (req, res) => {
    try {
        const booking = await Booking.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.json({ message: "Booking deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- OTP Verification ---
router.post("/otp/send", async (req, res) => {
    try {
        const { email, eventId, type } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        // Find the host to use their OAuth connection
        let hostUser = null;
        if (eventId) {
            const event = await EventType.findById(eventId).populate("userId");
            if (event && event.userId) {
                hostUser = event.userId;
            }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(email, { otp, expires: Date.now() + OTP_EXPIRY });

        const html = getOtpEmailHtml(otp, type);

        const mailOptions = { to: email, subject: "Your Verification Code", html };

        // Send via primary SMTP as requested
        await sendConfirmationEmail(
            mailOptions.to,
            mailOptions.subject,
            mailOptions.html
        );
        res.json({ message: "OTP sent successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/otp/verify", async (req, res) => {
    try {
        const { email, otp } = req.body;
        const storedData = otpStore.get(email);

        if (!storedData) {
            return res.status(400).json({ message: "OTP not found or expired" });
        }

        if (Date.now() > storedData.expires) {
            otpStore.delete(email);
            return res.status(400).json({ message: "OTP expired" });
        }

        if (storedData.otp === otp) {
            otpStore.delete(email);
            res.json({ success: true, message: "Email verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid OTP" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
