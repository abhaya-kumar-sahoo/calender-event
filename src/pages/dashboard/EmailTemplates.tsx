import React, { useState, useEffect } from "react";
import {
    useCheckAuthQuery,
    useUpdateEmailTemplatesMutation,
    useGetEventTemplatesQuery,
    useUpdateEventTemplateMutation,
    // usePreviewEmailTemplateMutation,
} from "../../store/apiSlice";
import { Mail, Save, Info, AlertCircle, CheckCircle2, Copy, Plus, X, Globe } from "lucide-react";
import clsx from "clsx";

interface TemplateState {
    subject: string;
    intro: string;
    outro: string;
    body: string;
    bodyBlocks?: string[];
}

const placeholders = [
    { name: "guestName", description: "Name of the guest" },
    { name: "eventTitle", description: "Title of the event" },
    { name: "formattedDate", description: "Date and time of the booking" },
    { name: "timezone", description: "Timezone of the booking" },
    { name: "meetingLink", description: "Google Meet link (if applicable)" },
    { name: "businessName", description: "Your business name" },
    { name: "address", description: "Your business address" },
    { name: "website", description: "Your website URL" },
    { name: "phoneNumber", description: "Your phone number" },
    { name: "hostName", description: "Your name" },
];

const GUEST_CONSTANTS = {
    subject: "Confirmation: {{eventTitle}} with {{hostName}}",
    intro: `Hi {{guestName}},

Thank you for booking with {{businessName}}. Your appointment is confirmed for {{formattedDate}}.

We have scheduled your session and look forward to meeting with you. During our time together, we will discuss your requirements and how we can best assist you. Please ensure you are available at the scheduled time.`,
    outro: `Best regards,
{{businessName}}`,
};

const DEFAULT_TEMPLATES = {
    guestConfirmation: {
        subject: GUEST_CONSTANTS.subject,
        intro: GUEST_CONSTANTS.intro,
        outro: GUEST_CONSTANTS.outro,
        body: "",
        bodyBlocks: [""],
    }
};

const EmailTemplates: React.FC = () => {
    const { data: user } = useCheckAuthQuery();
    const { data: eventTemplates, isLoading: isLoadingEvents } = useGetEventTemplatesQuery();
    const [updateUserTemplates, { isLoading: isUpdatingUser }] = useUpdateEmailTemplatesMutation();
    const [updateEventTemplate, { isLoading: isUpdatingEvent }] = useUpdateEventTemplateMutation();

    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("global");

    const [templates, setTemplates] = useState<{
        guestConfirmation: TemplateState;
    }>({
        guestConfirmation: DEFAULT_TEMPLATES.guestConfirmation,
    });

    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        if (selectedTemplateId === "global" && user?.emailTemplates) {
            setTemplates({
                guestConfirmation: {
                    subject: user.emailTemplates.guestConfirmation?.subject || GUEST_CONSTANTS.subject,
                    intro: user.emailTemplates.guestConfirmation?.intro || GUEST_CONSTANTS.intro,
                    outro: user.emailTemplates.guestConfirmation?.outro || GUEST_CONSTANTS.outro,
                    body: user.emailTemplates.guestConfirmation?.body || "",
                    bodyBlocks: user.emailTemplates.guestConfirmation?.bodyBlocks || [""],
                }
            });
        } else if (selectedTemplateId !== "global" && eventTemplates) {
            const et = eventTemplates.find(t => t._id === selectedTemplateId);
            if (et) {
                setTemplates({
                    guestConfirmation: {
                        subject: et.guestConfirmation?.subject || GUEST_CONSTANTS.subject,
                        intro: et.guestConfirmation?.intro || GUEST_CONSTANTS.intro,
                        outro: et.guestConfirmation?.outro || GUEST_CONSTANTS.outro,
                        body: et.guestConfirmation?.body || "",
                        bodyBlocks: et.guestConfirmation?.bodyBlocks || [""],
                    }
                });
            }
        }
    }, [user, eventTemplates, selectedTemplateId]);

    const handleSave = async () => {
        try {
            if (selectedTemplateId === "global") {
                await updateUserTemplates(templates).unwrap();
            } else {
                await updateEventTemplate({
                    id: selectedTemplateId,
                    updates: templates
                }).unwrap();
            }
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (err) {
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 5000);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(`{{${text}}}`);
    };

    const addBodyBlock = () => {
        const blocks = templates.guestConfirmation.bodyBlocks || [""];
        if (blocks.length >= 3) return;
        setTemplates({
            ...templates,
            guestConfirmation: {
                ...templates.guestConfirmation,
                bodyBlocks: [...blocks, ""],
            },
        });
    };

    const removeBodyBlock = (index: number) => {
        const blocks = templates.guestConfirmation.bodyBlocks || [""];
        const newBlocks = blocks.filter((_, i) => i !== index);
        setTemplates({
            ...templates,
            guestConfirmation: {
                ...templates.guestConfirmation,
                bodyBlocks: newBlocks,
            },
        });
    };

    const updateBodyBlock = (index: number, value: string) => {
        const blocks = [...(templates.guestConfirmation.bodyBlocks || [""])];
        blocks[index] = value;
        setTemplates({
            ...templates,
            guestConfirmation: {
                ...templates.guestConfirmation,
                bodyBlocks: blocks,
            },
        });
    };

    const getWordCount = (text: string) => {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    };

    const isUpdating = isUpdatingUser || isUpdatingEvent;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Email Templates</h1>
                    <p className="text-gray-500 mt-2">Customize guest confirmation emails for all your events.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isUpdating}
                        className={clsx(
                            "flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50",
                            saveStatus === "success"
                                ? "bg-green-500 text-white"
                                : saveStatus === "error"
                                    ? "bg-red-500 text-white"
                                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                        )}
                    >
                        {saveStatus === "success" ? (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Saved!
                            </>
                        ) : saveStatus === "error" ? (
                            <>
                                <AlertCircle className="w-5 h-5" />
                                Error
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="bg-white rounded-4xl border border-gray-100 shadow-xl p-4">
                        <h2 className="text-sm font-bold text-gray-400 px-4 mb-4 uppercase tracking-wider">Templates</h2>
                        <div className="space-y-1">
                            <button
                                onClick={() => setSelectedTemplateId("global")}
                                className={clsx(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold",
                                    selectedTemplateId === "global"
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                <Globe className="w-4 h-4" />
                                Global Default
                            </button>

                            <div className="pt-4 pb-2">
                                <h3 className="text-[10px] font-bold text-gray-400 px-4 uppercase tracking-[0.2em]">Events</h3>
                            </div>

                            {isLoadingEvents ? (
                                <div className="px-4 py-3 text-xs text-gray-400">Loading events...</div>
                            ) : (eventTemplates || []).map((et) => (
                                <button
                                    key={et._id}
                                    onClick={() => setSelectedTemplateId(et._id)}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold text-left",
                                        selectedTemplateId === et._id
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    <div className={clsx("w-2 h-2 rounded-full", et.eventTypeId?.color || 'bg-blue-600')} />
                                    <span className="truncate">{et.eventTypeId?.title || 'Untitled Event'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Editor */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                        <div className="p-8 grid grid-cols-1 xl:grid-cols-3 gap-8 text-black">
                            <div className="xl:col-span-2 space-y-6">
                                <div className="space-y-8">
                                    <div className="space-y-2 mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center justify-between ml-1 ">
                                            <label className="text-sm font-bold  text-blue-900">Subject Line</label>
                                            <button
                                                onClick={() => setTemplates(t => ({
                                                    ...t,
                                                    guestConfirmation: {
                                                        ...t.guestConfirmation,
                                                        subject: GUEST_CONSTANTS.subject,
                                                        intro: GUEST_CONSTANTS.intro,
                                                        outro: GUEST_CONSTANTS.outro,
                                                        bodyBlocks: DEFAULT_TEMPLATES.guestConfirmation.bodyBlocks
                                                    }
                                                }))}
                                                className="text-[10px] font-bold text-blue-600 hover:underline"
                                            >
                                                Reset All to Default
                                            </button>
                                        </div>
                                        {showAdvanced ?
                                            <div className="relative group ">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-13 pr-5 py-4 bg-blue-50/50 rounded-2xl text-blue-900 border border-gray-100  focus:bg-white focus:border-blue-500 transition-all outline-none text-sm"
                                                    value={templates.guestConfirmation.subject}
                                                    onChange={(e) => setTemplates({ ...templates, guestConfirmation: { ...templates.guestConfirmation, subject: e.target.value } })}
                                                    placeholder="Enter subject line..."
                                                />
                                            </div>
                                            : <div className="text-sm text-gray-600  font-sans leading-relaxed opacity-70 italic">
                                                {templates.guestConfirmation.subject}
                                            </div>
                                        }
                                    </div>

                                    <div className="p-6 bg-blue-50/50 rounded-4xl border border-blue-100/50 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info className="w-5 h-5 text-blue-600" />
                                            <h3 className="font-bold text-blue-900 text-sm">
                                                {showAdvanced ? "Edit Email Header (Intro)" : "Email Header (Live Preview)"}
                                            </h3>
                                        </div>
                                        {showAdvanced ? (
                                            <textarea
                                                rows={5}
                                                className="w-full px-4 py-3 rounded-2xl border border-blue-200 bg-white focus:ring-4 focus:ring-blue-500/10 outline-none text-sm leading-relaxed text-blue-900"
                                                value={templates.guestConfirmation.intro}
                                                onChange={(e) => setTemplates({ ...templates, guestConfirmation: { ...templates.guestConfirmation, intro: e.target.value } })}
                                                placeholder="Enter email header..."
                                            />
                                        ) : (
                                            <div className="text-sm text-blue-800 whitespace-pre-wrap font-sans leading-relaxed opacity-70 italic">
                                                {templates.guestConfirmation.intro}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-sm font-bold text-gray-700">Body Blocks</label>
                                            <p className="text-xs text-gray-500 font-medium">Max 3 blocks, 50 words per block</p>
                                        </div>

                                        <div className="space-y-4">
                                            {(templates.guestConfirmation.bodyBlocks || [""]).map((block, idx) => {
                                                const wordCount = getWordCount(block);
                                                const isOverLimit = wordCount > 50;
                                                return (
                                                    <div key={idx} className="relative group animate-in slide-in-from-left-2 duration-200">
                                                        <textarea
                                                            rows={2}
                                                            placeholder={`Enter body section ${idx + 1}...`}
                                                            className={clsx(
                                                                "w-full px-5 py-4 rounded-3xl border focus:ring-4 outline-none transition-all placeholder:text-gray-400 text-sm leading-relaxed",
                                                                isOverLimit
                                                                    ? "border-red-300 focus:ring-red-500/10 focus:border-red-500 bg-red-50/10"
                                                                    : "border-gray-200 focus:ring-blue-500/10 focus:border-blue-500 bg-gray-50/50 hover:bg-white"
                                                            )}
                                                            value={block}
                                                            onChange={(e) => updateBodyBlock(idx, e.target.value)}
                                                        />
                                                        <div className="absolute right-4 bottom-4 flex items-center gap-3">
                                                            <span className={clsx(
                                                                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                                                isOverLimit ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                                                            )}>
                                                                {wordCount}/50
                                                            </span>
                                                            <button
                                                                onClick={() => removeBodyBlock(idx)}
                                                                className="p-1 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {(templates.guestConfirmation.bodyBlocks || []).length < 3 && (
                                                <button
                                                    onClick={addBodyBlock}
                                                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 group"
                                                >
                                                    <div className="p-1 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors">
                                                        <Plus className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-bold">Add Another Block</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-blue-50/50 rounded-4xl border border-gray-100 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info className="w-5 h-5 text-gray-400" />
                                            <h3 className="font-bold text-gray-700 text-sm">
                                                {showAdvanced ? "Edit Email Footer (Outro)" : "Email Footer (Live Preview)"}
                                            </h3>
                                        </div>
                                        {showAdvanced ? (
                                            <textarea
                                                rows={3}
                                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-blue-50/50 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm leading-relaxed text-gray-700"
                                                value={templates.guestConfirmation.outro}
                                                onChange={(e) => setTemplates({ ...templates, guestConfirmation: { ...templates.guestConfirmation, outro: e.target.value } })}
                                                placeholder="Enter email footer..."
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-600  font-sans leading-relaxed opacity-70 italic">
                                                {templates.guestConfirmation.outro}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-gray-50 rounded-4xl border border-gray-100 h-full">
                                    <button
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="w-full flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Info className="w-5 h-5 text-blue-600" />
                                            <h3 className="font-bold text-gray-900">Advanced Features</h3>
                                        </div>
                                        <div className={clsx(
                                            "p-1 rounded-lg transition-all",
                                            showAdvanced ? "bg-blue-100 text-blue-600 rotate-180" : "bg-gray-100 text-gray-400"
                                        )}>
                                            <Plus className={clsx("w-4 h-4 transition-transform", showAdvanced && "rotate-45")} />
                                        </div>
                                    </button>

                                    {showAdvanced && (
                                        <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                                <div className="pb-2">
                                                    <h4 className="text-sm font-bold text-gray-700">Available Placeholders</h4>
                                                    <p className="text-xs text-gray-500 mt-1 font-medium">Click to copy placeholder tag</p>
                                                </div>
                                                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {placeholders.map((p) => (
                                                        <button
                                                            key={p.name}
                                                            onClick={() => copyToClipboard(p.name)}
                                                            className="w-full text-left p-3 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group relative"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-mono text-blue-600 font-bold">{`{{${p.name}}}`}</span>
                                                                <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">{p.description}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!showAdvanced && (
                                        <p className="text-xs text-gray-400 mt-4 text-center">
                                            Configure custom variables and placeholders for your email templates.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailTemplates;
