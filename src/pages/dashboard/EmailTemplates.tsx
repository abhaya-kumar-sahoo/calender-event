import React, { useState, useEffect } from "react";
import {
    useCheckAuthQuery,
    useUpdateEmailTemplatesMutation,
    usePreviewEmailTemplateMutation,
} from "../../store/apiSlice";
import { Mail, Eye, Save, Info, AlertCircle, CheckCircle2, Copy, Plus, X } from "lucide-react";
import clsx from "clsx";

interface TemplateState {
    subject: string;
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
        body: "",
        bodyBlocks: [""],
    }
};

const EmailTemplates: React.FC = () => {
    const { data: user } = useCheckAuthQuery();
    const [updateEmailTemplates, { isLoading: isUpdating }] = useUpdateEmailTemplatesMutation();
    const [previewEmailTemplate, { isLoading: isPreviewing }] = usePreviewEmailTemplateMutation();

    const [templates, setTemplates] = useState<{
        guestConfirmation: TemplateState;
    }>({
        guestConfirmation: DEFAULT_TEMPLATES.guestConfirmation,
    });

    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [previewSubject, setPreviewSubject] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

    useEffect(() => {
        if (user?.emailTemplates) {
            setTemplates({
                guestConfirmation: {
                    subject: GUEST_CONSTANTS.subject,
                    body: user.emailTemplates.guestConfirmation?.body || "",
                    bodyBlocks: user.emailTemplates.guestConfirmation?.bodyBlocks || [""],
                }
            });
        }
    }, [user]);

    const handleSave = async () => {
        try {
            await updateEmailTemplates(templates).unwrap();
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (err) {
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 5000);
        }
    };

    const handlePreview = async () => {
        try {
            const result = await previewEmailTemplate({
                type: "guestConfirmation",
                bodyBlocks: templates.guestConfirmation.bodyBlocks,
            }).unwrap();
            setPreviewHtml(result.html);
            setPreviewSubject(result.subject);
            setShowPreview(true);
        } catch (err) {
            console.error("Preview failed:", err);
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
        if (blocks.length <= 1) return;
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

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Email Templates</h1>
                    <p className="text-gray-500 mt-2">Customize the guest confirmation email.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* <button
                        onClick={handlePreview}
                        disabled={isPreviewing}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <Eye className="w-5 h-5" />
                        Preview
                    </button> */}
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

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 text-black">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Subject Line</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        readOnly
                                        className="w-full pl-13 pr-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                                        value={GUEST_CONSTANTS.subject}
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-blue-50/50 rounded-4xl border border-blue-100/50 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold text-blue-900 text-sm">Email Header</h3>
                                </div>
                                <pre className="text-sm text-blue-800 whitespace-pre-wrap font-sans leading-relaxed opacity-70">
                                    {GUEST_CONSTANTS.intro}
                                </pre>
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
                                                    {(templates.guestConfirmation.bodyBlocks || []).length > 1 && (
                                                        <button
                                                            onClick={() => removeBodyBlock(idx)}
                                                            className="p-1 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
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

                            <div className="p-6 bg-gray-50 rounded-4xl border border-gray-100 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-5 h-5 text-gray-400" />
                                    <h3 className="font-bold text-gray-700 text-sm">Email Footer</h3>
                                </div>
                                <pre className="text-sm text-gray-600 font-sans leading-relaxed opacity-70">
                                    {GUEST_CONSTANTS.outro}
                                </pre>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 bg-gray-50 rounded-4xl border border-gray-100 h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-gray-900">Placeholders</h3>
                            </div>
                            <p className="text-xs text-gray-500 mb-4 font-medium">Click to copy placeholder tag</p>
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
                </div>
            </div>

            {showPreview && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 md:p-8">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setShowPreview(false)}
                    />
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-xl">
                                    <Eye className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900">Email Preview</h2>
                                    <p className="text-xs text-gray-500 font-medium truncate max-w-[300px]">Subject: {previewSubject}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-3 bg-white hover:bg-gray-100 rounded-2xl text-gray-500 transition-all shadow-sm active:scale-95"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-100/50">
                            <div className="max-w-[600px] mx-auto bg-white shadow-lg rounded-xl overflow-hidden pointer-events-none border border-gray-200">
                                <div dangerouslySetInnerHTML={{ __html: previewHtml || "" }} />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-center bg-gray-50/50">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailTemplates;
