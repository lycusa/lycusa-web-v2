/**
 * Media Upload Constants
 * 
 * Centralized configuration for media upload features.
 * Aligned with backend MEDIA_UPLOAD.md documentation.
 */

// ===== Supported Image Formats =====

/**
 * MIME types accepted by the backend for image uploads.
 * These formats will be validated and converted to WebP.
 */
export const SUPPORTED_IMAGE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
] as const;

/**
 * File extensions accepted by the backend.
 */
export const SUPPORTED_IMAGE_EXTENSIONS = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".heic",
    ".heif",
] as const;

/**
 * Accept string for file inputs - includes all supported formats.
 */
export const IMAGE_ACCEPT_STRING = SUPPORTED_IMAGE_MIME_TYPES.join(",");

/**
 * Human-readable list of supported formats for display.
 */
export const SUPPORTED_FORMATS_DISPLAY = "JPG, PNG, HEIC, HEIF, WebP";

// ===== Rejected Formats =====

/**
 * Formats explicitly rejected by the backend with reasons.
 */
export const REJECTED_FORMATS = {
    bmp: "Large file size, not optimized for web",
    tiff: "Professional format, not suitable for web",
    tif: "Professional format, not suitable for web",
    raw: "Camera raw files require processing",
    svg: "Vector format with potential security concerns",
    gif: "Animated images not supported for products/avatars",
} as const;

export const REJECTED_EXTENSIONS = Object.keys(REJECTED_FORMATS);

// ===== Size Limits =====

/**
 * Maximum file size for product media uploads (50MB).
 */
export const PRODUCT_MEDIA_MAX_SIZE = 50 * 1024 * 1024;

/**
 * Maximum file size for avatar uploads (10MB).
 */
export const AVATAR_MAX_SIZE = 10 * 1024 * 1024;

/**
 * Human-readable size limit for product media.
 */
export const PRODUCT_MEDIA_SIZE_DISPLAY = "50MB";

/**
 * Human-readable size limit for avatars.
 */
export const AVATAR_SIZE_DISPLAY = "10MB";

// ===== Processing Stages =====

/**
 * Processing stages shown during upload.
 */
export const UPLOAD_STAGES = {
    UPLOADING: "Uploading...",
    VALIDATING: "Validating format...",
    CONVERTING: "Converting to WebP...",
    MODERATING: "Checking content...",
    COMPLETING: "Finishing up...",
} as const;

// ===== Validation Helpers =====

/**
 * Check if a file extension is explicitly rejected.
 */
export function isRejectedFormat(filename: string): string | null {
    const ext = filename.toLowerCase().split(".").pop() || "";
    if (ext in REJECTED_FORMATS) {
        return REJECTED_FORMATS[ext as keyof typeof REJECTED_FORMATS];
    }
    return null;
}

/**
 * Check if a MIME type is supported.
 */
export function isSupportedMimeType(mimeType: string): boolean {
    return SUPPORTED_IMAGE_MIME_TYPES.includes(
        mimeType as (typeof SUPPORTED_IMAGE_MIME_TYPES)[number]
    );
}

/**
 * Format file size for display.
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
