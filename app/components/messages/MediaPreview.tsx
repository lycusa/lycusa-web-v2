import { XMarkIcon } from "@heroicons/react/24/outline";
import { MediaType } from "@/app/lib/types/messaging";

interface Props {
    file: File;
    onRemove: () => void;
}

export default function MediaPreview({ file, onRemove }: Props) {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const url = URL.createObjectURL(file);

    return (
        <div className="relative inline-block mt-2">
            <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 max-w-[200px] max-h-[200px]">
                {isImage && (
                    <img
                        src={url}
                        alt="Preview"
                        className="object-cover max-w-full max-h-[200px]"
                        onLoad={() => URL.revokeObjectURL(url)}
                    />
                )}
                {isVideo && (
                    <video
                        src={url}
                        className="max-w-full max-h-[200px]"
                        controls={false}
                    />
                )}
                {!isImage && !isVideo && (
                    <div className="flex items-center justify-center w-32 h-32 text-gray-400">
                        <span className="text-xs">{file.name}</span>
                    </div>
                )}
            </div>

            <button
                onClick={onRemove}
                className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1 shadow-sm hover:bg-gray-700 transition-colors"
                type="button"
            >
                <XMarkIcon className="w-3 h-3" />
            </button>

            <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
                {file.name}
            </div>
        </div>
    );
}
