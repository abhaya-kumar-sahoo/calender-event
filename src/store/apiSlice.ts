import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { EventType, Booking } from '../types';
import { isTesting } from '../utility';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: isTesting
      ? 'http://localhost:5001'
      : 'https://calender-event-6p9k.onrender.com',
    credentials: 'include',
  }),
  tagTypes: ['User', 'Events', 'Bookings'],
  endpoints: (builder) => ({
    // Auth
    checkAuth: builder.query<any, void>({
      query: () => '/auth/user',
      providesTags: ['User'],
    }),
    logout: builder.mutation<void, void>({
      query: () => '/auth/logout',
      invalidatesTags: ['User'],
    }),

    // Events
    getEvents: builder.query<EventType[], void>({
      query: () => '/api/events',
      providesTags: ['Events'],
    }),
    getEventBySlug: builder.query<EventType, string>({
      query: (slug) => `/api/public/events/${slug}`,
    }),
    addEvent: builder.mutation<EventType, Partial<EventType>>({
      query: (body) => ({
        url: '/api/events',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Events'],
    }),
    updateEvent: builder.mutation<
      EventType,
      { id: string; updates: Partial<EventType> }
    >({
      query: ({ id, updates }) => ({
        url: `/api/events/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Events'],
    }),

    // Bookings
    getBookings: builder.query<Booking[], void>({
      query: () => '/api/bookings',
      providesTags: ['Bookings'],
    }),
    addBooking: builder.mutation<Booking, any>({
      query: (body) => ({
        url: '/api/bookings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Bookings'],
    }),
    updateBooking: builder.mutation<
      Booking,
      { id: string; updates: Partial<Booking> }
    >({
      query: ({ id, updates }) => ({
        url: `/api/bookings/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Bookings'],
    }),
    deleteBooking: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/bookings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Bookings'],
    }),
  }),
});

export const {
  useCheckAuthQuery,
  useLogoutMutation,
  useGetEventsQuery,
  useGetEventBySlugQuery,
  useAddEventMutation,
  useUpdateEventMutation,
  useGetBookingsQuery,
  useAddBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
} = apiSlice;
