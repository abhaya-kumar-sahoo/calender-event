export interface EventType {
  userId: any;
  id: string;
  title: string;
  duration: number; // in minutes
  description: string;
  slug: string;
  color: string;
  location?: "in-person" | "gmeet";
  locationAddress?: string;
  locationUrl?: string;
  host?: string;
  eventImage?: string;
  availability?: string; // Legacy field for backward compatibility
  availabilities?: {
    note?: string;
    weeklyHours?: Array<{
      day:
        | "sunday"
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday";
      isAvailable: boolean;
      timeRanges: Array<{ start: string; end: string }>;
    }>;
    dateOverrides?: Array<{
      date: string;
      isAvailable: boolean;
      timeRanges: Array<{ start: string; end: string }>;
    }>;
    timezone?: string;
  };
  groupMeeting?: {
    enabled: boolean;
    maxGuests: number;
    showRemainingSpots: boolean;
  };
  repeaterFields?: { name: string; url: string }[];
  emailVerify?: boolean;
  phoneVerify?: boolean;
  enablePhoneCheck?: boolean;
  showNotes?: boolean;
  showAdditionalLinks?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  eventId: string;
  guestName: string;
  guestEmail: string;
  guestMobile?: string;
  additionalGuests?: string[];
  startTime: string; // ISO date string
  notes?: string;
  status: "confirmed" | "cancelled";
  title?: string;
  duration?: number;
  location?: "in-person" | "gmeet";
  locationAddress?: string;
  locationUrl?: string;
  host?: string;
  eventImage?: string;
  availabilities?: string | object;
  timezone?: string;
  selectedLink?: string;
}

export type ViewMode = "desktop" | "mobile";
