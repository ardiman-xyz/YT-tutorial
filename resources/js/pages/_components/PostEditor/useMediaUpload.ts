import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';
import { CHUNK_SIZE, MAX_IMAGES, MediaFile } from './types';
import { createMediaFile, validateImageFile, validateVideoFile } from './utils';

export function useMediaUpload() {
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

    const hasVideo = mediaFiles.some((m) => m.type === 'video');
    const hasMaxImages = mediaFiles.length >= MAX_IMAGES;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (mediaFiles.length + files.length > MAX_IMAGES) {
            toast.error(`You can upload up to ${MAX_IMAGES} images per post.`);
            return;
        }

        if (hasVideo) {
            toast.error('Cannot mix images with video. Remove video first.');
            return;
        }

        const newFiles: MediaFile[] = [];

        for (const file of files) {
            const error = validateImageFile(file);
            if (error) {
                toast.error(error);
                continue;
            }

            newFiles.push(createMediaFile(file, 'image'));
        }

        setMediaFiles((prev) => [...prev, ...newFiles]);
        e.target.value = '';
    };

    const handleVideoUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (mediaFiles.length > 0) {
            toast.error('Remove existing media before uploading video.');
            return;
        }

        const error = validateVideoFile(file);
        if (error) {
            toast.error(error);
            return;
        }

        const videoFile = createMediaFile(file, 'video');
        setMediaFiles([videoFile]);

        try {
            await uploadVideoInChunks(file, 0);
        } catch (error) {
            console.error('Video upload error:', error);
            toast.error('Failed to upload video. Please try again.');
            setMediaFiles([]);
        }

        e.target.value = '';
    };

    const uploadVideoInChunks = async (file: File, index: number) => {
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        try {
            // Initialize upload
            const { data: initData } = await axios.post('/upload/initialize', {
                filename: file.name,
                filesize: file.size,
                total_chunks: totalChunks,
            });

            const uploadId = initData.upload_id;

            setMediaFiles((prev) =>
                prev.map((m, i) => (i === index ? { ...m, uploadId } : m)),
            );

            // Upload chunks
            for (let i = 0; i < totalChunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);

                const formData = new FormData();
                formData.append('upload_id', uploadId.toString());
                formData.append('chunk_number', i.toString());
                formData.append('chunk', chunk);

                await axios.post('/upload/chunk', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                const progress = Math.round(((i + 1) / totalChunks) * 100);
                setMediaFiles((prev) =>
                    prev.map((m, idx) =>
                        idx === index ? { ...m, uploadProgress: progress } : m,
                    ),
                );
            }

            // Complete upload
            await axios.post('/upload/complete', { upload_id: uploadId });

            setMediaFiles((prev) =>
                prev.map((m, i) =>
                    i === index
                        ? { ...m, isUploading: false, uploadProgress: 100 }
                        : m,
                ),
            );

            toast.success('Video uploaded successfully!');
        } catch (error) {
            console.error('Chunk upload error:', error);
            throw error;
        }
    };

    const removeMedia = (index: number) => {
        const media = mediaFiles[index];
        URL.revokeObjectURL(media.preview);
        setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const clearMedia = () => {
        mediaFiles.forEach((m) => URL.revokeObjectURL(m.preview));
        setMediaFiles([]);
    };

    return {
        mediaFiles,
        hasVideo,
        hasMaxImages,
        handleImageUpload,
        handleVideoUpload,
        removeMedia,
        clearMedia,
    };
}
