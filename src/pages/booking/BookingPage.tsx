import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useStore } from "../../store/StoreContext";
import {
  useGetPublicEventQuery,
  useGetSlotAvailabilityQuery,
  useGetMonthAvailabilityQuery,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from "../../store/apiSlice";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
} from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Calendar as CalendarIcon,
  ArrowLeft,
  X,
  MapPin,
  ExternalLink,
  Video,
} from "lucide-react";
import clsx from "clsx";
import logo from "../../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { getTimezones, formatTimeInTimezone } from "../../utils/timezoneData";
import { Search, CheckCircle2, AlertCircle } from "lucide-react";
import {
  isDateAvailable,
  getAvailableTimeSlots,
} from "../../utils/availabilityHelper";

type BookingStep = "date-time" | "form" | "confirmation";
const getTimezoneLongName = (tz: string): string => {
  const now = new Date();
  return (
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "long",
    })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value || tz
  );
};

export default function BookingPage() {
  const { id } = useParams();
  const { addBooking } = useStore();
  const { data: event, isLoading } = useGetPublicEventQuery(id || "", {
    skip: !id,
  });

  const [sendOtp] = useSendOtpMutation();
  const [verifyOtp] = useVerifyOtpMutation();

  const [step, setStep] = useState<BookingStep>("date-time");
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [selectedTimezoneLabel, setSelectedTimezoneLabel] = useState(
    getTimezoneLongName(userTZ)
  );

  useEffect(() => {
    const detectTimezoneByIp = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) throw new Error("Failed to fetch IP data");
        const data = await response.json();
        if (data.timezone) {
          setSelectedTimezone(data.timezone);
          setSelectedTimezoneLabel(getTimezoneLongName(data.timezone));
        }
      } catch (error) {
        console.warn(
          "IP-based timezone detection failed, falling back to system timezone:",
          error
        );
      }
    };

    detectTimezoneByIp();
  }, []);

  const [isTimezoneSelectorOpen, setIsTimezoneSelectorOpen] = useState(false);
  const [searchTz, setSearchTz] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    notes: "",
    selectedLink: "",
  });

  // OTP Verification State
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");

  const [showGuestInput, setShowGuestInput] = useState(false);
  const [guestEmails, setGuestEmails] = useState<string[]>([]);
  const [currentGuestInput, setCurrentGuestInput] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  // Calendar Logic
  const {
    data: slotAvailability,
    isFetching: isCheckingAvailability,
    refetch,
    isLoading: isCheckingAvailabilityLoading,
  } = useGetSlotAvailabilityQuery(
    {
      id: id || "",
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      timezone: selectedTimezone,
    },
    {
      skip: !id || !selectedDate || !event?.groupMeeting?.enabled,
    }
  );
  // console.log(slotAvailability);

  // Poll for monthly availability
  const { data: monthAvailability } = useGetMonthAvailabilityQuery(
    {
      id: id || "",
      year: currentMonth.getFullYear(),
      month: currentMonth.getMonth(),
      timezone: selectedTimezone,
    },
    {
      skip: !id || !event?.groupMeeting?.enabled,
      pollingInterval: 30000, // Poll every 30s to keep updated
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Event Not Found
          </h1>
          <p className="text-gray-500 mb-6">
            The event you are looking for does not exist.
          </p>
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Time Slots Generation with Timezone Awareness and Availability Filtering
  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const generateTimeSlots = () => {
    if (!selectedDate || !event) return [];

    // Use the availability helper to get available time slots
    const slots = getAvailableTimeSlots(
      selectedDate,
      event.availabilities,
      selectedTimezone,
      event.duration // Pass duration as interval
    );

    // If group meeting enabled and we have availability data, filter slots
    if (event.groupMeeting?.enabled && slotAvailability?.slots) {
      return slots.filter((time) => {
        const time24 = convertTo24Hour(time);
        const slotData = slotAvailability.slots.find(
          (s: any) => s.time === time24
        );
        // If slot is full, filter it out
        if (slotData?.isFull) return false;
        return true;
      });
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Minimum booking date: 3rd January 2026
  const minDate = new Date(2026, 0, 3);

  const handleDateClick = (day: Date) => {
    if (isBefore(day, minDate)) return;
    setSelectedDate(day);
    setSelectedTime(null); // reset time when date changes
  };

  const handleTimeConfirm = () => {
    if (selectedDate && selectedTime) {
      setStep("form");
    }
  };

  const handleAddGuest = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      const email = currentGuestInput.trim();
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (!guestEmails.includes(email) && guestEmails.length < 10) {
          setGuestEmails([...guestEmails, email]);
          setCurrentGuestInput("");
        }
      }
    }
  };

  const removeGuest = (emailToRemove: string) => {
    setGuestEmails(guestEmails.filter((email) => email !== emailToRemove));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    // Combine date and time (selectedTime is now "10:30 AM" etc. in guest timezone)
    const bookingDate = new Date(selectedDate);
    // Parsing "10:30 AM" or "10:30 PM"
    const [time, modifier] = selectedTime.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    // This bookingDate is still in "local" time of where the browser is
    // We need to interpret this H:M as being in 'selectedTimezone'
    const dateStr = format(bookingDate, "yyyy-MM-dd");
    const isoStr = `${dateStr}T${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:00`;

    // Add any remaining input in guest field if valid
    let finalGuests = [...guestEmails];
    if (
      currentGuestInput &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentGuestInput) &&
      !finalGuests.includes(currentGuestInput)
    ) {
      finalGuests.push(currentGuestInput);
    }
    // console.log(fromZonedTime(isoStr, selectedTimezone).toISOString());
    // console.log({ selectedTimezone });

    addBooking({
      eventId: event.id,
      guestName: formData.name,
      guestEmail: formData.email,
      guestMobile: formData.mobile,
      additionalGuests: finalGuests,
      startTime: fromZonedTime(isoStr, selectedTimezone).toISOString(),
      notes: formData.notes,
      timezone: selectedTimezone,
      selectedLink: formData.selectedLink,
    });

    setStep("confirmation");
  };

  // --- Views ---

  if (step === "confirmation") {
    let endTimeFormatted = "";
    if (selectedTime) {
      // Parse selectedTime (e.g., "10:30 AM")
      const [time, modifier] = selectedTime.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      // Construct a date object representing the start time in the selected timezone
      // We can't simply use new Date() and setHours because that uses browser local time
      // Strategy: Create a full ISO string with offset for the selected timezone?
      // Simpler: Just rely on UTC date construction + duration, then format back.
      // But we don't know the exact date offset for the selected timezone easily here without a library like date-fns-tz
      // However, we already have `selectedDate` which is a Date object (likely local midnight or similar)

      // Let's use the helper assuming selectedDate is correct day.
      // We need to add duration to the *logical* time `hours:minutes`.
      let endHours = hours;
      let endMinutes = minutes + event.duration;

      while (endMinutes >= 60) {
        endMinutes -= 60;
        endHours += 1;
      }
      if (endHours >= 24) {
        endHours -= 24; // If it wraps to next day
        // Ideally we'd note "+1 day" but simpler display is fine usually
      }

      // Format end time manually to match input style or use Intl if possible
      // Let's format manually to ensure consistency with logical math above
      const ampm = endHours >= 12 ? "PM" : "AM";
      const displayH = endHours % 12 || 12;
      const displayM = endMinutes.toString().padStart(2, "0");
      endTimeFormatted = `${displayH}:${displayM} ${ampm} ${selectedTimezoneLabel}`;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full rounded-lg shadow-lg border border-gray-100 p-8 text-center">
          <div className=" flex items-center justify-center mx-auto mb-6">
            <div className="mb-6 flex justify-center">
              <img
                src={event.eventImage || logo}
                alt={event.title}
                className="w-[280px] h-40 object-cover rounded-xl shadow-sm"
              />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmed</h2>
          <p className="text-gray-600 mb-6">
            You are scheduled with{" "}
            {event.host || "Heritage Lane & Co Furniture"}.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 text-left mb-8 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
              <span className="font-bold text-gray-800">{event.title}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <CalendarIcon className="w-4 h-4" />
              {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Clock className="w-4 h-4" />
              {selectedTime} - {endTimeFormatted} ({event.duration} min)
            </div>
            {guestEmails.length > 0 && (
              <div className="mt-3 text-sm text-gray-600 border-t border-gray-200 pt-2">
                <span className="font-medium">Guests:</span>{" "}
                {guestEmails.join(", ")}
              </div>
            )}
          </div>
          <div className="space-y-3">
            {(() => {
              const selectedProduct = event.repeaterFields?.find(
                (l: any) => l.name === formData.selectedLink
              );
              const productUrl = selectedProduct?.url;

              return productUrl ? (
                <a
                  href={productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-md animate-in fade-in slide-in-from-bottom-2 duration-500"
                >
                  Visit Product Page
                </a>
              ) : (
                <button
                  disabled
                  className="block w-full bg-gray-200 text-gray-400 font-medium py-3 px-6 rounded-lg cursor-not-allowed border border-gray-100 shadow-inner"
                >
                  Visit Our Website
                </button>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Panel: Event Info */}
        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-200 md:w-1/3 bg-white">
          {/* Logo */}
          <div className="mb-6 flex justify-center md:justify-start">
            <img
              src={event.eventImage || logo}
              alt={event.title}
              className="w-full h-48 object-contain rounded-xl shadow-md"
            />
          </div>

          {step === "form" && (
            <button
              onClick={() => setStep("date-time")}
              className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-gray-100 text-blue-600 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="text-gray-500 font-medium mb-1">
            {event.host || "Heritage Lane and Co Furniture"}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {event.title}
          </h1>

          <div className="space-y-4 text-gray-600">
            {/* Location */}
            {event.location === "in-person" ? (
              <a
                href={event.locationUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 hover:bg-gray-50 p-2 -ml-2 rounded-lg transition-colors group"
              >
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 group-hover:text-blue-600 transition-colors" />
                <div className="flex-1 text-gray-600 group-hover:text-blue-600 transition-colors">
                  <p className="font-medium">
                    {event.locationAddress || "In-Person Meeting"}
                  </p>
                </div>
                {event.locationUrl && (
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors opacity-70 group-hover:opacity-100" />
                )}
              </a>
            ) : (
              <div className="flex items-center gap-3 text-gray-600 p-2 -ml-2">
                <Video className="w-5 h-5 text-gray-400" />
                <span className="font-medium">Google Meet</span>
              </div>
            )}
          </div>
          {event.description && (
            <p className="mt-6 text-gray-600 text-sm leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        {/* Right Panel: Interactive */}
        <div className="p-6 md:p-8 md:w-2/3 bg-white relative overflow-y-auto">
          {step === "date-time" && (
            <div className="flex flex-col md:flex-row h-fit ">
              {/* Calendar Grid */}
              <div
                className={clsx(
                  "flex-1 transition-all  ",
                  selectedDate ? "md:mr-8" : "w-full mx-auto max-w-sm"
                )}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-2 sticky top-0 bg-white">
                  Select a Date & Time
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Dates available from 3rd January 2026
                </p>

                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5 text-blue-600" />
                  </button>
                  <span className="font-medium text-gray-800">
                    {format(currentMonth, "MMMM yyyy")}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronRight className="w-5 h-5 text-blue-600" />
                  </button>
                </div>

                <div className="grid grid-cols-7 text-center text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (d) => (
                      <div key={d} className="py-2">
                        {d}
                      </div>
                    )
                  )}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day) => {
                    const isSelected = selectedDate
                      ? isSameDay(day, selectedDate)
                      : false;
                    const isPast = isBefore(day, minDate);
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    // Check if date is available based on event availability settings
                    const dateAvailable = isDateAvailable(
                      day,
                      event.availabilities as any
                    );

                    // Check if date is fully booked (from backend)
                    const dateStr = format(day, "yyyy-MM-dd");
                    const isFullyBooked =
                      monthAvailability?.fullDates?.includes(dateStr);

                    const isUnavailable =
                      !isPast && (!dateAvailable || isFullyBooked);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => handleDateClick(day)}
                        disabled={isPast || isUnavailable}
                        className={clsx(
                          "aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-colors relative",
                          !isCurrentMonth && "invisible", // or text-gray-300
                          (isPast || isUnavailable) &&
                          "text-gray-300 cursor-not-allowed line-through decoration-gray-300",
                          !isPast &&
                          !isUnavailable &&
                          isCurrentMonth &&
                          !isSelected &&
                          "text-blue-600 bg-blue-50 hover:bg-blue-100 font-bold",
                          isSelected &&
                          "bg-blue-600 text-white hover:bg-blue-700 shadow-md transform scale-105 z-10"
                        )}
                      >
                        {format(day, "d")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots (Visible only when date selected) */}
              {selectedDate && (
                <div className="w-full md:w-64 border-l border-gray-100 pl-0 md:pl-8 mt-8 md:mt-0 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-gray-900 font-medium mb-4 sticky top-0 bg-white pb-2 z-10">
                    {format(selectedDate, "EEEE, MMM d")}
                  </h3>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                      {timeSlots.map((time) => {
                        const isSelected = selectedTime === time;

                        return (
                          <motion.div
                            key={time}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="relative overflow-hidden rounded-lg border border-gray-200 bg-white"
                          >
                            <div className="flex">
                              {/* Time Button - Always visible, shrinks when selected */}
                              <motion.button
                                layout
                                onClick={() =>
                                  isSelected
                                    ? setSelectedTime(null)
                                    : setSelectedTime(time)
                                }
                                className={clsx(
                                  "py-4 px-2 font-bold text-sm text-center transition-colors a",
                                  isSelected
                                    ? "bg-gray-700 text-white  "
                                    : "text-blue-600 hover:bg-blue-50"
                                )}
                                animate={{
                                  width: isSelected ? "50%" : "100%",
                                }}
                                transition={{
                                  duration: 0.4,
                                  ease: "easeInOut",
                                }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <p>{time}</p>

                                <p>
                                  {event.groupMeeting?.enabled &&
                                    event.groupMeeting?.showRemainingSpots &&
                                    slotAvailability?.slots && (
                                      <span className="ml-2 text-[10px] bg-blue-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                                        {(() => {
                                          const time24 = convertTo24Hour(time);
                                          const slot =
                                            slotAvailability.slots.find(
                                              (s: any) => s.time === time24
                                            );
                                          const remaining = slot
                                            ? slot.available
                                            : event.groupMeeting.maxGuests;
                                          return `${remaining} left`;
                                        })()}
                                      </span>
                                    )}
                                </p>
                              </motion.button>

                              {/* Sliding Action Buttons - Appear only when selected */}
                              <AnimatePresence>
                                {isSelected && (
                                  <motion.div
                                    initial={{ x: "100%" }}
                                    animate={{ x: 0 }}
                                    exit={{ x: "100%" }}
                                    transition={{
                                      duration: 0.5,
                                      ease: "easeOut",
                                    }}
                                    className="flex w-[60%]"
                                  >
                                    {/* Next Button */}
                                    <motion.button
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 0.3 }}
                                      onClick={handleTimeConfirm}
                                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
                                    >
                                      Next
                                    </motion.button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "form" && (
            <div className="max-w-md mx-auto animate-in fade-in slide-in-from-right-8 duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Enter Details
              </h2>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name *
                  </label>
                  <input
                    id="name"
                    required
                    className="w-full text-gray-900 placeholder-gray-500 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full text-gray-900 placeholder-gray-500 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  {event.emailVerify && !isEmailVerified && (
                    <div className="mt-2">
                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!formData.email)
                              return alert("Please enter email first");
                            setIsVerifying(true);
                            try {
                              await sendOtp({
                                email: formData.email,
                                eventId: event.id,
                              }).unwrap();
                              setOtpSent(true);
                              setOtpError("");
                            } catch (err: any) {
                              alert(err.data?.message || "Failed to send OTP");
                            } finally {
                              setIsVerifying(false);
                            }
                          }}
                          disabled={isVerifying}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-all"
                        >
                          {isVerifying ? "Sending..." : "Verify Email"}
                        </button>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <input
                            placeholder="Enter Code"
                            className="w-24 px-3 py-1.5 text-black text-sm rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              setIsVerifying(true);
                              setOtpError("");
                              try {
                                await verifyOtp({
                                  email: formData.email,
                                  otp: otpInput,
                                }).unwrap();
                                setIsEmailVerified(true);
                                setOtpSent(false);
                              } catch (err: any) {
                                setOtpError(
                                  err.data?.message || "Invalid code"
                                );
                              } finally {
                                setIsVerifying(false);
                              }
                            }}
                            className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-all"
                          >
                            Verify
                          </button>
                          <button
                            type="button"
                            onClick={() => setOtpSent(false)}
                            className="text-[10px] text-gray-500 hover:text-gray-700"
                          >
                            Edit Email
                          </button>
                        </div>
                      )}
                      {otpError && (
                        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {otpError}
                        </p>
                      )}
                    </div>
                  )}
                  {isEmailVerified && (
                    <p className="text-[10px] text-green-600 mt-1 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Email Verified
                    </p>
                  )}
                </div>
                {!showGuestInput ? (
                  <button
                    type="button"
                    onClick={() => setShowGuestInput(true)}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium border border-blue-600 rounded-full px-4 py-1.5 hover:bg-blue-50 transition-colors"
                  >
                    Add Guests
                  </button>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guest Email(s)
                    </label>
                    <div className="w-full px-3 py-2 rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 flex flex-wrap gap-2 min-h-[46px]">
                      {guestEmails.map((email) => (
                        <span
                          key={email}
                          className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-gray-100 text-gray-800"
                        >
                          {email}
                          <button
                            type="button"
                            onClick={() => removeGuest(email)}
                            className="ml-1.5 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        className="flex-1 text-gray-900 placeholder-gray-500 outline-none min-w-[120px] bg-transparent text-sm text-gray-900 placeholder-gray-500"
                        placeholder="Add guest email..."
                        value={currentGuestInput}
                        onChange={(e) => setCurrentGuestInput(e.target.value)}
                        onKeyDown={handleAddGuest}
                        onBlur={() => {
                          // Optional: add on blur if valid
                          const email = currentGuestInput.trim();
                          if (
                            email &&
                            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
                            !guestEmails.includes(email) &&
                            guestEmails.length < 10
                          ) {
                            setGuestEmails([...guestEmails, email]);
                            setCurrentGuestInput("");
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Notify up to 10 additional guests of the scheduled event.
                    </p>
                  </div>
                )}
                {(event.phoneVerify || event.enablePhoneCheck) && (
                  <div>
                    <label
                      htmlFor="mobile"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {event.enablePhoneCheck || event.phoneVerify
                        ? "Mobile No *"
                        : "Mobile No"}
                    </label>
                    <input
                      id="mobile"
                      type="tel"
                      required={event.enablePhoneCheck || event.phoneVerify}
                      className="w-full text-gray-900 placeholder-gray-500 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value })
                      }
                    />
                  </div>
                )}

                {event.showNotes !== false && (
                  <div>
                    <label
                      htmlFor="notes"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Additional Notes *
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      required
                      className="w-full text-gray-900 placeholder-gray-500 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-none"
                      placeholder="Tell us more about your visit..."
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                    />
                  </div>
                )}
                {event.showAdditionalLinks !== false &&
                  event.repeaterFields &&
                  event.repeaterFields.length > 0 && (
                    <div>
                      <label
                        htmlFor="selectedLink"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Product you are Interested in *
                      </label>
                      <select
                        id="selectedLink"
                        required
                        className="w-full text-gray-900 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                        value={formData.selectedLink}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            selectedLink: e.target.value,
                          })
                        }
                      >
                        <option value="">Select an option</option>
                        {event.repeaterFields.map((link: any, idx: number) => (
                          <option key={idx} value={link.name}>
                            {link.name}
                          </option>
                        ))}
                      </select>
                      {formData.selectedLink && (
                        <div className="mt-2">
                          {(() => {
                            const selected = event.repeaterFields.find(
                              (l: any) => l.name === formData.selectedLink
                            );
                            return selected?.url ? (
                              <a
                                href={selected.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View {selected.name} resource
                              </a>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                <div className="flex items-start gap-3 mt-4">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="w-4 h-4 text-blue-600 border-gray-100 bg-amber-600 rounded focus:ring-blue-500 cursor-pointer"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                    />
                  </div>
                  <div className="text-xs text-gray-500 leading-normal">
                    <label htmlFor="terms" className="cursor-pointer">
                      By proceeding, you confirm that you have read and agree to
                      our{" "}
                      <a
                        target="_blank"
                        href="https://www.heritagelanefurniture.com.au/pages/terms-and-conditions"
                        className="text-blue-600 hover:underline"
                      >
                        Terms of Use and Privacy Notice.
                      </a>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    !agreedToTerms || (event.emailVerify && !isEmailVerified)
                  }
                  className={clsx(
                    "w-full font-bold py-3 px-4 rounded-full mt-4 transition-all active:scale-[0.98]",
                    agreedToTerms && (!event.emailVerify || isEmailVerified)
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  )}
                >
                  {event.emailVerify && !isEmailVerified
                    ? "Verify Email to Continue"
                    : "Schedule Event"}
                </button>
              </form>
            </div>
          )}
          {step !== "form" && (
            <div className="relative">
              <h3 className="text-violet-900 text-sm font-semibold">
                Timezone
              </h3>
              <button
                onClick={() =>
                  setIsTimezoneSelectorOpen(!isTimezoneSelectorOpen)
                }
                className="flex items-center gap-3 text-gray-900 justify-start hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <Globe className="w-5 h-5 text-gray-400" />
                <span className="text-xs font-semibold">
                  {selectedTimezoneLabel} (
                  {formatTimeInTimezone(new Date(), selectedTimezone)})
                </span>
                <ChevronRight
                  className={clsx(
                    "w-4 h-4 text-gray-400 transition-transform",
                    isTimezoneSelectorOpen && "rotate-90"
                  )}
                />
              </button>

              <AnimatePresence>
                {isTimezoneSelectorOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 flex flex-col"
                  >
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          className="w-full pl-9 pr-4 py-2 text-black rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                          placeholder="Search timezone..."
                          value={searchTz}
                          onChange={(e) => setSearchTz(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
                      {getTimezones()
                        .filter(
                          (tz) =>
                            tz.label
                              .toLowerCase()
                              .includes(searchTz.toLowerCase()) ||
                            tz.value
                              .toLowerCase()
                              .includes(searchTz.toLowerCase())
                        )
                        .map((tz) => (
                          <button
                            key={tz.value}
                            onClick={() => {
                              setSelectedTimezone(tz.value);
                              setIsTimezoneSelectorOpen(false);
                              setSelectedTimezoneLabel(tz.label);
                            }}
                            className={clsx(
                              "w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex flex-col gap-0.5",
                              selectedTimezone === tz.value
                                ? "bg-blue-50 text-blue-700 font-bold"
                                : "text-gray-600 hover:bg-gray-50"
                            )}
                          >
                            <span className="flex items-center justify-between">
                              <span>{tz.label}</span>
                              <span className="text-[10px] opacity-70 font-normal">
                                {tz.offset}
                              </span>
                            </span>
                            <span className="text-[11px] opacity-60 font-medium">
                              {tz.currentTime}
                            </span>
                          </button>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
