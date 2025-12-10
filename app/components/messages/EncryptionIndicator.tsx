import { LockClosedIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";

interface Props {
  isInitialized: boolean;
  error?: string | null;
}

export default function EncryptionIndicator({ isInitialized, error }: Props) {
  if (error) {
    return (
      <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded text-xs" title={error}>
        <ExclamationTriangleIcon className="w-3.5 h-3.5" />
        <span className="font-medium">Encryption Error</span>
      </div>
    );
  }

  if (isInitialized) {
    return (
      <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs" title="Messages are end-to-end encrypted">
        <LockClosedIcon className="w-3.5 h-3.5" />
        <span className="font-medium">E2E Encrypted</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-gray-400 bg-gray-50 px-2 py-1 rounded text-xs">
      <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
      <span>Initializing Keys...</span>
    </div>
  );
}
