export interface User {
    id: number;
    name: string;
    username?: string;
    avatar?: string;
}

export interface MediaFile {
    file: File;
    preview: string;
    type: 'image' | 'video';
    uploadId?: number;
    uploadProgress?: number;
    isUploading?: boolean;
}

export type Audience = 'everyone' | 'circle';
export type TabType = 'for-you' | 'following';

export const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
export const MAX_VIDEO_SIZE = 1024 * 1024 * 1024; // 1GB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGES = 4;
export const MAX_CONTENT_LENGTH = 280;
