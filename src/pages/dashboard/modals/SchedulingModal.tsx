import React from "react";
import Modal from "../../../components/Modal";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import {
    Calendar,
    Clock,
    Video,
    User,
    MapPin,
    ExternalLink,
    Plus,
} from "lucide-react";

interface SchedulingModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingEventId: string | null;
    activeTab: "event-type" | "quick-booking";
    setActiveTab: (tab: "event-type" | "quick-booking") => void;
    formData: {
        title: string;
        duration: number;
        description: string;
        color: string;
        location: "gmeet" | "in-person";
        locationAddress: string;
        locationUrl: string;
        host: string;
        eventImage: string;
        availability: string;
    };
    setFormData: (data: any) => void;
    quickBookingData: {
        eventId: string;
        guestName: string;
        guestEmail: string;
        date: string;
        time: string;
        notes: string;
        title: string;
        duration: number;
    };
    setQuickBookingData: (data: any) => void;
    imageFile: File | null;
    setImageFile: (file: File | null) => void;
    isSubmitting: boolean;
    handleSubmit: (e: React.FormEvent) => void;
    events: any[];
    colors: { label: string; value: string }[];
}

const SchedulingModal: React.FC<SchedulingModalProps> = ({
    isOpen,
    onClose,
    editingEventId,
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    quickBookingData,
    setQuickBookingData,
    imageFile,
    setImageFile,
    isSubmitting,
    handleSubmit,
    events,
    colors,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                editingEventId
                    ? "Edit Event Type"
                    : activeTab === "event-type"
                        ? "Create New Event Type"
                        : "Quick Meeting"
            }
        >
            {!editingEventId && (
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab("event-type")}
                        className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === "event-type"
                            ? "border-blue-600 text-blue-600 bg-blue-50/50"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        Event Type
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("quick-booking")}
                        className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === "quick-booking"
                            ? "border-blue-600 text-blue-600 bg-blue-50/50"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        Quick Booking
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {activeTab === "event-type" ? (
                    <>
                        {/* Row 1: Title & Duration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    Event Title *
                                </label>
                                <input
                                    id="title"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all bg-gray-50/50 hover:bg-white placeholder:text-xs"
                                    placeholder="e.g. 15 Minute Discussion"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="duration" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    Duration (minutes)
                                </label>
                                <select
                                    id="duration"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50/50 hover:bg-white text-gray-900 transition-all"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                >
                                    {[15, 30, 45, 60, 90, 120].map((m) => (
                                        <option key={m} value={m}>
                                            {m} minutes
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Row 2: Location & Host */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                    <Video className="w-4 h-4 text-blue-500" />
                                    Location Type
                                </label>
                                <select
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50/50 hover:bg-white text-gray-900 transition-all"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value as "gmeet" | "in-person" })}
                                >
                                    <option value="gmeet">Google Meet</option>
                                    <option value="in-person">In-Person Meeting</option>
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                    <User className="w-4 h-4 text-blue-500" />
                                    Host Name
                                </label>
                                <input
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all bg-gray-50/50 hover:bg-white placeholder:text-xs"
                                    placeholder="Host Name"
                                    value={formData.host}
                                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* In-Person Details */}
                        {formData.location === "in-person" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        Location Address
                                    </label>
                                    <input
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all bg-gray-50/50 hover:bg-white placeholder:text-xs"
                                        placeholder="e.g. 123 Main St, New York"
                                        value={formData.locationAddress}
                                        onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                        <ExternalLink className="w-4 h-4 text-blue-500" />
                                        Maps / URL
                                    </label>
                                    <input
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all bg-gray-50/50 hover:bg-white placeholder:text-xs"
                                        placeholder="https://maps.google.com/..."
                                        value={formData.locationUrl}
                                        onChange={(e) => setFormData({ ...formData, locationUrl: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Availability & Image */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    Availability Note
                                </label>
                                <input
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all bg-gray-50/50 hover:bg-white placeholder:text-xs"
                                    placeholder="e.g. Mon-Fri, 9am-5pm"
                                    value={formData.availability}
                                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                    <Plus className="w-4 h-4 text-blue-500" />
                                    Event Image (Optional)
                                </label>
                                <label className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all">
                                    <span className="text-xs text-gray-500 truncate max-w-[120px]">
                                        {imageFile ? imageFile.name : "Select image"}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {formData.eventImage && (
                                            <img src={formData.eventImage} alt="Preview" className="h-6 w-6 object-cover rounded shadow-sm" />
                                        )}
                                        <span className="text-xs font-bold text-blue-600">Browse</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setImageFile(file);
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData({ ...formData, eventImage: reader.result as string });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Description & Color */}
                        <div>
                            <label htmlFor="description" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                <Plus className="w-4 h-4 text-blue-500" />
                                About this Event
                            </label>
                            <textarea
                                id="description"
                                rows={2}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-900 transition-all bg-gray-50/50 hover:bg-white placeholder:text-xs"
                                placeholder="Briefly describe what this event is about..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Plus className="w-4 h-4 text-blue-500" />
                                Pick Brand Color
                            </label>
                            <div className="flex gap-2.5 flex-wrap">
                                {colors.map((c) => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: c.value })}
                                        className={`w-9 h-9 rounded-full ${c.value} transition-all duration-300 shadow-sm ${formData.color === c.value
                                            ? "ring-2 ring-offset-2 ring-blue-500 scale-110 shadow-md"
                                            : "hover:scale-105 hover:shadow-md"
                                            }`}
                                        title={c.label}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Quick Booking Form */}
                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                        Meeting Title
                                    </label>
                                    <input
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all bg-white placeholder:text-xs"
                                        placeholder="e.g. Quick Chat"
                                        value={quickBookingData.title || ""}
                                        onChange={(e) => setQuickBookingData({ ...quickBookingData, title: e.target.value, eventId: "" })}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
                                        OR LEAVE BLANK TO SELECT AN EVENT TYPE BELOW
                                    </p>
                                </div>
                                <div className="w-full md:w-1/3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                        Duration (min)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all bg-white"
                                        value={quickBookingData.duration || 30}
                                        onChange={(e) => setQuickBookingData({ ...quickBookingData, duration: parseInt(e.target.value), eventId: "" })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 py-1">
                                <div className="flex-1 h-px bg-blue-100"></div>
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest whitespace-nowrap">
                                    Linking to Event Type
                                </span>
                                <div className="flex-1 h-px bg-blue-100"></div>
                            </div>

                            <select
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900 transition-all"
                                value={quickBookingData.eventId}
                                onChange={(e) => setQuickBookingData({
                                    ...quickBookingData,
                                    eventId: e.target.value,
                                    title: "",
                                    duration: 30,
                                })}
                            >
                                <option value="">Select an event type (Optional)</option>
                                {events.map((event) => (
                                    <option key={event.id} value={event.id}>
                                        {event.title} ({event.duration} min)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                        <User className="w-4 h-4 text-blue-500" />
                                        Guest Name *
                                    </label>
                                    <input
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all bg-white placeholder:text-xs"
                                        placeholder="e.g. Jane Doe"
                                        value={quickBookingData.guestName}
                                        onChange={(e) => setQuickBookingData({ ...quickBookingData, guestName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                        <ExternalLink className="w-4 h-4 text-blue-500" />
                                        Guest Email *
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all bg-white placeholder:text-xs"
                                        placeholder="e.g. jane@example.com"
                                        value={quickBookingData.guestEmail}
                                        onChange={(e) => setQuickBookingData({ ...quickBookingData, guestEmail: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                        Meeting Date *
                                    </label>
                                    <DatePicker
                                        selected={quickBookingData.date ? new Date(quickBookingData.date) : null}
                                        onChange={(date: any) => setQuickBookingData({
                                            ...quickBookingData,
                                            date: date ? format(date, "yyyy-MM-dd") : "",
                                        })}
                                        dateFormat="MMM d, yyyy"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white placeholder:text-xs"
                                        placeholderText="Pick Date"
                                        required
                                        portalId="root"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                        Start Time *
                                    </label>
                                    <DatePicker
                                        selected={
                                            quickBookingData.time
                                                ? new Date(`${quickBookingData.date || format(new Date(), "yyyy-MM-dd")}T${quickBookingData.time}`)
                                                : null
                                        }
                                        onChange={(date: any) => setQuickBookingData({
                                            ...quickBookingData,
                                            time: date ? format(date, "HH:mm") : "",
                                        })}
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={15}
                                        timeCaption="Time"
                                        dateFormat="h:mm aa"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white placeholder:text-xs"
                                        placeholderText="Pick Time"
                                        required
                                        portalId="root"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                    <Plus className="w-4 h-4 text-blue-500" />
                                    Internal Notes
                                </label>
                                <textarea
                                    rows={1}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-900 transition-all bg-white placeholder:text-xs"
                                    placeholder="Anything the host should know..."
                                    value={quickBookingData.notes}
                                    onChange={(e) => setQuickBookingData({ ...quickBookingData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                {editingEventId ? "Save Changes" : "Confirm & Create"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default SchedulingModal;
