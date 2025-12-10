import { useEffect, useRef } from "react";
import { DecryptedMessage } from "@/app/lib/types/messaging";
import MessageBubble from "./MessageBubble";

interface Props {
    messages: DecryptedMessage[];
    currentUserId: string;
}

export default function MessageList({ messages, currentUserId }: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <p>No messages yet.</p>
                    <p className="text-sm">Start the conversation!</p>
                </div>
            ) : (
                messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.sender_id === currentUserId}
                    />
                ))
            )}
            <div ref={bottomRef} />
        </div>
    );
}
