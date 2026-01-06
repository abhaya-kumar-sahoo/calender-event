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

            // Parse groupMeeting if it's a JSON string
            if (eventData.groupMeeting && typeof eventData.groupMeeting === "string") {
                try {
                    eventData.groupMeeting = JSON.parse(eventData.groupMeeting);
                } catch (e) {
                    console.error("Failed to parse groupMeeting", e);
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

            // Parse groupMeeting if it's a JSON string
            if (updateData.groupMeeting && typeof updateData.groupMeeting === "string") {
                try {
                    updateData.groupMeeting = JSON.parse(updateData.groupMeeting);
                } catch (e) {
                    console.error("Failed to parse groupMeeting", e);
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


// Get slot availability for group meetings
router.get("/events/:id/slot-availability", async (req, res) => {
    try {
        const { date, timezone } = req.query;

        if (!date) {
            return res.status(400).json({ message: "Date parameter is required" });
        }

        const event = await EventType.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // If not a group meeting, return empty slots
        if (!event.groupMeeting || !event.groupMeeting.enabled) {
            return res.json({ slots: [] });
        }

        // Parse the date and get start/end of day
        const selectedDate = new Date(date);
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Get all confirmed bookings for this event on this date
        const bookings = await Booking.find({
            eventId: req.params.id,
            startTime: {
                $gte: startOfDay,
                $lt: endOfDay
            },
            status: 'confirmed'
        });

        // Group bookings by time slot
        const slotCounts = {};
        bookings.forEach(booking => {
            const bookingTime = new Date(booking.startTime);
            const hours = bookingTime.getHours().toString().padStart(2, '0');
            const minutes = bookingTime.getMinutes().toString().padStart(2, '0');
            const timeKey = `${hours}:${minutes}`;
            slotCounts[timeKey] = (slotCounts[timeKey] || 0) + 1;
        });

        // Convert to array format with availability info
        const slots = Object.keys(slotCounts).map(time => ({
            time,
            booked: slotCounts[time],
            capacity: event.groupMeeting.maxGuests,
            available: event.groupMeeting.maxGuests - slotCounts[time],
            isFull: slotCounts[time] >= event.groupMeeting.maxGuests
        }));

        res.json({ slots, capacity: event.groupMeeting.maxGuests });
    } catch (err) {
        console.error("Error fetching slot availability:", err);
        res.status(500).json({ error: err.message });
    }
});

// Get month availability (fully booked days)
router.get("/events/:id/month-availability", async (req, res) => {
    try {
        const { year, month, timezone } = req.query;

        if (!year || !month) {
            return res.status(400).json({ message: "Year and month are required" });
        }

        const event = await EventType.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // If not group meeting, fallback (or implement for 1-on-1 if needed later)
        if (!event.groupMeeting || !event.groupMeeting.enabled) {
            return res.json({ fullDates: [] });
        }

        const startDate = new Date(parseInt(year), parseInt(month), 1);
        const endDate = new Date(parseInt(year), parseInt(month) + 1, 0);

        // Get all bookings for the month
        const bookings = await Booking.find({
            eventId: req.params.id,
            startTime: {
                $gte: startDate,
                $lte: endDate
            },
            status: 'confirmed'
        });

        const fullDates = [];
        const daysInMonth = endDate.getDate();

        // Helper to check availability for a date (similar to frontend helper)
        const getSlotsForDate = (date) => {
            // This is a simplified version of the detailed slot generation
            // In a production app, this logic should be shared/centralized
            const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const dayOfWeek = dayNames[date.getDay()];
            const dateStr = date.toISOString().split("T")[0];

            let timeRanges = [];

            // Check overrides
            if (event.availabilities?.dateOverrides) {
                const override = event.availabilities.dateOverrides.find(o => o.date === dateStr);
                if (override) {
                    if (!override.isAvailable) return [];
                    timeRanges = override.timeRanges || [];
                }
            }

            // Check weekly hours if no override found (or if override didn't return early)
            if (timeRanges.length === 0) {
                const dayConfig = event.availabilities?.weeklyHours?.find(wh => wh.day === dayOfWeek);
                if (!dayConfig || !dayConfig.isAvailable) return [];
                timeRanges = dayConfig.timeRanges || [];
            }

            // Generate slots count
            let totalSlots = 0;
            timeRanges.forEach(range => {
                const [startH, startM] = range.start.split(':').map(Number);
                const [endH, endM] = range.end.split(':').map(Number);
                let currentH = startH;
                let currentM = startM;

                while (currentH < endH || (currentH === endH && currentM < endM)) {
                    totalSlots++;
                    currentM += 30; // Assuming 30 min slots
                    if (currentM >= 60) {
                        currentM = 0;
                        currentH++;
                    }
                }
            });
            return totalSlots;
        };


        for (let d = 1; d <= daysInMonth; d++) {
            const currentDate = new Date(parseInt(year), parseInt(month), d);
            const totalPossibleSlots = getSlotsForDate(currentDate);

            if (totalPossibleSlots === 0) continue; // Note available anyway

            // Count bookings for this day
            const dayStart = new Date(currentDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(currentDate);
            dayEnd.setHours(23, 59, 59, 999);

            const dayBookings = bookings.filter(b =>
                new Date(b.startTime) >= dayStart &&
                new Date(b.startTime) <= dayEnd
            );

            // Check if every slot is full
            const slotCounts = {};
            dayBookings.forEach(b => {
                const timeKey = new Date(b.startTime).toISOString(); // Simplified key
                slotCounts[timeKey] = (slotCounts[timeKey] || 0) + 1;
            });

            // Since we don't have exact time keys matching without generating them all,
            // we can approximate: if (total Bookings >= totalPossibleSlots * maxGuests)
            // But this is inaccurate if one slot is overbooked (shouldn't happen) and others empty.
            // Accurate way: calculate slots, then map bookings to them.

            // Re-generating exact slots for accurate check
            // ... (For brevity, let's assume if total bookings matches capacity * slots, it's full. 
            // Ideally we should replicate the bucket logic from the single-day endpoint)

            // Let's refine based on the single day logic:
            // 1. Generate all slot times for the day
            // 2. Count bookings per slot
            // 3. If ALL slots have count >= maxGuests, then day is full.

            // ... (Simplified for this file size constraints: 
            // If we assume bookings are distributed, we can check detailed logic later.
            // For now, let's skip complex re-implementation of slot generation here 
            // and rely on a simpler heuristic or just iterate properly if performance allows.)

            // Strict check implementation:
            // ... [Logic to generate 'slots' array similar to getSlotsForDate but returning times]
            // For now, let's strictly count filled slots.

            // This is getting complex for a single route handler. 
            // Ideally we'd extract the slot generator to a utility.
            // Given the context, let's do a best-effort "is likely full" 
            // or just check if *any* slot is available.

            // Actually, the user asked: "if in a date full time get filled then that date should be disabled"
            // This implies if ALL slots are full.

            // Let's iterate properly:
            // [Re-using slot generation logic logic]
            const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const dayOfWeek = dayNames[currentDate.getDay()];
            // Fix: Manually construct date string to avoid timezone shifts from toISOString()
            // month is 0-indexed in JS Date/params, but humans/components expect 1-based months in date strings often,
            // HOWEVER, my implementation plan and usage in BookingPage usually expects YYYY-MM-DD.
            // Let's stick to standard ISO format "YYYY-MM-DD".
            const dateM = parseInt(month) + 1;
            const dateStr = `${year}-${dateM.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
            let timeRanges = [];

            if (event.availabilities?.dateOverrides) {
                const override = event.availabilities.dateOverrides.find(o => o.date === dateStr);
                if (override) {
                    if (!override.isAvailable) continue; // Day closed
                    timeRanges = override.timeRanges || [];
                }
            }
            if (timeRanges.length === 0) {
                const dayConfig = event.availabilities?.weeklyHours?.find(wh => wh.day === dayOfWeek);
                if (!dayConfig || !dayConfig.isAvailable) continue; // Day closed
                timeRanges = dayConfig.timeRanges || [];
            }

            let areAllSlotsFull = true;
            let hasAnySlot = false;

            timeRanges.forEach(range => {
                const [startH, startM] = range.start.split(':').map(Number);
                const [endH, endM] = range.end.split(':').map(Number);
                let currentH = startH;
                let currentM = startM;

                while (currentH < endH || (currentH === endH && currentM < endM)) {
                    hasAnySlot = true;
                    // Construct slot time for comparison (UTC/ISO matching is tricky without timezone lib on server, 
                    // relying on stored dates being ISO).
                    // We need to match the booking time.
                    // The backend stores bookings in UTC (ISO). 
                    // We need to check if this specific slot time has >= maxGuests bookings.

                    // We don't easily know the exact ISO string without proper timezone conversion 
                    // matching what the frontend did.

                    // Alternative strategy: 
                    // Filter bookings by their hours/minutes in the EVENT'S timezone? 
                    // Or just check if there are (maxGuests) bookings for this hour/min.

                    const bookingsForSlot = dayBookings.filter(b => {
                        const bDate = new Date(b.startTime);
                        return bDate.getHours() === currentH && bDate.getMinutes() === currentM;
                    });

                    if (bookingsForSlot.length < event.groupMeeting.maxGuests) {
                        areAllSlotsFull = false;
                    }

                    currentM += 30;
                    if (currentM >= 60) {
                        currentM = 0;
                        currentH++;
                    }
                }
            });

            if (hasAnySlot && areAllSlotsFull) {
                fullDates.push(dateStr);
            }
        }

        res.json({ fullDates });
    } catch (err) {
        console.error("Error fetching month availability:", err);
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

            // Check group meeting capacity
            if (eventType.groupMeeting && eventType.groupMeeting.enabled) {
                const existingBookings = await Booking.countDocuments({
                    eventId: eventId,
                    startTime: startTime,
                    status: 'confirmed'
                });

                if (existingBookings >= eventType.groupMeeting.maxGuests) {
                    return res.status(400).json({
                        message: "This time slot is fully booked. Please select another time."
                    });
                }
            }
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
