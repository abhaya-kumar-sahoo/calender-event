import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { EventType, Booking } from "../types";
import { baseUrl } from "../utility";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    credentials: "include",
  }),
  tagTypes: ["User", "Events", "Bookings"],
  endpoints: (builder) => ({
    // Auth
    checkAuth: builder.query<any, void>({
      query: () => "/auth/user",
      providesTags: ["User"],
    }),
    logout: builder.mutation<void, void>({
      query: () => "/auth/logout",
      invalidatesTags: ["User"],
    }),
    updateProfile: builder.mutation<any, any>({
      query: (body) => ({
        url: "/api/user/profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // Events
    getEvents: builder.query<EventType[], void>({
      query: () => "/api/events",
      providesTags: ["Events"],
    }),
    getPublicEvent: builder.query<EventType, string>({
      query: (id) => `/api/public/events/${id}`,
    }),
    addEvent: builder.mutation<EventType, Partial<EventType>>({
      query: (body) => ({
        url: "/api/events",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Events"],
    }),
    updateEvent: builder.mutation<
      EventType,
      { id: string; updates: Partial<EventType> }
    >({
      query: ({ id, updates }) => ({
        url: `/api/events/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ["Events"],
    }),
    deleteEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/events/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Events"],
    }),

    // Bookings
    getBookings: builder.query<Booking[], void>({
      query: () => "/api/bookings",
      providesTags: ["Bookings"],
    }),
    addBooking: builder.mutation<Booking, any>({
      query: (body) => ({
        url: "/api/bookings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Bookings"],
    }),
    updateBooking: builder.mutation<
      Booking,
      { id: string; updates: Partial<Booking> }
    >({
      query: ({ id, updates }) => ({
        url: `/api/bookings/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ["Bookings"],
    }),
    deleteBooking: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/bookings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Bookings"],
    }),
  }),
});

export const {
  useCheckAuthQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
  useGetEventsQuery,
  useGetPublicEventQuery,
  useAddEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetBookingsQuery,
  useAddBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
} = apiSlice;
