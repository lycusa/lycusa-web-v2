import { DecryptedMessage, MediaType } from "@/app/lib/types/messaging";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { ExclamationCircleIcon, LockClosedIcon } from "@heroicons/react/24/outline";

interface Props {
    conversationId: string;
    messages: DecryptedMessage[];
    currentUserId: string;
    isClosed: boolean;
    closedReason: string | null;
    isConnected: boolean;
    onSendMessage: (content: string) => Promise<void>;
    onSendMedia: (file: File, type: MediaType) => Promise<void>;
    error: string | null;
    keysInitialized: boolean;
    keysError: string | null;
}

export default function ChatContainer({
    conversationId,
    messages,
    currentUserId,
    isClosed,
    closedReason,
    isConnected,
    onSendMessage,
    onSendMedia,
    error,
    keysInitialized,
    keysError,
}: Props) {

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            {/* Global Error Banner */}
            {(error || keysError) && (
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white text-sm shadow-md animate-in slide-in-from-top-full">
                    <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                    <span>{error || keysError}</span>
                </div>
            )}

            {/* Messages Area */}
            <MessageList messages={messages} currentUserId={currentUserId} />

            {/* Input or Closed State */}
            <div className="flex-shrink-0 bg-white z-20">
                {isClosed ? (
                    <div className="p-8 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
                        <div className="flex flex-col items-center text-center max-w-sm mx-auto">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                                <LockClosedIcon className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-gray-900 font-semibold mb-1">Conversation closed</p>
                            <p className="text-gray-500 text-sm">
                                {closedReason || "The order associated with this conversation has been completed or cancelled."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <MessageInput
                        onSendMessage={onSendMessage}
                        onSendMedia={onSendMedia}
                        disabled={!isConnected || !keysInitialized}
                    />
                )}
            </div>
        </div>
    );
}
