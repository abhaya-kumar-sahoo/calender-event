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
    Trash2,
    Mail,
    Users,
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
        availabilities: {
            note: string;
            weeklyHours: Array<{
                day:
                | "sunday"
                | "monday"
                | "tuesday"
                | "wednesday"
                | "thursday"
                | "friday"
                | "saturday";
                isAvailable: boolean;
                timeRanges: Array<{ start: string; end: string }>;
            }>;
            dateOverrides: Array<{
                date: string;
                isAvailable: boolean;
                timeRanges: Array<{ start: string; end: string }>;
            }>;
            timezone: string;
        };
        repeaterFields: { name: string; url: string }[];
        emailVerify: boolean;
        phoneVerify: boolean;
        enablePhoneCheck: boolean;
        showNotes: boolean;
        showAdditionalLinks: boolean;
        groupMeeting: {
            enabled: boolean;
            maxGuests: number;
            showRemainingSpots: boolean;
        };
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
            maxWidth="max-w-5xl"
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

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {activeTab === "event-type" ? (
                        <>
                            {/* Left Column: Basic Details */}
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="title"
                                            className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5"
                                        >
                                            <Calendar className="w-4 h-4 text-blue-500" />
                                            Event Title *
                                        </label>
                                        <input
                                            id="title"
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all bg-gray-50/50 hover:bg-white placeholder:text-xs"
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
                                            className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5"
                                        >
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            Duration (minutes)
                                        </label>
                                        <select
                                            id="duration"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50/50 hover:bg-white text-gray-900 transition-all"
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
                                                    {m} minutes
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                            <Video className="w-4 h-4 text-blue-500" />
                                            Location Type
                                        </label>
                                        <select
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50/50 hover:bg-white text-gray-900 transition-all"
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

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                            <User className="w-4 h-4 text-blue-500" />
                                            Host Name
                                        </label>
                                        <input
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all bg-gray-50/50 hover:bg-white placeholder:text-xs"
                                            placeholder="Host Name"
                                            value={formData.host}
                                            onChange={(e) =>
                                                setFormData({ ...formData, host: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

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
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        locationAddress: e.target.value,
                                                    })
                                                }
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
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        locationUrl: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Weekly Availability Configuration */}
                                <div className="col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                        Weekly Availability
                                    </label>
                                    <div className="bg-gray-50/50 rounded-xl border border-gray-200 p-4 space-y-2">
                                        <p className="text-xs text-gray-500 mb-3">
                                            Set your available hours for each day
                                        </p>
                                        {formData.availabilities.weeklyHours.map(
                                            (dayConfig, index) => (
                                                <div
                                                    key={dayConfig.day}
                                                    className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
                                                >
                                                    <div className="w-20">
                                                        <span className="text-sm font-medium text-gray-700 capitalize">
                                                            {dayConfig.day.slice(0, 3)}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 flex items-center gap-2 text-sm text-black">
                                                        <select
                                                            value={dayConfig.timeRanges[0]?.start || "09:00"}
                                                            onChange={(e) => {
                                                                const newWeeklyHours =
                                                                    formData.availabilities.weeklyHours.map(
                                                                        (day, i) => {
                                                                            if (i === index) {
                                                                                return {
                                                                                    ...day,
                                                                                    timeRanges:
                                                                                        day.timeRanges.length > 0
                                                                                            ? [
                                                                                                {
                                                                                                    ...day.timeRanges[0],
                                                                                                    start: e.target.value,
                                                                                                },
                                                                                            ]
                                                                                            : [
                                                                                                {
                                                                                                    start: e.target.value,
                                                                                                    end: "17:00",
                                                                                                },
                                                                                            ],
                                                                                };
                                                                            }
                                                                            return day;
                                                                        }
                                                                    );
                                                                setFormData({
                                                                    ...formData,
                                                                    availabilities: {
                                                                        ...formData.availabilities,
                                                                        weeklyHours: newWeeklyHours,
                                                                    },
                                                                });
                                                            }}
                                                            disabled={!dayConfig.isAvailable}
                                                            className="px-2 py-1 text-xs rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                                                        >
                                                            {Array.from({ length: 24 }, (_, i) => (
                                                                <option
                                                                    key={i}
                                                                    value={`${i.toString().padStart(2, "0")}:00`}
                                                                >
                                                                    {i === 0
                                                                        ? "12:00 AM"
                                                                        : i < 12
                                                                            ? `${i}:00 AM`
                                                                            : i === 12
                                                                                ? "12:00 PM"
                                                                                : `${i - 12}:00 PM`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <span className="text-gray-400 text-xs">to</span>
                                                        <select
                                                            value={dayConfig.timeRanges[0]?.end || "17:00"}
                                                            onChange={(e) => {
                                                                const newWeeklyHours =
                                                                    formData.availabilities.weeklyHours.map(
                                                                        (day, i) => {
                                                                            if (i === index) {
                                                                                return {
                                                                                    ...day,
                                                                                    timeRanges:
                                                                                        day.timeRanges.length > 0
                                                                                            ? [
                                                                                                {
                                                                                                    ...day.timeRanges[0],
                                                                                                    end: e.target.value,
                                                                                                },
                                                                                            ]
                                                                                            : [
                                                                                                {
                                                                                                    start: "09:00",
                                                                                                    end: e.target.value,
                                                                                                },
                                                                                            ],
                                                                                };
                                                                            }
                                                                            return day;
                                                                        }
                                                                    );
                                                                setFormData({
                                                                    ...formData,
                                                                    availabilities: {
                                                                        ...formData.availabilities,
                                                                        weeklyHours: newWeeklyHours,
                                                                    },
                                                                });
                                                            }}
                                                            disabled={!dayConfig.isAvailable}
                                                            className="px-2 py-1 text-xs rounded border border-gray-300 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                                                        >
                                                            {Array.from({ length: 24 }, (_, i) => (
                                                                <option
                                                                    key={i}
                                                                    value={`${i.toString().padStart(2, "0")}:00`}
                                                                >
                                                                    {i === 0
                                                                        ? "12:00 AM"
                                                                        : i < 12
                                                                            ? `${i}:00 AM`
                                                                            : i === 12
                                                                                ? "12:00 PM"
                                                                                : `${i - 12}:00 PM`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <label className="flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={dayConfig.isAvailable}
                                                            onChange={(e) => {
                                                                const newWeeklyHours =
                                                                    formData.availabilities.weeklyHours.map(
                                                                        (day, i) => {
                                                                            if (i === index) {
                                                                                return {
                                                                                    ...day,
                                                                                    isAvailable: e.target.checked,
                                                                                };
                                                                            }
                                                                            return day;
                                                                        }
                                                                    );
                                                                setFormData({
                                                                    ...formData,
                                                                    availabilities: {
                                                                        ...formData.availabilities,
                                                                        weeklyHours: newWeeklyHours,
                                                                    },
                                                                });
                                                            }}
                                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                    </label>
                                                </div>
                                            )
                                        )}
                                        <div className="pt-3 border-t border-gray-200 mt-3">
                                            <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                                                Display Note (Optional)
                                            </label>
                                            <input
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 placeholder:text-xs"
                                                placeholder="e.g., 'Available Mon-Fri, 9am-5pm IST'"
                                                value={formData.availabilities.note}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        availabilities: {
                                                            ...formData.availabilities,
                                                            note: e.target.value,
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Settings & Links */}
                            <div className="space-y-6 text-black">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <ExternalLink className="w-4 h-4 text-blue-500" />
                                            Additional Links (Optional)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updated = [
                                                    ...formData.repeaterFields,
                                                    { name: "", url: "" },
                                                ];
                                                setFormData({ ...formData, repeaterFields: updated });
                                            }}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Add Link
                                        </button>
                                    </div>

                                    <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                                        {formData.repeaterFields.map((field, index) => (
                                            <div
                                                key={index}
                                                className="flex gap-3 items-start p-3 bg-gray-50/50 rounded-xl border border-gray-200"
                                            >
                                                <div className="flex-1 space-y-2">
                                                    <input
                                                        placeholder="Link Name"
                                                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        value={field.name}
                                                        onChange={(e) => {
                                                            const updated = [...formData.repeaterFields];
                                                            updated[index].name = e.target.value;
                                                            setFormData({
                                                                ...formData,
                                                                repeaterFields: updated,
                                                            });
                                                        }}
                                                    />
                                                    <input
                                                        placeholder="URL"
                                                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        value={field.url}
                                                        onChange={(e) => {
                                                            const updated = [...formData.repeaterFields];
                                                            updated[index].url = e.target.value;
                                                            setFormData({
                                                                ...formData,
                                                                repeaterFields: updated,
                                                            });
                                                        }}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = formData.repeaterFields.filter(
                                                            (_, i) => i !== index
                                                        );
                                                        setFormData({
                                                            ...formData,
                                                            repeaterFields: updated,
                                                        });
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                            <Plus className="w-4 h-4 text-blue-500" />
                                            Event Image
                                        </label>
                                        <label className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all">
                                            <span className="text-xs text-gray-500 truncate max-w-[120px]">
                                                {imageFile ? imageFile.name : "Select image"}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {formData.eventImage && (
                                                    <img
                                                        src={formData.eventImage}
                                                        alt="Preview"
                                                        className="h-6 w-6 object-cover rounded shadow-sm"
                                                    />
                                                )}
                                                <span className="text-xs font-bold text-blue-600">
                                                    Browse
                                                </span>
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
                                                            setFormData({
                                                                ...formData,
                                                                eventImage: reader.result as string,
                                                            });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="description"
                                        className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5"
                                    >
                                        <Plus className="w-4 h-4 text-blue-500" />
                                        About this Event
                                    </label>
                                    <textarea
                                        id="description"
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-900 transition-all bg-gray-50/50 hover:bg-white placeholder:text-xs"
                                        placeholder="Briefly describe what this event is about..."
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                    />
                                </div>
                                {/* <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 text-sm">
                                                    Group Meeting
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    Allow multiple people to book the same time slot
                                                </p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.groupMeeting?.enabled || false}
                                                onChange={(e) => {
                                                    setFormData({
                                                        ...formData,
                                                        groupMeeting: {
                                                            ...formData.groupMeeting,
                                                            enabled: e.target.checked,
                                                        },
                                                    });
                                                }}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    {formData.groupMeeting?.enabled && (
                                        <div className="ml-14 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                    Maximum Guests per Slot
                                                </label>
                                                <input
                                                    type="number"
                                                    min="2"
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                    value={formData.groupMeeting.maxGuests}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        setFormData({
                                                            ...formData,
                                                            groupMeeting: {
                                                                ...formData.groupMeeting,
                                                                maxGuests: isNaN(val) ? 2 : Math.max(2, val),
                                                            },
                                                        });
                                                    }}
                                                />
                                            </div>

                                            <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition-all"
                                                    checked={formData.groupMeeting.showRemainingSpots}
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            groupMeeting: {
                                                                ...formData.groupMeeting,
                                                                showRemainingSpots: e.target.checked,
                                                            },
                                                        });
                                                    }}
                                                />
                                                <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors">
                                                    Show remaining spots on booking page
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                </div> */}

                                <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200 space-y-4">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Plus className="w-4 h-4 text-blue-500" />
                                        Verification & Visibility
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4.5 h-4.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={formData.emailVerify}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        emailVerify: e.target.checked,
                                                    })
                                                }
                                            />
                                            <span className="text-sm text-gray-600">
                                                Email OTP Verification
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4.5 h-4.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={formData.phoneVerify}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        phoneVerify: e.target.checked,
                                                    })
                                                }
                                            />
                                            <span className="text-sm text-gray-600">
                                                Phone Required
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4.5 h-4.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={formData.enablePhoneCheck}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        enablePhoneCheck: e.target.checked,
                                                    })
                                                }
                                            />
                                            <span className="text-sm text-gray-600">
                                                {" "}
                                                Phone OTP Verify{" "}
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4.5 h-4.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={formData.showNotes}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        showNotes: e.target.checked,
                                                    })
                                                }
                                            />
                                            <span className="text-sm text-gray-600">
                                                Show Note Field
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4.5 h-4.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={formData.showAdditionalLinks}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        showAdditionalLinks: e.target.checked,
                                                    })
                                                }
                                            />
                                            <span className="text-sm text-gray-600">
                                                Show Extra Links
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Plus className="w-4 h-4 text-blue-500" />
                                        Brand Color
                                    </label>
                                    <div className="flex gap-3 flex-wrap">
                                        {colors.map((c) => (
                                            <button
                                                key={c.value}
                                                type="button"
                                                onClick={() =>
                                                    setFormData({ ...formData, color: c.value })
                                                }
                                                className={`w-10 h-10 rounded-full ${c.value
                                                    } transition-all duration-300 shadow-sm ${formData.color === c.value
                                                        ? "ring-2 ring-offset-2 ring-blue-500 scale-110 shadow-md"
                                                        : "hover:scale-105 hover:shadow-md"
                                                    }`}
                                                title={c.label}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Quick Booking: Left Column */}
                            <div className="space-y-6">
                                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-px bg-blue-100"></div>
                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest whitespace-nowrap">
                                            Event Selection
                                        </span>
                                        <div className="flex-1 h-px bg-blue-100"></div>
                                    </div>

                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900 transition-all font-medium"
                                        value={quickBookingData.eventId}
                                        onChange={(e) =>
                                            setQuickBookingData({
                                                ...quickBookingData,
                                                eventId: e.target.value,
                                                title: "",
                                                duration: 30,
                                            })
                                        }
                                    >
                                        <option value="">Custom Quick Meeting</option>
                                        {events.map((event) => (
                                            <option key={event.id} value={event.id}>
                                                {event.title} ({event.duration} min)
                                            </option>
                                        ))}
                                    </select>

                                    <div className="grid grid-cols-1 gap-4 mt-4">
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
                                                onChange={(e) =>
                                                    setQuickBookingData({
                                                        ...quickBookingData,
                                                        guestName: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                                <Mail className="w-4 h-4 text-blue-500" />
                                                Guest Email *
                                            </label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all bg-white placeholder:text-xs"
                                                placeholder="e.g. jane@example.com"
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
                                </div>
                            </div>

                            {/* Quick Booking: Right Column */}
                            <div className="space-y-6">
                                <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-6 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                                                <Calendar className="w-4 h-4 text-blue-500" />
                                                Meeting Date *
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
                                            rows={4}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-900 transition-all bg-white placeholder:text-xs"
                                            placeholder="Anything the host should know..."
                                            value={quickBookingData.notes}
                                            onChange={(e) =>
                                                setQuickBookingData({
                                                    ...quickBookingData,
                                                    notes: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-100">
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
                            <>{editingEventId ? "Save Changes" : "Confirm & Create"}</>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default SchedulingModal;
