import { useRef, useState } from "react";
import { PaperAirplaneIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/solid";
import MediaPreview from "./MediaPreview";
import { MediaType } from "@/app/lib/types/messaging";

interface Props {
    onSendMessage: (content: string) => Promise<void>;
    onSendMedia: (file: File, type: MediaType) => Promise<void>;
    disabled?: boolean;
}

export default function MessageInput({ onSendMessage, onSendMedia, disabled }: Props) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!message.trim() && !mediaFile) || disabled || sending) return;

        try {
            setSending(true);

            if (mediaFile) {
                const type = mediaFile.type.startsWith("video/")
                    ? MediaType.VIDEO
                    : MediaType.IMAGE; // Simplifying: treating all non-video as image/file

                await onSendMedia(mediaFile, type);
                setMediaFile(null);
            } else {
                await onSendMessage(message);
                setMessage("");
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Limit size to 10MB
            if (file.size > 10 * 1024 * 1024) {
                alert("File size must be less than 10MB");
                return;
            }
            setMediaFile(file);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
            {mediaFile && (
                <div className="mb-3">
                    <MediaPreview file={mediaFile} onRemove={() => setMediaFile(null)} />
                </div>
            )}

            <div className="flex items-end gap-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || sending || !!mediaFile}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Upload image or video"
                >
                    <PhotoIcon className="w-6 h-6" />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                    className="hidden"
                />

                <div className="flex-1">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={disabled || sending || !!mediaFile}
                        placeholder={mediaFile ? "Add a caption (optional - implementation pending)" : "Type a message..."}
                        className="w-full resize-none rounded-lg border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[44px] max-h-32 py-2.5"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={(!message.trim() && !mediaFile) || disabled || sending}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {sending ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <PaperAirplaneIcon className="w-6 h-6" />
                    )}
                </button>
            </div>
            {disabled && (
                <p className="text-center text-xs text-gray-500 mt-2">
                    This conversation is closed. You cannot send new messages.
                </p>
            )}
        </form>
    );
}
