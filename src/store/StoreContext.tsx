import React, { createContext, useContext, useEffect, useState } from 'react';
import { Booking, EventType } from '../types';

interface StoreContextType {
  events: EventType[];
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'status'>) => void;
  addEvent: (event: Omit<EventType, 'id'>) => void;
  getEventBySlug: (slug: string) => EventType | undefined;
  cancelBooking: (id: string) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  updateEvent: (id: string, updates: Partial<EventType>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const INITIAL_EVENTS: EventType[] = [
  {
    id: '1',
    title: '30 Minute Meeting',
    duration: 30,
    description: 'A quick catch-up call.',
    slug: '30-min-meeting',
    color: 'bg-purple-600',
  },
  {
    id: '2',
    title: 'One-on-One',
    duration: 60,
    description: 'Deep dive session.',
    slug: 'one-on-one',
    color: 'bg-blue-600',
  },
  {
    id: '3',
    title: 'Quick Chat',
    duration: 15,
    description: 'Short sync.',
    slug: 'quick-chat',
    color: 'bg-pink-600',
  },
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: '1',
    eventId: '1',
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    notes: 'Looking forward to it!',
    status: 'confirmed',
  },
];

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<EventType[]>(() => {
    const saved = localStorage.getItem('calendly-clone-events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('calendly-clone-bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  useEffect(() => {
    localStorage.setItem('calendly-clone-events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('calendly-clone-bookings', JSON.stringify(bookings));
  }, [bookings]);

  const addBooking = (bookingData: Omit<Booking, 'id' | 'status'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'confirmed',
    };
    setBookings((prev) => [...prev, newBooking]);
  };

  const addEvent = (eventData: Omit<EventType, 'id'>) => {
    const newEvent: EventType = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  const getEventBySlug = (slug: string) => {
    return events.find((e) => e.slug === slug);
  };

  const cancelBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
    );
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const updateEvent = (id: string, updates: Partial<EventType>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  return (
    <StoreContext.Provider
      value={{
        events,
        bookings,
        addBooking,
        addEvent,
        getEventBySlug,
        cancelBooking,
        updateBooking,
        updateEvent,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
