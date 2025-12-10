import { DecryptedMessage, MediaType } from "@/app/lib/types/messaging";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import EncryptionIndicator from "./EncryptionIndicator";

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
        <div className="flex flex-col h-[calc(100vh-theme(spacing.32))] bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 z-10">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500 animate-pulse"}`} />
                    <span className="text-sm font-medium text-gray-900">
                        {isConnected ? "Connected" : "Disconnected"}
                    </span>
                </div>

                <EncryptionIndicator isInitialized={keysInitialized} error={keysError} />
            </div>

            {/* Global Error */}
            {error && (
                <div className="px-4 py-2 bg-red-50 text-red-600 text-sm text-center border-b border-red-100">
                    {error}
                </div>
            )}

            {/* Messages */}
            <MessageList messages={messages} currentUserId={currentUserId} />

            {/* Input or Closed State */}
            {isClosed ? (
                <div className="p-6 bg-gray-50 border-t border-gray-200 text-center">
                    <p className="text-gray-900 font-medium">This conversation is closed</p>
                    <p className="text-gray-500 text-sm mt-1">
                        {closedReason || "The order this conversation belongs to has been completed or cancelled."}
                    </p>
                </div>
            ) : (
                <MessageInput
                    onSendMessage={onSendMessage}
                    onSendMedia={onSendMedia}
                    disabled={!isConnected || !keysInitialized}
                />
            )}
        </div>
    );
}
