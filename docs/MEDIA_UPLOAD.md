# Media Upload

This document describes the media upload feature for product media and avatar uploads.

## Overview

The Product Service supports media uploads for:
- **Product Media**: Images attached to product listings
- **User Avatars**: Profile images for users

All uploaded images are automatically:
1. **Validated** for supported formats
2. **Converted** to WebP format for optimal storage and delivery
3. **Moderated** using AWS Rekognition for content safety
4. **Uploaded** to AWS S3 for storage

## Supported Formats

### Accepted Formats

| Extension | MIME Type | Notes |
|-----------|-----------|-------|
| `.jpg`, `.jpeg` | `image/jpeg` | Most common format |
| `.png` | `image/png` | Supports transparency |
| `.webp` | `image/webp` | Modern format (no conversion needed) |
| `.heic` | `image/heic` | iPhone default format |
| `.heif` | `image/heif` | High Efficiency Image Format |

### Rejected Formats

| Extension | Reason |
|-----------|--------|
| `.bmp` | Large file size, no web optimization |
| `.tiff`, `.tif` | Professional format, not suitable for web |
| `.raw` | Camera raw files, requires processing |
| `.svg` | Vector format, potential security concerns |
| `.gif` | Animated images not supported for avatars/products |

## WebP Conversion

All accepted formats are automatically converted to WebP before storage:

- **Quality**: 85 (configurable via `ImageProcessor`)
- **Compression**: Method 4 (balanced speed/quality)
- **EXIF Orientation**: Automatically handled
- **Alpha Channel**: Preserved for PNG/RGBA images

### Benefits

- **Smaller file sizes**: 25-35% smaller than JPEG at equivalent quality
- **Faster loading**: Reduced bandwidth and improved user experience
- **Consistent format**: Simplified CDN caching and delivery
- **Modern compatibility**: Supported by all modern browsers

## API Endpoints

### Upload Product Media

```
POST /api/v1/media
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Request:**
```
file: <binary image file>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Media upload task started",
  "data": {
    "task_id": "abc123...",
    "status_url": "/api/v1/celery/tasks/abc123.../status"
  }
}
```

### Upload Avatar

```
POST /api/v1/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Request:**
```
file: <binary image file>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Avatar upload task started",
  "data": {
    "task_id": "xyz789...",
    "status_url": "/api/v1/celery/tasks/xyz789.../status",
    "avatar_id": "uuid-here"
  }
}
```

## Error Responses

### Rejected Format (400 Bad Request)

```json
{
  "success": false,
  "message": "File format '.bmp' is not supported. Rejected formats: bmp, tiff, raw, svg, gif"
}
```

### Invalid Format (400 Bad Request)

```json
{
  "success": false,
  "message": "Invalid file format '.xyz'. Accepted formats: jpg, jpeg, png, heic, heif, webp"
}
```

### Content Moderation Failed

```json
{
  "success": true,
  "data": {
    "rejected": true,
    "reason": "Content moderation failed",
    "media_id": "uuid-here"
  }
}
```

## File Size Limits

| Upload Type | Maximum Size |
|-------------|-------------|
| Product Media | 50 MB |
| Avatar | 10 MB |

## Processing Pipeline

```
┌─────────────┐     ┌───────────────┐     ┌─────────────┐     ┌────────────┐
│   Upload    │────▶│ Format Check  │────▶│ WebP Convert│────▶│ Moderation │
│   (API)     │     │ (Extension)   │     │  (Pillow)   │     │(Rekognition)│
└─────────────┘     └───────────────┘     └─────────────┘     └────────────┘
                                                                     │
                                                                     ▼
                          ┌──────────────┐     ┌─────────────┐     ┌────────────┐
                          │   Response   │◀────│ Publish Event│◀────│  S3 Upload │
                          │   (URL)      │     │   (Kafka)    │     │            │
                          └──────────────┘     └─────────────┘     └────────────┘
```

## Implementation Details

### ImageProcessor Class

Located at: `product_service/infrastructure/image_processing/image_processor.py`

Key methods:
- `validate_and_convert(file_bytes, filename)`: Main entry point
- `validate_format(file_bytes, filename)`: Validates using magic bytes
- `convert_to_webp(file_bytes, source_format)`: Performs conversion

### Dependencies

```toml
# pyproject.toml
"pillow>=10.4.0",      # Core image processing
"pillow-heif>=0.18.0", # HEIC/HEIF support
```

## Security Considerations

1. **Magic Bytes Validation**: File format is verified by inspecting file content, not just extension
2. **Content Moderation**: AWS Rekognition checks for inappropriate content
3. **Size Limits**: Prevents denial-of-service via large file uploads
4. **Format Restrictions**: SVG rejected due to potential XSS/script injection
