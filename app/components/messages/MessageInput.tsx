import { useRef, useState, useEffect } from "react";
import { PaperAirplaneIcon, PhotoIcon, FaceSmileIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";
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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!message.trim() && !mediaFile) || disabled || sending) return;

        try {
            setSending(true);

            if (mediaFile) {
                const type = mediaFile.type.startsWith("video/")
                    ? MediaType.VIDEO
                    : MediaType.IMAGE;

                await onSendMedia(mediaFile, type);
                setMediaFile(null);
            } else {
                await onSendMessage(message);
                setMessage("");
                // Reset height
                if (textareaRef.current) {
                    textareaRef.current.style.height = "auto";
                }
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
            // Focus textarea after selection so user can hit enter if we supported captions
            textareaRef.current?.focus();
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="p-4 bg-white border-t border-gray-100"
        >
            {mediaFile && (
                <div className="mb-4 animate-in slide-in-from-bottom-2 fade-in duration-200">
                    <MediaPreview file={mediaFile} onRemove={() => setMediaFile(null)} />
                </div>
            )}

            <div className="flex items-end gap-3 max-w-4xl mx-auto">
                {/* Interactions Group */}
                <div className="flex items-center gap-1 mb-1.5">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled || sending || !!mediaFile}
                        className="p-2 text-gray-400 hover:text-tyrian-600 hover:bg-tyrian-50 rounded-full transition-all disabled:opacity-50"
                        title="Attach image or video"
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
                </div>

                {/* Input Area */}
                <div className="flex-1 relative bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-tyrian-500 focus-within:ring-1 focus-within:ring-tyrian-500 transition-all">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={disabled || sending || !!mediaFile}
                        placeholder={mediaFile ? "Click send to upload media" : "Type a message..."}
                        className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-4 min-h-[48px] max-h-32 text-gray-900 placeholder:text-gray-400"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                </div>

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={(!message.trim() && !mediaFile) || disabled || sending}
                    className={`
                        mb-1.5 p-2.5 rounded-full shadow-sm transition-all duration-200
                        ${(!message.trim() && !mediaFile) || disabled || sending
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-tyrian-600 text-white hover:bg-tyrian-700 hover:shadow-md hover:scale-105 active:scale-95"
                        }
                    `}
                >
                    {sending ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <PaperAirplaneIcon className="w-5 h-5 -ml-0.5" />
                    )}
                </button>
            </div>

            {disabled && (
                <p className="text-center text-xs text-gray-400 mt-2">
                    This conversation is closed.
                </p>
            )}
        </form>
    );
}
