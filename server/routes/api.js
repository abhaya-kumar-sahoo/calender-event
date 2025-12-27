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
router.get('/public/events/:slug', async (req, res) => {
    try {
        const event = await EventType.findOne({ slug: req.params.slug }).populate(
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
        } = req.body;

        const eventType = await EventType.findById(eventId).populate('userId');
        if (!eventType)
            return res.status(404).json({ message: 'Event Type not found' });

        const host = eventType.userId;
        const endTime = new Date(
            new Date(startTime).getTime() + eventType.duration * 60000
        );

        let googleEventData = null;
        let meetingLink = null;

        try {
            const gEvent = await createCalendarEvent(host, {
                title: `Meeting: ${guestName} - ${eventType.title}`,
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
            eventId,
            userId: host._id,
            guestName,
            guestEmail,
            additionalGuests,
            startTime,
            endTime,
            notes,
            googleEventId: googleEventData ? googleEventData.id : null,
            status: 'confirmed',
        });

        const emailSubject = `Confirmation: ${eventType.title} with ${host.name}`;
        const allGuests = [guestEmail, ...(additionalGuests || [])];

        const emailHtml = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Meeting Confirmed!</h2>
        <p>You are scheduled for:</p>
        <p><strong>Event:</strong> ${eventType.title}</p>
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
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">This invitation was sent via Calendly Clone.</p>
      </div>
    `;

        allGuests.forEach((email) =>
            sendConfirmationEmail(email, emailSubject, emailHtml)
        );

        sendConfirmationEmail(
            host.email,
            `New Booking: ${guestName} - ${eventType.title}`,
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
        );
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    } catch (err) {
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
