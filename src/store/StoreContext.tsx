import React, { createContext, useContext } from 'react';
import { Booking, EventType } from '../types';
import {
  useGetEventsQuery,
  useGetBookingsQuery,
  useAddEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useAddBookingMutation,
  useUpdateBookingMutation,
} from './apiSlice';

interface StoreContextType {
  events: EventType[];
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'status'>) => void;
  addEvent: (event: Omit<EventType, 'id'>) => void;
  // getEventBySlug removed as we fetch by ID publicly now
  cancelBooking: (id: string) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  updateEvent: (id: string, updates: Partial<EventType>) => void;
  deleteEvent: (id: string) => void;
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
  const [deleteEventMutation] = useDeleteEventMutation();
  const [addBookingMutation] = useAddBookingMutation();
  const [updateBookingMutation] = useUpdateBookingMutation();

  // getEventBySlug removed

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

  const deleteEvent = async (id: string) => {
    try {
      await deleteEventMutation(id).unwrap();
    } catch (error) {
      console.error('Failed to delete event', error);
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
        // getEventBySlug,
        cancelBooking,
        updateBooking,
        updateEvent,
        deleteEvent,
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
