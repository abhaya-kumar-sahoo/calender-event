/**
 * Utility functions for checking event availability on the frontend
 */

export interface TimeRange {
  start: string;
  end: string;
}

export interface WeeklyHours {
  day:
    | "sunday"
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday";
  isAvailable: boolean;
  timeRanges: TimeRange[];
}

export interface DateOverride {
  date: string; // YYYY-MM-DD
  isAvailable: boolean;
  timeRanges: TimeRange[];
}

export interface Availability {
  note?: string;
  weeklyHours?: WeeklyHours[];
  dateOverrides?: DateOverride[];
  timezone?: string;
}

/**
 * Check if a specific date is available based on event availability settings
 */
export function isDateAvailable(
  date: Date,
  availability?: Availability
): boolean {
  if (
    !availability ||
    !availability.weeklyHours ||
    availability.weeklyHours.length === 0
  ) {
    // If no availability settings, assume all dates are available
    return true;
  }

  const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD

  // Check for date-specific overrides first
  if (availability.dateOverrides && availability.dateOverrides.length > 0) {
    const override = availability.dateOverrides.find((o) => o.date === dateStr);
    if (override) {
      return (
        override.isAvailable &&
        override.timeRanges &&
        override.timeRanges.length > 0
      );
    }
  }

  // Check weekly hours
  const dayNames: Array<WeeklyHours["day"]> = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayOfWeek = dayNames[date.getDay()];

  const dayAvailability = availability.weeklyHours.find(
    (wh) => wh.day === dayOfWeek
  );

  if (!dayAvailability) {
    return false; // Day not configured
  }

  return (
    dayAvailability.isAvailable &&
    dayAvailability.timeRanges &&
    dayAvailability.timeRanges.length > 0
  );
}

/**
 * Get available time slots for a specific date
 */
export function getAvailableTimeSlots(
  date: Date,
  availability: Availability | undefined,
  guestTimezone: string = "Asia/Kolkata",
  interval: number = 30 // Default to 30 minutes
): string[] {
  if (
    !availability ||
    !availability.weeklyHours ||
    availability.weeklyHours.length === 0
  ) {
    // Fallback to default 10am-7pm slots
    return generateDefaultSlots(date, guestTimezone, interval);
  }

  const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD

  let timeRanges: TimeRange[] = [];

  // Check for date-specific overrides first
  if (availability.dateOverrides && availability.dateOverrides.length > 0) {
    const override = availability.dateOverrides.find((o) => o.date === dateStr);
    if (override) {
      if (
        !override.isAvailable ||
        !override.timeRanges ||
        override.timeRanges.length === 0
      ) {
        return [];
      }
      timeRanges = override.timeRanges;
    }
  }

  // If no override, use weekly hours
  if (timeRanges.length === 0) {
    const dayNames: Array<WeeklyHours["day"]> = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayOfWeek = dayNames[date.getDay()];
    const dayAvailability = availability.weeklyHours.find(
      (wh) => wh.day === dayOfWeek
    );

    if (
      !dayAvailability ||
      !dayAvailability.isAvailable ||
      !dayAvailability.timeRanges
    ) {
      return [];
    }

    timeRanges = dayAvailability.timeRanges;
  }

  // Generate slots from time ranges
  const slots: string[] = [];

  timeRanges.forEach((range) => {
    const [startHour, startMin] = range.start.split(":").map(Number);
    const [endHour, endMin] = range.end.split(":").map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin < endMin)
    ) {
      const timeStr = `${currentHour.toString().padStart(2, "0")}:${currentMin
        .toString()
        .padStart(2, "0")}:00`;
      const iso = `${dateStr}T${timeStr}`;

      // Create date in host timezone
      const slotDate = new Date(iso);

      // Convert to guest timezone
      const guestTimeStr = new Intl.DateTimeFormat("en-US", {
        timeZone: guestTimezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(slotDate);

      if (!slots.includes(guestTimeStr)) {
        slots.push(guestTimeStr);
      }

      // Increment by interval
      currentMin += interval;
      while (currentMin >= 60) {
        currentMin -= 60;
        currentHour += 1;
      }
    }
  });

  return slots;
}

/**
 * Generate default time slots (10am-7pm) for backward compatibility
 */
function generateDefaultSlots(
  date: Date,
  guestTimezone: string,
  interval: number = 30
): string[] {
  const slots: string[] = [];
  const dateStr = date.toISOString().split("T")[0];

  for (let h = 10; h < 19; h++) {
    let m = 0;
    while (m < 60) {
      const timeStr = `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}:00`;
      const iso = `${dateStr}T${timeStr}`;
      const slotDate = new Date(iso);

      const guestTimeStr = new Intl.DateTimeFormat("en-US", {
        timeZone: guestTimezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(slotDate);

      if (!slots.includes(guestTimeStr)) {
        slots.push(guestTimeStr);
      }

      m += interval;
    }
  }

  return slots;
}
