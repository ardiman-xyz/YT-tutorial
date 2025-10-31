import { MAX_IMAGE_SIZE, MAX_VIDEO_SIZE, MediaFile } from './types';

export function validateImageFile(file: File): string | null {
    if (file.size > MAX_IMAGE_SIZE) {
        return `Image ${file.name} is too large. Max size is 10MB.`;
    }
    return null;
}

export function validateVideoFile(file: File): string | null {
    if (file.size > MAX_VIDEO_SIZE) {
        return 'Video is too large. Maximum size is 1GB.';
    }
    if (!file.type.startsWith('video/')) {
        return 'Please select a valid video file.';
    }
    return null;
}

export function createMediaFile(
    file: File,
    type: 'image' | 'video',
): MediaFile {
    return {
        file,
        preview: URL.createObjectURL(file),
        type,
        ...(type === 'video' && {
            uploadProgress: 0,
            isUploading: true,
        }),
    };
}

export function cleanupMediaFiles(mediaFiles: MediaFile[]): void {
    mediaFiles.forEach((m) => URL.revokeObjectURL(m.preview));
}
