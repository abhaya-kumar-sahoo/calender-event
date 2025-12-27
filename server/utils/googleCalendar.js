const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
);

const createCalendarEvent = async (user, bookingData) => {
    if (!user.refreshToken) {
        console.error('No refresh token for user');
        throw new Error('User not authenticated with Google Calendar');
    }

    oauth2Client.setCredentials({ refresh_token: user.refreshToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
        summary: bookingData.title,
        description: bookingData.notes,
        start: {
            dateTime: bookingData.startTime,
            timeZone: 'Asia/Kolkata', // Should ideally come from user preferences
        },
        end: {
            dateTime: bookingData.endTime,
            timeZone: 'Asia/Kolkata',
        },
        attendees: [
            { email: bookingData.guestEmail },
            ...(bookingData.additionalGuests || []).map(email => ({ email })),
        ],
        conferenceData: {
            createRequest: {
                requestId: Math.random().toString(36).substring(7),
                conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
        },
    };

    try {
        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
            sendUpdates: 'all',
        });
        return response.data;
    } catch (error) {
        console.error('Error creating calendar event:', error);
        throw error;
    }
};

module.exports = { createCalendarEvent };
