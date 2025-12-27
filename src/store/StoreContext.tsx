import React, { createContext, useContext } from 'react';
import { Booking, EventType } from '../types';
import {
  useGetEventsQuery,
  useGetBookingsQuery,
  useAddEventMutation,
  useUpdateEventMutation,
  useAddBookingMutation,
  useUpdateBookingMutation,
} from './apiSlice';

interface StoreContextType {
  events: EventType[];
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'status'>) => void;
  addEvent: (event: Omit<EventType, 'id'>) => void;
  getEventBySlug: (slug: string) => EventType | undefined;
  cancelBooking: (id: string) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  updateEvent: (id: string, updates: Partial<EventType>) => void;
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // RTK Query Hooks
  const { data: events = [], isLoading: eventsLoading } = useGetEventsQuery();
  const { data: bookings = [], isLoading: bookingsLoading } =
    useGetBookingsQuery();

  const [addEventMutation] = useAddEventMutation();
  const [updateEventMutation] = useUpdateEventMutation();
  const [addBookingMutation] = useAddBookingMutation();
  const [updateBookingMutation] = useUpdateBookingMutation();

  // NOTE: In a real app, this should fetch from API on-demand or use cached list
  // For now, we'll try to find from the list we already fetched if possible
  const getEventBySlug = (slug: string) => {
    return events.find((e) => e.slug === slug);
  };

  const addEvent = async (eventData: Omit<EventType, 'id'>) => {
    try {
      return await addEventMutation(eventData).unwrap();
    } catch (error) {
      console.error('Failed to add event', error);
      throw error;
    }
  };

  const updateEvent = async (id: string, updates: Partial<EventType>) => {
    try {
      return await updateEventMutation({ id, updates }).unwrap();
    } catch (error) {
      console.error('Failed to update event', error);
      throw error;
    }
  };

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'status'>) => {
    try {
      await addBookingMutation(bookingData).unwrap();
    } catch (error) {
      console.error('Failed to add booking', error);
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      await updateBookingMutation({
        id,
        updates: { status: 'cancelled' },
      }).unwrap();
    } catch (error) {
      console.error('Failed to cancel booking', error);
    }
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      await updateBookingMutation({ id, updates }).unwrap();
    } catch (error) {
      console.error('Failed to update booking', error);
      throw error;
    }
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
        isLoading: eventsLoading || bookingsLoading,
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
