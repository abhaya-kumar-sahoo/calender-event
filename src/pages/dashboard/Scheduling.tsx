import { useState } from "react";
import { useStore } from "../../store/StoreContext";
import {
  Clock,
  Copy,
  Plus,
  ExternalLink,
  Settings,
  MapPin,
  User,
  Calendar,
  Video,
  Trash2,
  Edit2,
  Mail,
  Phone,
  Users,
  ChevronDown,
  Hash,
} from "lucide-react";
import { Link } from "react-router-dom";
import SchedulingModal from "./modals/SchedulingModal";
import DeleteEventModal from "./modals/DeleteEventModal";

export default function Scheduling() {
  const { events, addEvent, updateEvent, addBooking, deleteEvent } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"event-type" | "quick-booking">(
    "event-type"
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);

  // console.log({ events });

  const [formData, setFormData] = useState({
    title: "",
    duration: 30,
    description: "",
    color: "bg-purple-600",
    location: "gmeet" as "gmeet" | "in-person",
    locationAddress: "",
    locationUrl: "",
    host: "",
    eventImage: "", // URL from backend
    availabilities: {
      note: "",
      weeklyHours: [
        {
          day: "monday" as const,
          isAvailable: true,
          timeRanges: [{ start: "09:00", end: "17:00" }],
        },
        {
          day: "tuesday" as const,
          isAvailable: true,
          timeRanges: [{ start: "09:00", end: "17:00" }],
        },
        {
          day: "wednesday" as const,
          isAvailable: true,
          timeRanges: [{ start: "09:00", end: "17:00" }],
        },
        {
          day: "thursday" as const,
          isAvailable: true,
          timeRanges: [{ start: "09:00", end: "17:00" }],
        },
        {
          day: "friday" as const,
          isAvailable: true,
          timeRanges: [{ start: "09:00", end: "17:00" }],
        },
        { day: "saturday" as const, isAvailable: false, timeRanges: [] },
        { day: "sunday" as const, isAvailable: false, timeRanges: [] },
      ],
      dateOverrides: [],
      timezone: "Asia/Kolkata",
    },
    groupMeeting: {
      enabled: false,
      maxGuests: 10,
      showRemainingSpots: true,
    },
    repeaterFields: [] as { name: string; url: string }[],
    emailVerify: false,
    phoneVerify: false,
    enablePhoneCheck: false,
    showNotes: true,
    showAdditionalLinks: true,
  });

  const [quickBookingData, setQuickBookingData] = useState({
    eventId: "",
    guestName: "",
    guestEmail: "",
    date: "",
    time: "",
    notes: "",
    title: "",
    duration: 30,
  });

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/book/${id}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const openCreateModal = () => {
    setEditingEventId(null);
    setActiveTab("event-type");
    setFormData({
      title: "",
      duration: 30,
      description: "",
      color: "bg-purple-600",
      location: "gmeet" as const,
      locationAddress: "",
      locationUrl: "",
      host: "",
      eventImage: "",
      availabilities: {
        note: "",
        weeklyHours: [
          {
            day: "monday",
            isAvailable: true,
            timeRanges: [{ start: "09:00", end: "17:00" }],
          },
          {
            day: "tuesday",
            isAvailable: true,
            timeRanges: [{ start: "09:00", end: "17:00" }],
          },
          {
            day: "wednesday",
            isAvailable: true,
            timeRanges: [{ start: "09:00", end: "17:00" }],
          },
          {
            day: "thursday",
            isAvailable: true,
            timeRanges: [{ start: "09:00", end: "17:00" }],
          },
          {
            day: "friday",
            isAvailable: true,
            timeRanges: [{ start: "09:00", end: "17:00" }],
          },
          { day: "saturday", isAvailable: false, timeRanges: [] },
          { day: "sunday", isAvailable: false, timeRanges: [] },
        ],
        dateOverrides: [],
        timezone: "Asia/Kolkata",
      },
      groupMeeting: {
        enabled: false,
        maxGuests: 10,
        showRemainingSpots: true,
      },
      repeaterFields: [],
      emailVerify: false,
      phoneVerify: false,
      enablePhoneCheck: false,
      showNotes: true,
      showAdditionalLinks: true,
    });
    setImageFile(null);
    setQuickBookingData({
      eventId: events.length > 0 ? events[0].id : "",
      guestName: "",
      guestEmail: "",
      date: "",
      time: "",
      notes: "",
      title: "",
      duration: 30,
    });
    setIsModalOpen(true);
    setIsCreateDropdownOpen(false);
  };

  const openEditModal = (event: any) => {
    setEditingEventId(event.id);
    setActiveTab("event-type");
    console.log(event.availabilities);

    setFormData({
      title: event.title,
      duration: event.duration,
      description: event.description,
      color: event.color,
      location: event.location || "gmeet",
      locationAddress: event.locationAddress || "",
      locationUrl: event.locationUrl || "",
      host: event.host || "",
      eventImage: event.eventImage || "",
      availabilities: event.availabilities || {
        note: "",
        weeklyHours: [
          {
            day: "monday",
            isAvailable: true,
            timeRanges: [{ start: "09:00", end: "17:00" }],
          },
          {
            day: "tuesday",
            isAvailable: true,
            timeRanges: [{ start: "09:00", end: "17:00" }],
          },
          {
            day: "wednesday",
            isAvailable: true,
            timeRanges: [{ start: "09:00", end: "17:00" }],
          },
          {
            day: "thursday",
            isAvailable: true,
            timeRanges: [{ start: "09:00", end: "17:00" }],
          },
          {
            day: "friday",
            isAvailable: true,
            timeRanges: [{ start: "09:00", end: "17:00" }],
          },
          { day: "saturday", isAvailable: false, timeRanges: [] },
          { day: "sunday", isAvailable: false, timeRanges: [] },
        ],
        dateOverrides: [],
        timezone: "Asia/Kolkata",
      },
      repeaterFields: event.repeaterFields || [],
      emailVerify: !!event.emailVerify,
      phoneVerify: !!event.phoneVerify,
      enablePhoneCheck: !!event.enablePhoneCheck,
      showNotes: event.showNotes !== false,
      showAdditionalLinks: event.showAdditionalLinks !== false,
      groupMeeting: event.groupMeeting || {
        enabled: false,
        maxGuests: 10,
        showRemainingSpots: true,
      },
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (event: any) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteEvent(eventToDelete.id);
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeTab === "event-type") {
        if (!formData.title) return;

        const data = new FormData();
        data.append("title", formData.title);
        data.append("duration", formData.duration.toString());
        data.append("description", formData.description);
        data.append("color", formData.color);
        data.append("location", formData.location);
        data.append("locationAddress", formData.locationAddress);
        data.append("locationUrl", formData.locationUrl);
        data.append("host", formData.host);
        data.append("availabilities", JSON.stringify(formData.availabilities));
        data.append("groupMeeting", JSON.stringify(formData.groupMeeting));
        data.append("repeaterFields", JSON.stringify(formData.repeaterFields));
        data.append("emailVerify", formData.emailVerify.toString());
        data.append("phoneVerify", formData.phoneVerify.toString());
        data.append("enablePhoneCheck", formData.enablePhoneCheck.toString());
        data.append("showNotes", formData.showNotes.toString());
        data.append(
          "showAdditionalLinks",
          formData.showAdditionalLinks.toString()
        );
        data.append("slug", formData.title.toLowerCase().replace(/\s+/g, "-"));

        if (imageFile) {
          data.append("eventImage", imageFile);
        }

        if (editingEventId) {
          await updateEvent(editingEventId, data as any);
        } else {
          await addEvent(data as any);
        }
      } else {
        // Quick Booking
        if (
          !quickBookingData.guestEmail ||
          !quickBookingData.date ||
          !quickBookingData.time
        ) {
          alert("Please fill in all required fields");
          setIsSubmitting(false);
          return;
        }

        // If eventId is selected, use it, otherwise use custom title/duration
        const bookingPayload: any = {
          guestName: quickBookingData.guestName,
          guestEmail: quickBookingData.guestEmail,
          startTime: new Date(
            `${quickBookingData.date}T${quickBookingData.time}`
          ).toISOString(),
          notes: quickBookingData.notes,
          additionalGuests: [],
        };

        if (quickBookingData.eventId) {
          bookingPayload.eventId = quickBookingData.eventId;
        } else {
          bookingPayload.title = quickBookingData.title || "Quick Meeting";
          bookingPayload.duration = quickBookingData.duration || 30;
        }

        await addBooking(bookingPayload);
        alert("Meeting scheduled successfully!");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const colors = [
    { label: "Purple", value: "bg-purple-600" },
    { label: "Blue", value: "bg-blue-600" },
    { label: "Pink", value: "bg-pink-600" },
    { label: "Green", value: "bg-green-600" },
    { label: "Orange", value: "bg-orange-600" },
    { label: "Red", value: "bg-red-600" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scheduling</h1>
          <p className="text-gray-500">
            Create events to share for people to book.
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2 font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isCreateDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {isCreateDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsCreateDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={openCreateModal}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      One-to-One
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Traditional meeting-style event
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setIsCreateDropdownOpen(false)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 group/group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-400">
                      Group
                    </div>
                    <div className="text-[10px] text-gray-400">Coming soon</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          return (
            <div
              key={event.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all relative group flex flex-col h-full"
            >
              {/* Event Progress Color Stripe */}
              <div className={`h-1.5 w-full ${event.color}`}></div>

              {/* Event Image (Optional) */}
              {event.eventImage && (
                <div className="h-40 w-full overflow-hidden border-b border-gray-100">
                  <img
                    src={event.eventImage}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                  />
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-snug">
                    {event.title}
                  </h3>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenDropdownId(
                          openDropdownId === event.id ? null : event.id
                        )
                      }
                      className="p-2 rounded-full transition-all text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      title="Settings"
                    >
                      <Settings className="w-4.5 h-4.5" />
                    </button>

                    {openDropdownId === event.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenDropdownId(null)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1 overflow-hidden">
                          <button
                            onClick={() => {
                              openEditModal(event);
                              setOpenDropdownId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(event)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
                    <div className="flex items-center">
                      <Hash className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {event.slug}
                      </span>
                    </div>
                    {event.createdAt && (
                      <div
                        className="flex items-center"
                        title={`Created on ${new Date(
                          event.createdAt
                        ).toLocaleString()}`}
                      >
                        <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        <span className="text-[10px]">
                          {new Date(event.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium text-gray-700">
                      {event.duration} mins
                    </span>
                  </div>

                  {event.host && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{event.host}</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-500 text-sm">
                    {event.location === "in-person" ? (
                      <>
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <div className="truncate flex-1">
                          <span className="truncate block">
                            {event.locationAddress || "In-Person Showroom"}
                          </span>
                          {event.locationUrl && (
                            <a
                              href={event.locationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              View Map
                            </a>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Google Meet</span>
                      </>
                    )}
                  </div>

                  {event.availabilities && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">
                        {event.availabilities.note || "Custom hours set"}
                      </span>
                    </div>
                  )}

                  <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed pt-2 border-t border-gray-50">
                    {event.description || "No description provided."}
                  </p>

                  {/* Verification & Settings Badges */}
                  {(event.emailVerify ||
                    event.phoneVerify ||
                    event.enablePhoneCheck ||
                    event.showNotes) && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {event.emailVerify && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                            <Mail className="w-3 h-3" />
                            Email Verify
                          </div>
                        )}
                        {(event.phoneVerify || event.enablePhoneCheck) && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-green-100">
                            <Phone className="w-3 h-3" />
                            {event.enablePhoneCheck
                              ? "Phone Verify"
                              : "Phone Required"}
                          </div>
                        )}
                        {event.showNotes && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-purple-100">
                            <Plus className="w-3 h-3" />
                            Notes
                          </div>
                        )}
                      </div>
                    )}
                  {event.repeaterFields && event.repeaterFields.length > 0 && (
                    <div className="pt-3 space-y-2 border-t border-gray-50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Additional Links
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {event.repeaterFields.map((link: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs transition-colors border border-gray-100 group/link"
                          >
                            <ExternalLink className="w-3 h-3 text-gray-400 group-hover/link:text-blue-500" />
                            <span className="truncate max-w-[100px]">
                              {link.name || "Link"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleCopyLink(event.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </button>
                  <Link
                    to={`/book/${event.id}`}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100"
                    title="View Booking Page"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <SchedulingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingEventId={editingEventId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        formData={formData}
        setFormData={setFormData}
        quickBookingData={quickBookingData}
        setQuickBookingData={setQuickBookingData}
        imageFile={imageFile}
        setImageFile={setImageFile}
        isSubmitting={isSubmitting}
        handleSubmit={handleSubmit}
        events={events}
        colors={colors}
      />

      <DeleteEventModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        eventToDelete={eventToDelete}
        isSubmitting={isSubmitting}
        onDelete={handleDelete}
      />
    </div>
  );
}
