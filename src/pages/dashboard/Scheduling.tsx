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
} from "lucide-react";
import { Link } from "react-router-dom";
import Modal from "../../components/Modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

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
  console.log(events);

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
    availability: "",
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
      availability: "",
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
  };

  const openEditModal = (event: any) => {
    setEditingEventId(event.id);
    setActiveTab("event-type");
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
      availability: event.availability || "",
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
        data.append("availability", formData.availability);
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
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create
        </button>
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
                      onClick={() => setOpenDropdownId(openDropdownId === event.id ? null : event.id)}
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
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">{event.duration} mins</span>
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
                        <span className="truncate">
                          {event.locationAddress || "In-Person"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Google Meet</span>
                      </>
                    )}
                  </div>

                  {event.availability && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{event.availability}</span>
                    </div>
                  )}

                  <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed pt-2 border-t border-gray-50">
                    {event.description || "No description provided."}
                  </p>
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingEventId
            ? "Edit Event Type"
            : activeTab === "event-type"
              ? "Create New Event Type"
              : "Quick Meeting"
        }
      >
        {!editingEventId && (
          <div className="flex border-b border-gray-200 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab("event-type")}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "event-type"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              Event Type
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quick-booking")}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "quick-booking"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              Quick Booking
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "event-type" ? (
            <>
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Event Title *
                </label>
                <input
                  id="title"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                  placeholder="e.g. 15 Minute Discussion"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Duration (minutes)
                </label>
                <select
                  id="duration"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value),
                    })
                  }
                >
                  {[15, 30, 45, 60, 90, 120].map((m) => (
                    <option key={m} value={m}>
                      {m} min
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-900"
                  placeholder="Briefly describe what this event is about..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: e.target.value as "gmeet" | "in-person",
                    })
                  }
                >
                  <option value="gmeet">Google Meet</option>
                  <option value="in-person">In-Person Meeting</option>
                </select>
              </div>

              {formData.location === "in-person" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Values Location (Address)
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                      placeholder="e.g. 123 Main St, New York, NY"
                      value={formData.locationAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          locationAddress: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location Map URL
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                      placeholder="https://maps.google.com/..."
                      value={formData.locationUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          locationUrl: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Host
                </label>
                <input
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                  placeholder="Host Name"
                  value={formData.host}
                  onChange={(e) =>
                    setFormData({ ...formData, host: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <input
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                  placeholder="e.g. Mon-Fri, 9am-5pm"
                  value={formData.availability}
                  onChange={(e) =>
                    setFormData({ ...formData, availability: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({
                          ...formData,
                          eventImage: reader.result as string,
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {formData.eventImage && (
                  <img
                    src={formData.eventImage}
                    alt="Preview"
                    className="mt-2 h-20 w-20 object-cover rounded-md"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, color: c.value })
                      }
                      className={`w-8 h-8 rounded-full ${c.value
                        } transition-transform ${formData.color === c.value
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                          : "hover:scale-105"
                        }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            // Quick Booking Form
            <>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Title
                  </label>
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                    placeholder="Quick Chat"
                    value={quickBookingData.title || ""}
                    onChange={(e) =>
                      setQuickBookingData({
                        ...quickBookingData,
                        title: e.target.value,
                        eventId: "",
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to use an existing event type below (optional)
                  </p>
                </div>
                <div className="w-full md:w-1/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                    value={quickBookingData.duration || 30}
                    onChange={(e) =>
                      setQuickBookingData({
                        ...quickBookingData,
                        duration: parseInt(e.target.value),
                        eventId: "",
                      })
                    }
                  />
                </div>
              </div>

              <div className="relative">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white text-sm text-gray-500">
                    OR Select Event Type
                  </span>
                </div>
              </div>

              <div>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900"
                  value={quickBookingData.eventId}
                  onChange={(e) =>
                    setQuickBookingData({
                      ...quickBookingData,
                      eventId: e.target.value,
                      title: "", // Clear title when picking event
                      duration: 30, // Reset duration when picking event
                    })
                  }
                >
                  <option value="">Select an event type (Optional)</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} ({event.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest Name *
                  </label>
                  <input
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                    placeholder="Jane Doe"
                    value={quickBookingData.guestName}
                    onChange={(e) =>
                      setQuickBookingData({
                        ...quickBookingData,
                        guestName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest Email *
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                    placeholder="jane@example.com"
                    value={quickBookingData.guestEmail}
                    onChange={(e) =>
                      setQuickBookingData({
                        ...quickBookingData,
                        guestEmail: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <DatePicker
                    selected={
                      quickBookingData.date
                        ? new Date(quickBookingData.date)
                        : null
                    }
                    onChange={(date: any) =>
                      setQuickBookingData({
                        ...quickBookingData,
                        date: date ? format(date, "yyyy-MM-dd") : "",
                      })
                    }
                    dateFormat="MMM d, yyyy"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                    placeholderText="Select Date"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <DatePicker
                    selected={
                      quickBookingData.time
                        ? new Date(
                          `${quickBookingData.date ||
                          format(new Date(), "yyyy-MM-dd")
                          }T${quickBookingData.time}`
                        )
                        : null
                    }
                    onChange={(date: any) =>
                      setQuickBookingData({
                        ...quickBookingData,
                        time: date ? format(date, "HH:mm") : "",
                      })
                    }
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                    placeholderText="Select Time"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-900"
                  placeholder="Any additional notes..."
                  value={quickBookingData.notes}
                  onChange={(e) =>
                    setQuickBookingData({
                      ...quickBookingData,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : activeTab === "quick-booking"
                  ? "Schedule Meeting"
                  : editingEventId
                    ? "Save Changes"
                    : "Create Event Type"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Event Type"
      >
        <div className="p-1">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <span className="font-bold text-gray-900">"{eventToDelete?.title}"</span>?
            This action cannot be undone and will remove all settings for this event type.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? "Deleting..." : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Event
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
