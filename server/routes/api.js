const express = require('express');
const router = express.Router();
const EventType = require('../models/EventType');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { createCalendarEvent } = require('../utils/googleCalendar');
const { sendConfirmationEmail } = require('../utils/email');
const { upload } = require('../utils/s3');

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: 'Unauthorized' });
};

// --- Event Types (Protected) ---
router.get('/events', isAuthenticated, async (req, res) => {
    try {
        const events = await EventType.find({ userId: req.user._id });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/events', isAuthenticated, upload.single('eventImage'), async (req, res) => {
    try {
        const eventData = { ...req.body };
        if (req.file) {
            eventData.eventImage = req.file.location;
        }

        // Basic unique slug check
        const existing = await EventType.findOne({ slug: eventData.slug });
        if (existing) {
            eventData.slug = `${eventData.slug}-${Math.floor(Math.random() * 1000)}`;
        }
        const event = await EventType.create({ ...eventData, userId: req.user._id });
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/events/:id', isAuthenticated, upload.single('eventImage'), async (req, res) => {
    try {
        const updateData = { ...req.body };
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
});

router.delete('/events/:id', isAuthenticated, async (req, res) => {
    try {
        const event = await EventType.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Public Access for Booking Page ---
router.get('/public/events/:id', async (req, res) => {
    try {
        const event = await EventType.findById(req.params.id).populate(
            'userId',
            'name email picture'
        );
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Bookings ---
router.post('/bookings', async (req, res) => {
    try {
        const {
            eventId,
            guestName,
            guestEmail,
            guestMobile, // Extract mobile
            additionalGuests,
            startTime,
            notes,
            title,      // Optional, for quick meetings
            duration    // Optional, for quick meetings
        } = req.body;

        let host, eventTitle, eventDuration, eventData = {};

        if (eventId) {
            const eventType = await EventType.findById(eventId).populate('userId');
            if (!eventType)
                return res.status(404).json({ message: 'Event Type not found' });
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
            };
        } else {
            // Quick meeting flow: Must be authenticated to act as host
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized: Host not authenticated for quick meeting' });
            }
            host = req.user;
            eventTitle = title || 'Quick Meeting';
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
                notes: `Mobile: ${guestMobile || 'N/A'}\n${notes || ''}\nLocation: ${eventData.locationAddress || eventData.location || 'N/A'}`, // Append mobile and location to Google Calendar notes
                startTime: startTime,
                endTime: endTime.toISOString(),
                guestEmail,
                additionalGuests,
            });
            googleEventData = gEvent;
            meetingLink = gEvent.hangoutLink;
        } catch (gError) {
            console.error('Failed to sync with Google Calendar', gError);
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
            status: 'confirmed',
        });

        const emailSubject = `Confirmation: ${eventTitle} with ${host.name}`;
        const allGuests = [guestEmail, ...(additionalGuests || [])];

        const formattedDate = new Date(startTime).toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'full',
            timeStyle: 'short',
        }); // e.g., "Sunday, January 4, 2026 at 9:30 AM"

        // Format for Guest Email (Image 3 style)
        // Extract time and date separately for cleaner formatting if needed
        const guestEmailHtml = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #374151;">
        <p>Hi ${guestName},</p>
        <p>Your <strong>${eventTitle}</strong> with <strong>Heritage Lane and Co Furniture</strong> at <strong>${formattedDate} (Australian Eastern Time)</strong> is scheduled.</p>
        
        <p style="margin-top: 20px;">Stay as long as you like, explore every detail, and experience how true craftsmanship feels in person.</p>
        <p>Fall in love with the warmth of solid teak, hand-carved details, and timeless designs!</p>

        <p style="margin-top: 20px;"><strong>Location:</strong> 1/22-30 Wallace Ave, Point Cook VIC 3030</p>

        <h3 style="margin-top: 30px; font-size: 16px; font-weight: bold;">Your Answers:</h3>
        <p><strong>Phone Number</strong><br>${guestMobile || 'N/A'}</p>
        <p><strong>Product Interest</strong><br>${notes || 'N/A'}</p>
      </div>
    `;

        // Format for Host Email (Image 1 style)
        const hostEmailHtml = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #374151;">
        <div style="text-align: center; margin-bottom: 20px;">
             <!-- Placeholder for logo if needed -->
        </div>
        <hr style="border: 0; border-top: 1px dashed #d1d5db; margin: 20px 0;" />
        
        <p>Hi Heritage Lane and Co Furniture,</p>
        <p>A new invitee has been scheduled.</p>

        <div style="margin-top: 20px;">
            <p style="margin-bottom: 4px; font-weight: bold;">Event Type:</p>
            <p style="margin-top: 0;">${eventTitle}</p>
        </div>

        <div style="margin-top: 16px;">
            <p style="margin-bottom: 4px; font-weight: bold;">Invitee:</p>
            <p style="margin-top: 0;">${guestName}</p>
        </div>

        <div style="margin-top: 16px;">
            <p style="margin-bottom: 4px; font-weight: bold;">Invitee Email:</p>
            <p style="margin-top: 0;"><a href="mailto:${guestEmail}" style="color: #2563eb; text-decoration: none;">${guestEmail}</a></p>
        </div>

        <div style="margin-top: 16px;">
            <p style="margin-bottom: 4px; font-weight: bold;">Event Date/Time:</p>
            <p style="margin-top: 0;">${formattedDate} (Australian Eastern Time)</p>
        </div>
        
         <div style="margin-top: 16px;">
            <p style="margin-bottom: 4px; font-weight: bold;">Mobile:</p>
            <p style="margin-top: 0;">${guestMobile || 'N/A'}</p>
        </div>
      </div>
    `;

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

router.get('/bookings', isAuthenticated, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.put('/bookings/:id', isAuthenticated, async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        ).populate('userId'); // Ensure userId is populated to get host email

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Send cancellation email if status is changed to 'cancelled'
        if (req.body.status === 'cancelled') {
            const host = booking.userId;
            const bookingTitle = booking.title || 'Meeting'; // Fallback if title not saved

            const emailSubject = `Cancelled: ${bookingTitle} with ${host.name}`;
            const emailHtml = `
                <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Meeting Cancelled</h2>
                    <p>The following meeting has been cancelled:</p>
                    <p><strong>Event:</strong> ${bookingTitle}</p>
                    <p><strong>Host:</strong> ${host.name}</p>
                    <p><strong>Original Date & Time:</strong> ${new Date(booking.startTime).toLocaleString('en-US', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' })} (IST)</p>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">This notification was sent via Tesseract.</p>
                </div>
             `;

            // Send to guest
            sendConfirmationEmail(booking.guestEmail, emailSubject, emailHtml);

            // Send to associated guests
            if (booking.additionalGuests && booking.additionalGuests.length > 0) {
                booking.additionalGuests.forEach(email =>
                    sendConfirmationEmail(email, emailSubject, emailHtml)
                );
            }

            // Send to host
            sendConfirmationEmail(host.email, `Cancelled: ${booking.guestName} - ${bookingTitle}`, emailHtml);
        }

        res.json(booking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/bookings/:id', isAuthenticated, async (req, res) => {
    try {
        const booking = await Booking.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json({ message: 'Booking deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
