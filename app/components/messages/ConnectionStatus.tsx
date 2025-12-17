import { useConnectionStatus, ConnectionState } from "@/app/hooks/useMessaging";
import { ExclamationCircleIcon, SignalIcon, SignalSlashIcon } from "@heroicons/react/24/outline";

export default function ConnectionStatus() {
    const { status, error, connect } = useConnectionStatus();

    if (status === ConnectionState.CONNECTED) {
        return (
            <div className="flex items-center text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                <SignalIcon className="w-3.5 h-3.5 mr-1.5" />
                <span>Connected</span>
            </div>
        );
    }

    if (status === ConnectionState.CONNECTING) {
        return (
            <div className="flex items-center text-xs text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-600 border-t-transparent animate-spin mr-1.5" />
                <span>Connecting...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center group relative">
            <button
                onClick={connect}
                className="flex items-center text-xs text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full border border-red-100 transition-colors"
            >
                <SignalSlashIcon className="w-3.5 h-3.5 mr-1.5" />
                <span>Disconnected</span>
            </button>

            {/* Tooltip for error or instructions */}
            <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 text-xs text-gray-600">
                <div className="flex items-start mb-1">
                    <ExclamationCircleIcon className="w-4 h-4 text-red-500 mr-1.5 flex-shrink-0" />
                    <p className="font-medium text-gray-900">Connection Failed</p>
                </div>
                <p className="mb-2">
                    {error || "Unable to connect to messaging service."}
                </p>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                    <p className="font-mono text-[10px] text-gray-500">
                        Check if backend is running on port 4001
                    </p>
                </div>
            </div>
        </div>
    );
}
