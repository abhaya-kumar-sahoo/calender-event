import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { EventType, Booking } from "../types";
import { baseUrl } from "../utils";

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
    login: builder.mutation<any, any>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    register: builder.mutation<any, any>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    resetPassword: builder.mutation<any, any>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
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
    getSlotAvailability: builder.query<
      any,
      { id: string; date: string; timezone: string }
    >({
      query: ({ id, date, timezone }) => ({
        url: `/api/events/${id}/slot-availability`,
        params: { date, timezone },
      }),
    }),
    getMonthAvailability: builder.query<
      any,
      { id: string; year: number; month: number; timezone: string }
    >({
      query: ({ id, year, month, timezone }) => ({
        url: `/api/events/${id}/month-availability`,
        params: { year, month, timezone },
      }),
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
    // OTP
    sendOtp: builder.mutation<
      any,
      { email: string; eventId?: string; type?: string }
    >({
      query: (body) => ({
        url: "/api/otp/send",
        method: "POST",
        body,
      }),
    }),
    verifyOtp: builder.mutation<any, { email: string; otp: string }>({
      query: (body) => ({
        url: "/api/otp/verify",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useCheckAuthQuery,
  useLoginMutation,
  useRegisterMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
  useGetEventsQuery,
  useGetPublicEventQuery,
  useGetSlotAvailabilityQuery,
  useGetMonthAvailabilityQuery,
  useAddEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetBookingsQuery,
  useAddBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
} = apiSlice;
