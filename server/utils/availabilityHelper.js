/**
 * Utility functions for checking event availability based on weekly hours and date overrides
 */

/**
 * Check if a specific date is available based on event availability settings
 * @param {Date} date - The date to check
 * @param {Object} availability - The availability object from event type
 * @returns {boolean} - True if the date is available
 */
function isDateAvailable(date, availability) {
    if (!availability || !availability.weeklyHours) {
        // If no availability settings, assume all dates are available
        return true;
    }

    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

    // Check for date-specific overrides first
    if (availability.dateOverrides && availability.dateOverrides.length > 0) {
        const override = availability.dateOverrides.find(o => o.date === dateStr);
        if (override) {
            return override.isAvailable && override.timeRanges && override.timeRanges.length > 0;
        }
    }

    // Check weekly hours
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[date.getDay()];

    const dayAvailability = availability.weeklyHours.find(wh => wh.day === dayOfWeek);

    if (!dayAvailability) {
        return false; // Day not configured
    }

    return dayAvailability.isAvailable && dayAvailability.timeRanges && dayAvailability.timeRanges.length > 0;
}

/**
 * Get available time slots for a specific date
 * @param {Date} date - The date to get slots for
 * @param {Object} availability - The availability object from event type
 * @param {number} duration - Event duration in minutes
 * @param {string} guestTimezone - Guest's timezone
 * @returns {Array<string>} - Array of available time slots in guest timezone
 */
function getAvailableTimeSlots(date, availability, duration = 30, guestTimezone = 'Asia/Kolkata') {
    if (!availability || !availability.weeklyHours) {
        // Fallback to default 10am-7pm slots
        return generateDefaultSlots(date, guestTimezone);
    }

    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const hostTimezone = availability.timezone || 'Asia/Kolkata';

    let timeRanges = [];

    // Check for date-specific overrides first
    if (availability.dateOverrides && availability.dateOverrides.length > 0) {
        const override = availability.dateOverrides.find(o => o.date === dateStr);
        if (override) {
            if (!override.isAvailable || !override.timeRanges || override.timeRanges.length === 0) {
                return [];
            }
            timeRanges = override.timeRanges;
        }
    }

    // If no override, use weekly hours
    if (timeRanges.length === 0) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = dayNames[date.getDay()];
        const dayAvailability = availability.weeklyHours.find(wh => wh.day === dayOfWeek);

        if (!dayAvailability || !dayAvailability.isAvailable || !dayAvailability.timeRanges) {
            return [];
        }

        timeRanges = dayAvailability.timeRanges;
    }

    // Generate slots from time ranges
    const slots = [];

    timeRanges.forEach(range => {
        const [startHour, startMin] = range.start.split(':').map(Number);
        const [endHour, endMin] = range.end.split(':').map(Number);

        let currentHour = startHour;
        let currentMin = startMin;

        while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
            const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}:00`;
            const iso = `${dateStr}T${timeStr}`;

            // Create date in host timezone
            const date = new Date(iso);

            // Convert to guest timezone
            const guestTimeStr = new Intl.DateTimeFormat('en-US', {
                timeZone: guestTimezone,
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            }).format(date);

            if (!slots.includes(guestTimeStr)) {
                slots.push(guestTimeStr);
            }

            // Increment by 30 minutes
            currentMin += 30;
            if (currentMin >= 60) {
                currentMin = 0;
                currentHour += 1;
            }
        }
    });

    return slots;
}

/**
 * Generate default time slots (10am-7pm) for backward compatibility
 */
function generateDefaultSlots(date, guestTimezone) {
    const slots = [];
    const dateStr = date.toISOString().split('T')[0];

    for (let h = 10; h < 19; h++) {
        [0, 30].forEach(m => {
            const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
            const iso = `${dateStr}T${timeStr}`;
            const date = new Date(iso);

            const guestTimeStr = new Intl.DateTimeFormat('en-US', {
                timeZone: guestTimezone,
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            }).format(date);

            if (!slots.includes(guestTimeStr)) {
                slots.push(guestTimeStr);
            }
        });
    }

    return slots;
}

module.exports = {
    isDateAvailable,
    getAvailableTimeSlots
};
