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
