import React from "react";
import Modal from "../../../components/Modal";
import { Trash2 } from "lucide-react";

interface DeleteEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventToDelete: { title: string } | null;
    isSubmitting: boolean;
    onDelete: () => void;
}

const DeleteEventModal: React.FC<DeleteEventModalProps> = ({
    isOpen,
    onClose,
    eventToDelete,
    isSubmitting,
    onDelete,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Delete Event Type"
        >
            <div className="p-1">
                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete <span className="font-bold text-gray-900">"{eventToDelete?.title}"</span>?
                    This action cannot be undone and will remove all settings for this event type.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Delete Event
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteEventModal;
