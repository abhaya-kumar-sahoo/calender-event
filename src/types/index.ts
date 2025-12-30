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
  availability?: string;
  repeaterFields?: { name: string; url: string }[];
  emailVerify?: boolean;
  phoneVerify?: boolean;
  enablePhoneCheck?: boolean;
  showNotes?: boolean;
  showAdditionalLinks?: boolean;
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
  availability?: string;
  timezone?: string;
  selectedLink?: string;
}

export type ViewMode = "desktop" | "mobile";
