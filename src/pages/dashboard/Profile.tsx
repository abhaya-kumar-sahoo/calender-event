import React, { useState, useEffect } from "react";
import { useStore } from "../../store/StoreContext";
import { useCheckAuthQuery } from "../../store/apiSlice";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Globe,
    Camera,
    Save,
    CheckCircle,
} from "lucide-react";

export default function Profile() {
    const { data: user } = useCheckAuthQuery();
    // console.log({ user });

    const { updateProfile } = useStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        address: "",
        bio: "",
        website: "",
        mapLink: "",
        timezone: "",
        picture: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                address: user.address || "",
                bio: user.bio || "",
                website: user.website || "",
                mapLink: user.mapLink || "",
                timezone: user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
                picture: user.picture || "",
            });
            setPreviewUrl(user.picture || "");
        }
    }, [user]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSaveSuccess(false);

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("phoneNumber", formData.phoneNumber);
            data.append("address", formData.address);
            data.append("bio", formData.bio);
            data.append("website", formData.website);
            data.append("mapLink", formData.mapLink);
            data.append("timezone", formData.timezone);

            if (imageFile) {
                data.append("picture", imageFile);
            }

            await updateProfile(data);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-none mx-auto pb-20">
            {/* Header with Glassmorphism Effect */}

            <div className="relative z-10 text-black pb-10">
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Profile Settings</h1>

            </div>

            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-700">
                {/* Profile Identity Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-8">
                            <div className="flex flex-col items-center">
                                <div className="relative group mb-6">
                                    <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-gray-50 shadow-xl bg-gray-100 transition-transform duration-300 group-hover:scale-[1.02]">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Profile"
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600">
                                                <User className="w-16 h-16" />
                                            </div>
                                        )}
                                    </div>
                                    <label
                                        htmlFor="picture-upload"
                                        className="absolute bottom-2 right-2 p-3 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-all hover:scale-110 active:scale-95"
                                        title="Change Photo"
                                    >
                                        <Camera className="w-5 h-5" />
                                        <input
                                            id="picture-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{formData.name || "Your Name"}</h3>
                                <p className="text-sm text-gray-500 mb-6">{formData.email}</p>

                                <div className="w-full pt-6 border-t border-gray-100 space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Phone className="w-4 h-4 text-blue-500" />
                                        <span>{formData.phoneNumber || "No phone added"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Globe className="w-4 h-4 text-blue-500" />
                                        <span className="truncate">{formData.website || "No website added"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Information Card */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-3">
                                <span className="p-2 bg-blue-50 rounded-xl">
                                    <User className="w-5 h-5 text-blue-600" />
                                </span>
                                Personal Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full  px-5 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 bg-gray-50/50 hover:bg-white"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <input
                                            type="email"
                                            disabled
                                            className="w-full pl-5 pr-12 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed outline-none"
                                            value={formData.email}
                                        />
                                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    </div>
                                    <p className="text-[11px] text-gray-400 ml-1 italic font-medium">Verified Account Email</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            className="w-full pl-5 pr-12 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 bg-gray-50/50 hover:bg-white"
                                            placeholder="+91 9XX XXX XXX"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        />
                                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Website / Portfolio</label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            className="w-full pl-5 pr-12 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 bg-gray-50/50 hover:bg-white"
                                            placeholder="https://yourwebsite.com"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        />
                                        <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location & Bio Card */}
                        <div className="bg-white p-8 text-black rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-3">
                                <span className="p-2 bg-purple-50 rounded-xl">
                                    <MapPin className="w-5 h-5 text-purple-600" />
                                </span>
                                Professional Bio
                            </h3>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Office Location</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full pl-5 pr-12 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all placeholder:text-gray-400 bg-gray-50/50 hover:bg-white"
                                            placeholder="e.g. Melbourne, Victoria"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                        <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Map Link (Google Maps/Apple Maps)</label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            className="w-full pl-5 pr-12 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all placeholder:text-gray-400 bg-gray-50/50 hover:bg-white"
                                            placeholder="https://maps.google.com/..."
                                            value={formData.mapLink}
                                            onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                                        />
                                        <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Default Timezone</label>
                                    <div className="relative">
                                        <select
                                            className="w-full pl-5 pr-12 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none appearance-none transition-all bg-gray-50/50 hover:bg-white text-black"
                                            value={formData.timezone}
                                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                        >
                                            <option value="">Select Timezone</option>
                                            {/* @ts-ignore */}
                                            {(Intl as any).supportedValuesOf('timeZone').map((tz: string) => (
                                                <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                                            ))}
                                        </select>
                                        <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none" />
                                    </div>
                                    <p className="text-[11px] text-gray-400 ml-1 font-medium">Your working hours will be based on this timezone.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Short Biography</label>
                                    <textarea
                                        rows={5}
                                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none resize-none transition-all placeholder:text-gray-400 bg-gray-50/50 hover:bg-white"
                                        placeholder="Tell your clients a bit about your professional background and expertise..."
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    />
                                    <p className="text-[11px] text-gray-400 ml-1 font-medium">This will be visible on your public booking pages.</p>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Action Footer - Floating Style */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-5 px-8 rounded-3xl border border-gray-100 shadow-2xl sticky bottom-6 z-20">
                            <div className="flex items-center gap-3">
                                {saveSuccess ? (
                                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-full animate-in zoom-in-95 duration-300">
                                        <CheckCircle className="w-4 h-4" />
                                        Changes Saved!
                                    </div>
                                ) : (
                                    <p className="text-sm font-medium text-gray-500">
                                        Click save to update your profile
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all active:scale-95 flex-1 sm:flex-none border border-gray-100 sm:border-0"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-10 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 flex-1 sm:flex-none min-w-[160px]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Update Profile
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
