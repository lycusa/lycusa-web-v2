import Link from "next/link";
import { format } from "date-fns";
import { Conversation, CONVERSATION_STATUS_CONFIG } from "@/app/lib/types/messaging";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useUserProfile } from "@/app/hooks/useUser";

interface Props {
    conversation: Conversation;
    currentUserId: string;
}

export default function ConversationCard({ conversation, currentUserId }: Props) {
    // Determine which user is the "other" user in the conversation
    // Use string comparison to avoid type mismatches
    const currentUserIdStr = String(currentUserId || '');
    const userOneIdStr = String(conversation.user_one_id || '');
    const userTwoIdStr = String(conversation.user_two_id || '');

    // Check if current user matches either user in the conversation
    const isUserOne = userOneIdStr === currentUserIdStr;
    const isUserTwo = userTwoIdStr === currentUserIdStr;

    // Get the OTHER user's ID (not the current user)
    const otherUserId = isUserOne ? conversation.user_two_id :
        isUserTwo ? conversation.user_one_id :
            // Fallback: if current user doesn't match either, default to user_two
            conversation.user_two_id;

    const { profile, loading } = useUserProfile(otherUserId);

    // Generate avatar gradient based on user ID
    const gradientIndex = otherUserId.charCodeAt(0) % 5;
    const gradients = [
        'from-brand-500 to-tyrian-600',
        'from-pink-500 to-rose-600',
        'from-cyan-500 to-brand-600',
        'from-emerald-500 to-teal-600',
        'from-amber-500 to-orange-600',
    ];

    const displayName = loading ? "Loading..." : (profile?.username || `User ${otherUserId.slice(0, 6)}`);

    return (
        <Link
            href={`/messages/${conversation.id}`}
            className="block p-3 mx-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200 group active:scale-[0.98]"
        >
            <div className="flex gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0 self-center">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradients[gradientIndex]} flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white`}>
                        {profile?.avatarUrl ? (
                            <img src={profile.avatarUrl} alt={displayName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            displayName.slice(0, 2).toUpperCase()
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex justify-between items-start mb-0.5">
                        <h3 className="text-sm font-bold text-gray-900 truncate pr-2 group-hover:text-brand-600 transition-colors">
                            {displayName}
                        </h3>
                        {conversation.last_message_at && (
                            <span className="text-[10px] text-gray-400 flex-shrink-0 font-medium bg-gray-50 px-1.5 py-0.5 rounded">
                                {format(new Date(conversation.last_message_at), "MMM d")}
                            </span>
                        )}
                    </div>

                    {/* Order Badge */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="px-1.5 py-0.5 bg-brand-50 text-brand-700 rounded text-[10px] font-bold border border-brand-100 uppercase tracking-wide">
                            Order #{conversation.order_id.slice(0, 8)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <p className="text-xs text-gray-500 truncate font-medium">
                            <span className="text-gray-300 mr-1">•</span>
                            Tap to view message
                        </p>
                        <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-400 transition-colors flex-shrink-0" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
