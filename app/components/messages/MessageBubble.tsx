import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { LockClosedIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { DecryptedMessage, MediaType } from "@/app/lib/types/messaging";
import { getMessageMediaUrl } from "@/app/lib/api";

interface Props {
    message: DecryptedMessage;
    isOwn: boolean;
    isFirstInGroup: boolean;
    isLastInGroup: boolean;
    decryptMediaFile: (encryptedBlob: Blob, fileIv: string, mimeType: string) => Promise<Blob>;
}

export default function MessageBubble({ message, isOwn, isFirstInGroup, isLastInGroup, decryptMediaFile }: Props) {
    const [imgError, setImgError] = useState(false);
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [isLoadingMedia, setIsLoadingMedia] = useState(false);
    const objectUrlRef = useRef<string | null>(null);

    // Clean up object URL on unmount
    useEffect(() => {
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        };
    }, []);

    // Load media - either encrypted (needs decryption) or unencrypted (direct URL)
    useEffect(() => {
        if (!message.media_key || mediaUrl || imgError || isLoadingMedia) {
            return;
        }

        const loadMedia = async () => {
            setIsLoadingMedia(true);
            try {
                // Get presigned URL from server
                const presignedUrl = await getMessageMediaUrl(message.media_key!);

                // Check if media is encrypted (has file_iv from decrypted metadata)
                if (message.file_iv) {
                    console.log(`[Media] Downloading and decrypting encrypted media for message ${message.id}`);

                    // Download encrypted blob
                    const response = await fetch(presignedUrl);
                    if (!response.ok) {
                        throw new Error(`Failed to download media: ${response.status}`);
                    }
                    const encryptedBlob = await response.blob();

                    // Decrypt the file
                    const mimeType = message.media_mime_type || 'application/octet-stream';
                    const decryptedBlob = await decryptMediaFile(encryptedBlob, message.file_iv, mimeType);

                    // Create object URL for decrypted content
                    const objectUrl = URL.createObjectURL(decryptedBlob);
                    objectUrlRef.current = objectUrl;
                    setMediaUrl(objectUrl);
                    console.log(`[Media] Successfully decrypted media for message ${message.id}`);
                } else {
                    // Unencrypted media - use presigned URL directly
                    console.log(`[Media] Using direct URL for unencrypted media ${message.id}`);
                    setMediaUrl(presignedUrl);
                }
            } catch (error) {
                console.error(`[Media] Failed to load media for message ${message.id}:`, error);
                setImgError(true);
            } finally {
                setIsLoadingMedia(false);
            }
        };

        loadMedia();
    }, [message.media_key, message.file_iv, message.media_mime_type, message.id, mediaUrl, imgError, isLoadingMedia, decryptMediaFile]);

    // Dynamic classes based on grouping
    const roundedClass = isOwn
        ? `${isFirstInGroup ? "rounded-tr-2xl" : "rounded-tr-md"} ${isLastInGroup ? "rounded-br-2xl" : "rounded-br-md"} rounded-l-2xl`
        : `${isFirstInGroup ? "rounded-tl-2xl" : "rounded-tl-md"} ${isLastInGroup ? "rounded-bl-2xl" : "rounded-bl-md"} rounded-r-2xl`;

    const marginClass = isLastInGroup ? "mb-4" : "mb-1";

    return (
        <div className={`flex w-full ${isOwn ? "justify-end" : "justify-start"} ${marginClass} group`}>
            <div className={`flex flex-col max-w-[75%] sm:max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                <div
                    className={`
                        relative px-4 py-3 overflow-hidden shadow-sm
                        ${roundedClass}
                        ${isOwn
                            ? "bg-gradient-to-br from-tyrian-700 to-tyrian-800 text-white"
                            : "bg-white text-gray-900 border border-gray-100"
                        }
                    `}
                >
                    {/* Media Content */}
                    {message.media_key && (
                        <div className="-mx-2 -mt-2 mb-2 overflow-hidden rounded-lg bg-black/5">
                            {imgError ? (
                                <div className="flex items-center gap-2 p-4 text-xs">
                                    <ExclamationTriangleIcon className="w-4 h-4 opacity-50" />
                                    <span>Failed to load media</span>
                                </div>
                            ) : !mediaUrl ? (
                                <div className="w-64 h-48 bg-gray-200/20 animate-pulse flex items-center justify-center">
                                    {message.file_iv && (
                                        <div className="flex flex-col items-center gap-2 text-xs text-gray-400">
                                            <LockClosedIcon className="w-5 h-5" />
                                            <span>Decrypting...</span>
                                        </div>
                                    )}
                                </div>
                            ) : message.media_type === MediaType.VIDEO ? (
                                <video
                                    src={mediaUrl}
                                    controls
                                    className="max-w-full max-h-[300px] object-contain"
                                />
                            ) : (
                                <img
                                    src={mediaUrl}
                                    alt="Shared media"
                                    className="max-w-full max-h-[300px] object-cover hover:scale-105 transition-transform duration-300"
                                    onError={() => setImgError(true)}
                                />
                            )}
                        </div>
                    )}

                    {/* Text Content */}
                    {message.decryptedContent ? (
                        <p className={`text-[15px] leading-relaxed break-words whitespace-pre-wrap ${isOwn ? "text-tyrian-50" : "text-gray-800"}`}>
                            {message.decryptedContent}
                        </p>
                    ) : message.decryptionFailed ? (
                        <div className="flex items-center gap-2 text-xs italic opacity-80 py-1">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            <span>Message could not be decrypted</span>
                        </div>
                    ) : null}
                </div>

                {/* Metadata Footer (Environment + Time) */}
                {isLastInGroup && (
                    <div className={`flex items-center gap-1.5 mt-1 px-1 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                        <span className="text-gray-400 font-medium">
                            {format(new Date(message.inserted_at), "h:mm a")}
                        </span>
                        {(message.encrypted_content || message.signal_ciphertext) && (
                            <div className="flex items-center gap-0.5 text-emerald-600" title="End-to-End Encrypted">
                                <LockClosedIcon className="w-3 h-3" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
