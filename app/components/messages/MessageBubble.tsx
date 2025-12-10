import { useState } from "react";
import { format } from "date-fns";
import { LockClosedIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { DecryptedMessage, MediaType } from "@/app/lib/types/messaging";
import { getMessageMediaUrl } from "@/app/lib/api";

interface Props {
    message: DecryptedMessage;
    isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: Props) {
    const [imgError, setImgError] = useState(false);
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);

    // Load media URL if needed
    if (message.media_key && !mediaUrl && !imgError) {
        getMessageMediaUrl(message.media_key)
            .then(setMediaUrl)
            .catch(() => setImgError(true));
    }

    return (
        <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
            <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwn
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-900 rounded-bl-none"
                    }`}
            >
                {/* Encrypted indicator */}
                {message.encrypted_content && (
                    <div className={`flex items-center gap-1 text-[10px] mb-1 ${isOwn ? "text-indigo-200" : "text-gray-500"}`}>
                        <LockClosedIcon className="w-3 h-3" />
                        <span>End-to-End Encrypted</span>
                    </div>
                )}

                {/* Media Content */}
                {message.media_key && (
                    <div className="mb-2">
                        {imgError ? (
                            <div className="flex items-center gap-2 p-3 bg-red-50 rounded text-red-600 border border-red-100">
                                <ExclamationTriangleIcon className="w-5 h-5" />
                                <span className="text-xs">Failed to load media</span>
                            </div>
                        ) : !mediaUrl ? (
                            <div className="w-48 h-32 bg-gray-200 rounded animate-pulse" />
                        ) : message.media_type === MediaType.VIDEO ? (
                            <video
                                src={mediaUrl}
                                controls
                                className="max-w-full rounded-lg max-h-[300px]"
                            />
                        ) : (
                            <img
                                src={mediaUrl}
                                alt="Shared media"
                                className="max-w-full rounded-lg max-h-[300px] object-cover"
                                onError={() => setImgError(true)}
                            />
                        )}
                    </div>
                )}

                {/* Text Content */}
                {message.decryptedContent ? (
                    <p className="break-words whitespace-pre-wrap text-sm">
                        {message.decryptedContent}
                    </p>
                ) : message.decryptionFailed ? (
                    <div className="flex items-center gap-2 text-xs italic opacity-80">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        <span>Message could not be decrypted</span>
                    </div>
                ) : null}

                {/* Timestamp */}
                <p className={`text-[10px] mt-1 text-right ${isOwn ? "text-indigo-200" : "text-gray-400"}`}>
                    {format(new Date(message.inserted_at), "h:mm a")}
                </p>
            </div>
        </div>
    );
}
