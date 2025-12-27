export interface EventType {
  id: string;
  title: string;
  duration: number; // in minutes
  description: string;
  slug: string;
  color: string;
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
  status: 'confirmed' | 'cancelled';
  title?: string;
  duration?: number;
}

export type ViewMode = 'desktop' | 'mobile';
