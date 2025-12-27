const express = require('express');
const router = express.Router();
const EventType = require('../models/EventType');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { createCalendarEvent } = require('../utils/googleCalendar');
const { sendConfirmationEmail } = require('../utils/email');

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

router.post('/events', isAuthenticated, async (req, res) => {
    try {
        // Basic unique slug check
        const existing = await EventType.findOne({ slug: req.body.slug });
        if (existing) {
            req.body.slug = `${req.body.slug}-${Math.floor(Math.random() * 1000)}`;
        }
        const event = await EventType.create({ ...req.body, userId: req.user._id });
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/events/:id', isAuthenticated, async (req, res) => {
    try {
        const event = await EventType.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );
        res.json(event);
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
            additionalGuests,
            startTime,
            notes,
            title,      // Optional, for quick meetings
            duration    // Optional, for quick meetings
        } = req.body;

        let host, eventTitle, eventDuration;

        if (eventId) {
            const eventType = await EventType.findById(eventId).populate('userId');
            if (!eventType)
                return res.status(404).json({ message: 'Event Type not found' });
            host = eventType.userId;
            eventTitle = eventType.title;
            eventDuration = eventType.duration;
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
                notes: notes || '',
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
            additionalGuests,
            startTime,
            endTime,
            notes,
            title: eventTitle,
            duration: eventDuration,
            googleEventId: googleEventData ? googleEventData.id : null,
            status: 'confirmed',
        });

        const emailSubject = `Confirmation: ${eventTitle} with ${host.name}`;
        const allGuests = [guestEmail, ...(additionalGuests || [])];

        const emailHtml = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Meeting Confirmed!</h2>
        <p>You are scheduled for:</p>
        <p><strong>Event:</strong> ${eventTitle}</p>
        <p><strong>Host:</strong> ${host.name}</p>
        <p><strong>Date & Time:</strong> ${new Date(startTime).toLocaleString(
            'en-US',
            { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' }
        )} (IST)</p>
        
        ${meetingLink
                ? `
        <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
            <p style="margin: 0; font-weight: bold;">Join via Google Meet:</p>
            <a href="${meetingLink}" style="color: #2563eb; font-size: 16px;">${meetingLink}</a>
        </div>`
                : ''
            }
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">This invitation was sent via Tesseract.</p>
      </div>
    `;

        allGuests.forEach((email) =>
            sendConfirmationEmail(email, emailSubject, emailHtml)
        );

        sendConfirmationEmail(
            host.email,
            `New Booking: ${guestName} - ${eventTitle}`,
            emailHtml
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
