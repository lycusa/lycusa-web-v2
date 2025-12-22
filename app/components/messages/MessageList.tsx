import { useEffect, useRef } from "react";
import { DecryptedMessage } from "@/app/lib/types/messaging";
import MessageBubble from "./MessageBubble";
import { ChatBubbleLeftEllipsisIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

interface Props {
    messages: DecryptedMessage[];
    currentUserId: string;
    decryptMediaFile: (encryptedBlob: Blob, fileIv: string, mimeType: string) => Promise<Blob>;
    otherUserAvatarUrl?: string;
}

export default function MessageList({ messages, currentUserId, decryptMediaFile, otherUserAvatarUrl }: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto chat-scrollbar px-4 pb-4 pt-6 bg-slate-50"
        >
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 opacity-0 animate-in fade-in duration-500 fill-mode-forwards delay-150">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-50 to-white shadow-sm border border-brand-100 flex items-center justify-center mb-6">
                        <ChatBubbleLeftEllipsisIcon className="w-10 h-10 text-brand-300" />
                    </div>
                    <h3 className="text-gray-900 font-semibold mb-2 text-lg">Start the conversation</h3>
                    <p className="text-gray-500 text-sm text-center max-w-[280px] mb-8 leading-relaxed">
                        Messages are end-to-end encrypted. Only you and the recipient can read them.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full shadow-sm">
                        <ShieldCheckIcon className="w-4 h-4" />
                        <span>Secured by E2EE</span>
                    </div>
                </div>
            ) : (
                <div className="space-y-1 max-w-4xl mx-auto">
                    {/* Encryption notice at top */}
                    <div className="flex justify-center mb-8 opacity-0 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 bg-gray-100/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white/50">
                            <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Messages are end-to-end encrypted</span>
                        </div>
                    </div>

                    {messages.map((msg, index) => {
                        const isOwn = msg.sender_id === currentUserId;
                        const prevMsg = messages[index - 1];
                        const nextMsg = messages[index + 1];

                        // Group consecutive messages from same sender
                        const isFirstInGroup = !prevMsg || prevMsg.sender_id !== msg.sender_id;
                        const isLastInGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id;

                        // Add date separator if needed (e.g., if day changed)
                        const showDateSeparator = !prevMsg ||
                            new Date(msg.inserted_at).toDateString() !== new Date(prevMsg.inserted_at).toDateString();

                        return (
                            <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {showDateSeparator && (
                                    <div className="flex justify-center my-6">
                                        <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                            {new Date(msg.inserted_at).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                )}
                                <MessageBubble
                                    message={msg}
                                    isOwn={isOwn}
                                    isFirstInGroup={isFirstInGroup}
                                    isLastInGroup={isLastInGroup}
                                    decryptMediaFile={decryptMediaFile}
                                    avatarUrl={!isOwn ? otherUserAvatarUrl : undefined}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
            <div ref={bottomRef} className="h-1" />
        </div>
    );
}
