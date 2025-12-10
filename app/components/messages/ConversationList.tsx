import { Conversation } from "@/app/lib/types/messaging";
import ConversationCard from "./ConversationCard";

interface Props {
    conversations: Conversation[];
    currentUserId: string;
}

export default function ConversationList({ conversations, currentUserId }: Props) {
    if (conversations.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
                <p className="text-gray-500 text-sm mt-1">
                    Messages from your orders will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
            {conversations.map((conversation) => (
                <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    currentUserId={currentUserId}
                />
            ))}
        </div>
    );
}
