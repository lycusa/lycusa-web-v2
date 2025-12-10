import Link from "next/link";
import { Conversation } from "@/app/lib/types/messaging";
import { formatDistanceToNow } from "date-fns";

interface Props {
    conversation: Conversation;
    currentUserId: string;
}

export default function ConversationCard({ conversation, currentUserId }: Props) {
    // Determine if we are user one
    const isUserOne = conversation.user_one_id === currentUserId;
    const otherUserId = isUserOne ? conversation.user_two_id : conversation.user_one_id;

    // In a real app we'd fetch the other user's profile info
    // For now we'll just show their ID or a placeholder

    const lastActive = conversation.last_message_at
        ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
        : 'New';

    return (
        <Link
            href={`/messages/${conversation.id}`}
            className="block p-4 bg-white hover:bg-gray-50 border-b border-gray-100 transition-colors"
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-lg">
                    {otherUserId.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                            User {otherUserId.slice(0, 8)}...
                        </h3>
                        <span className="text-xs text-gray-500">{lastActive}</span>
                    </div>

                    <p className="text-sm text-gray-500 truncate">
                        {conversation.status === 'closed' ? (
                            <span className="italic">Conversation closed</span>
                        ) : (
                            <span>Click to view messages</span>
                        )}
                    </p>
                </div>

                {/* Unread indicator could go here */}
            </div>
        </Link>
    );
}
