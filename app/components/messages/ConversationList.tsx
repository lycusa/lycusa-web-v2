import { Conversation } from "@/app/lib/types/messaging";
import ConversationCard from "./ConversationCard";
import { InboxIcon } from "@heroicons/react/24/outline";

interface Props {
    conversations: Conversation[];
    currentUserId: string;
}

export default function ConversationList({ conversations, currentUserId }: Props) {
    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mb-5 shadow-inner">
                    <InboxIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-500 text-sm text-center max-w-[240px]">
                    When you start a conversation with a seller or buyer, it will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100/50">
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
