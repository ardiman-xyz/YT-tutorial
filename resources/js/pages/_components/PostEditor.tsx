import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
    Calendar02Icon,
    Happy01Icon,
    Image02Icon,
    LeftToRightListTriangleIcon,
    Location01Icon,
    VideoReplayIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Globe, Play, Users, X } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface PostEditorProps {
    user: {
        id: number;
        name: string;
        username?: string;
        avatar?: string;
    };
    onPostCreated?: () => void;
}

interface MediaFile {
    file: File;
    preview: string;
    type: 'image' | 'video';
    uploadId?: number;
    uploadProgress?: number;
    isUploading?: boolean;
}

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
const MAX_VIDEO_SIZE = 1024 * 1024 * 1024; // 1GB max
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB max per image

export function PostEditor({ user, onPostCreated }: PostEditorProps) {
    const [content, setContent] = useState('');
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [audience, setAudience] = useState<'everyone' | 'circle'>('everyone');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'for-you' | 'following'>(
        'for-you',
    );
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const maxLength = 280;

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height =
                textareaRef.current.scrollHeight + 'px';
        }
    }, [content]);

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Check limits
        if (mediaFiles.length + files.length > 4) {
            toast.error('You can upload up to 4 images per post.');
            return;
        }

        // Check if trying to mix video with images
        const hasVideo = mediaFiles.some((m) => m.type === 'video');
        if (hasVideo && files.length > 0) {
            toast.error('Cannot mix images with video. Remove video first.');
            return;
        }

        const newFiles: MediaFile[] = [];

        files.forEach((file) => {
            // Validate size
            if (file.size > MAX_IMAGE_SIZE) {
                toast.error(
                    `Image ${file.name} is too large. Max size is 10MB.`,
                );
                return;
            }

            // Create preview
            const preview = URL.createObjectURL(file);
            newFiles.push({
                file,
                preview,
                type: 'image',
            });
        });

        setMediaFiles([...mediaFiles, ...newFiles]);

        // Reset input
        if (e.target) {
            e.target.value = '';
        }
    };

    // Handle video upload
    const handleVideoUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check if already has media
        if (mediaFiles.length > 0) {
            toast.error('Remove existing media before uploading video.');
            return;
        }

        // Validate video size
        if (file.size > MAX_VIDEO_SIZE) {
            toast.error('Video is too large. Maximum size is 1GB.');
            return;
        }

        // Validate video type
        if (!file.type.startsWith('video/')) {
            toast.error('Please select a valid video file.');
            return;
        }

        // Create preview
        const preview = URL.createObjectURL(file);
        const videoFile: MediaFile = {
            file,
            preview,
            type: 'video',
            uploadProgress: 0,
            isUploading: true,
        };

        setMediaFiles([videoFile]);

        // Start chunked upload
        try {
            await uploadVideoInChunks(file, 0);
        } catch (error) {
            console.error('Video upload error:', error);
            toast.error('Failed to upload video. Please try again.');
            setMediaFiles([]);
        }

        // Reset input
        if (e.target) {
            e.target.value = '';
        }
    };

    // Upload video in chunks
    const uploadVideoInChunks = async (file: File, index: number) => {
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        try {
            // 1. Initialize upload
            const { data: initData } = await axios.post('/upload/initialize', {
                filename: file.name,
                filesize: file.size,
                total_chunks: totalChunks,
            });

            const uploadId = initData.upload_id;

            // Update media file with upload ID
            setMediaFiles((prev) =>
                prev.map((m, i) => (i === index ? { ...m, uploadId } : m)),
            );

            // 2. Upload chunks
            for (let i = 0; i < totalChunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);

                const formData = new FormData();
                formData.append('upload_id', uploadId.toString());
                formData.append('chunk_number', i.toString());
                formData.append('chunk', chunk);

                await axios.post('/upload/chunk', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                // Update progress
                const progress = Math.round(((i + 1) / totalChunks) * 100);
                setMediaFiles((prev) =>
                    prev.map((m, idx) =>
                        idx === index ? { ...m, uploadProgress: progress } : m,
                    ),
                );
            }

            // 3. Complete upload
            await axios.post('/upload/complete', {
                upload_id: uploadId,
            });

            // Mark as done
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

    // Remove media file
    const removeMedia = (index: number) => {
        const media = mediaFiles[index];

        // Revoke object URL to free memory
        URL.revokeObjectURL(media.preview);

        setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    };

    // Handle post submission
    const handleSubmit = async (e?: FormEvent) => {
        if (e) e.preventDefault();

        if (!content.trim() && mediaFiles.length === 0) {
            toast.error('Post must have content or media.');
            return;
        }

        // Check if video is still uploading
        const uploadingVideo = mediaFiles.find(
            (m) => m.type === 'video' && m.isUploading,
        );
        if (uploadingVideo) {
            toast.error('Please wait for video to finish uploading.');
            return;
        }

        if (isSubmitting) return;

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('content', content);
        formData.append('audience', audience);

        // Add images directly
        mediaFiles
            .filter((m) => m.type === 'image')
            .forEach((media, index) => {
                formData.append(`images[${index}]`, media.file);
            });

        // Add video upload IDs
        const videoUploadIds = mediaFiles
            .filter((m) => m.type === 'video' && m.uploadId)
            .map((m) => m.uploadId);

        if (videoUploadIds.length > 0) {
            formData.append('video_upload_ids', JSON.stringify(videoUploadIds));
        }

        try {
            router.post('/posts', formData, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    // Clean up object URLs
                    mediaFiles.forEach((m) => URL.revokeObjectURL(m.preview));

                    setContent('');
                    setMediaFiles([]);
                    if (onPostCreated) onPostCreated();
                    toast.success('Post created successfully!');
                },
                onError: (errors) => {
                    console.error('Post creation error:', errors);
                    toast.error('Failed to create post. Please try again.');
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        } catch (error) {
            console.error('Error posting:', error);
            setIsSubmitting(false);
            toast.error('Failed to create post.');
        }
    };

    // Calculate remaining characters
    const remainingChars = maxLength - content.length;
    const charPercentage = Math.min((content.length / maxLength) * 100, 100);

    // Get stroke color based on remaining characters
    const getStrokeColor = () => {
        if (remainingChars < 0) return 'rgb(239 68 68)'; // red-500
        if (remainingChars < 20) return 'rgb(245 158 11)'; // amber-500
        return 'rgb(59 130 246)'; // blue-500
    };

    const hasVideo = mediaFiles.some((m) => m.type === 'video');

    return (
        <div className="border-b bg-card">
            {/* Tab Navigation */}
            <div className="flex border-b">
                <button
                    onClick={() => setActiveTab('for-you')}
                    className="relative flex-1 py-4 text-center font-semibold transition-colors hover:bg-muted/50"
                >
                    <span
                        className={cn(
                            activeTab === 'for-you'
                                ? 'text-foreground'
                                : 'text-muted-foreground',
                        )}
                    >
                        For you
                    </span>
                    {activeTab === 'for-you' && (
                        <div className="absolute bottom-0 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-primary" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('following')}
                    className="relative flex-1 py-4 text-center font-semibold transition-colors hover:bg-muted/50"
                >
                    <span
                        className={cn(
                            activeTab === 'following'
                                ? 'text-foreground'
                                : 'text-muted-foreground',
                        )}
                    >
                        Following
                    </span>
                    {activeTab === 'following' && (
                        <div className="absolute bottom-0 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-primary" />
                    )}
                </button>
            </div>

            {/* Post Editor */}
            <div className="p-4">
                <div className="flex gap-3">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {/* Editor Content */}
                    <div className="flex-1 space-y-3">
                        {/* Audience Selector */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 gap-1.5 rounded-full text-primary hover:bg-primary/10"
                                >
                                    {audience === 'everyone' ? (
                                        <>
                                            <Globe className="h-3.5 w-3.5" />
                                            <span className="text-xs font-medium">
                                                Everyone can reply
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Users className="h-3.5 w-3.5" />
                                            <span className="text-xs font-medium">
                                                Only your Circle can reply
                                            </span>
                                        </>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuItem
                                    onClick={() => setAudience('everyone')}
                                    className="gap-2"
                                >
                                    <Globe className="h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            Everyone can reply
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Anyone can reply to this post
                                        </span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setAudience('circle')}
                                    className="gap-2"
                                >
                                    <Users className="h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            Only your Circle can reply
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Limit who can reply to this post
                                        </span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Textarea */}
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's happening?"
                            className="min-h-[60px] w-full resize-none border-0 bg-transparent p-0 text-xl outline-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
                            style={{ maxHeight: '300px' }}
                        />

                        {/* Media Previews */}
                        {mediaFiles.length > 0 && (
                            <div
                                className={cn(
                                    'grid gap-2',
                                    mediaFiles.length === 1 && 'grid-cols-1',
                                    mediaFiles.length >= 2 && 'grid-cols-2',
                                )}
                            >
                                {mediaFiles.map((media, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            'group relative overflow-hidden rounded-2xl bg-muted',
                                            mediaFiles.length === 3 &&
                                                index === 0 &&
                                                'row-span-2',
                                        )}
                                    >
                                        {media.type === 'image' ? (
                                            <img
                                                src={media.preview}
                                                alt={`Preview ${index + 1}`}
                                                className="h-full w-full object-cover"
                                                style={{
                                                    maxHeight:
                                                        mediaFiles.length === 1
                                                            ? '400px'
                                                            : '200px',
                                                }}
                                            />
                                        ) : (
                                            <div className="relative">
                                                <video
                                                    src={media.preview}
                                                    className="h-full w-full object-cover"
                                                    style={{
                                                        maxHeight: '400px',
                                                    }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                    <div className="rounded-full bg-black/70 p-3">
                                                        <Play className="h-6 w-6 fill-white text-white" />
                                                    </div>
                                                </div>

                                                {/* Upload Progress */}
                                                {media.isUploading && (
                                                    <div className="absolute right-0 bottom-0 left-0 bg-black/80 p-3">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between text-xs text-white">
                                                                <span>
                                                                    Uploading...
                                                                </span>
                                                                <span className="font-semibold">
                                                                    {media.uploadProgress ||
                                                                        0}
                                                                    %
                                                                </span>
                                                            </div>
                                                            <Progress
                                                                value={
                                                                    media.uploadProgress ||
                                                                    0
                                                                }
                                                                className="h-2"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Remove button */}
                                        {!media.isUploading && (
                                            <Button
                                                onClick={() =>
                                                    removeMedia(index)
                                                }
                                                size="icon"
                                                variant="secondary"
                                                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                                            >
                                                <X className="h-4 w-4 text-white" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Actions Bar */}
                        <div className="flex items-center justify-between border-t pt-3">
                            {/* Action Buttons */}
                            <div className="-ml-2 flex items-center">
                                {/* Hidden inputs */}
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <input
                                    ref={videoInputRef}
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoUpload}
                                    className="hidden"
                                />

                                <TooltipProvider>
                                    {/* Image Upload */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                onClick={() =>
                                                    imageInputRef.current?.click()
                                                }
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-full text-primary hover:bg-primary/10"
                                                disabled={
                                                    mediaFiles.length >= 4 ||
                                                    hasVideo
                                                }
                                            >
                                                <HugeiconsIcon
                                                    icon={Image02Icon}
                                                    size={20}
                                                    color="currentColor"
                                                />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Add images (max 4)</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Video Upload */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                onClick={() =>
                                                    videoInputRef.current?.click()
                                                }
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-full text-primary hover:bg-primary/10"
                                                disabled={mediaFiles.length > 0}
                                            >
                                                <HugeiconsIcon
                                                    icon={VideoReplayIcon}
                                                    size={20}
                                                    color="currentColor"
                                                />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Add video (max 1GB)</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Other buttons */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled
                                                className="h-9 w-9 rounded-full text-primary hover:bg-primary/10"
                                            >
                                                <HugeiconsIcon
                                                    icon={
                                                        LeftToRightListTriangleIcon
                                                    }
                                                    size={20}
                                                    color="currentColor"
                                                />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Create poll</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled
                                                className="h-9 w-9 rounded-full text-primary hover:bg-primary/10"
                                            >
                                                <HugeiconsIcon
                                                    icon={Happy01Icon}
                                                    size={20}
                                                    color="currentColor"
                                                />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Add emoji</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled
                                                className="h-9 w-9 rounded-full text-primary hover:bg-primary/10"
                                            >
                                                <HugeiconsIcon
                                                    icon={Calendar02Icon}
                                                    size={20}
                                                    color="currentColor"
                                                />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Schedule post</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled
                                                className="h-9 w-9 rounded-full text-primary hover:bg-primary/10"
                                            >
                                                <HugeiconsIcon
                                                    icon={Location01Icon}
                                                    size={20}
                                                    color="currentColor"
                                                />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Add location</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {/* Character Counter & Post Button */}
                            <div className="flex items-center gap-3">
                                {content.length > 0 && (
                                    <div className="relative h-8 w-8">
                                        <svg className="h-8 w-8 -rotate-90">
                                            <circle
                                                cx="16"
                                                cy="16"
                                                r="12"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                fill="none"
                                                className="text-muted-foreground/20"
                                            />
                                            <circle
                                                cx="16"
                                                cy="16"
                                                r="12"
                                                stroke={getStrokeColor()}
                                                strokeWidth="3"
                                                fill="none"
                                                strokeDasharray={`${2 * Math.PI * 12}`}
                                                strokeDashoffset={`${2 * Math.PI * 12 * (1 - charPercentage / 100)}`}
                                                className="transition-all duration-200"
                                            />
                                        </svg>
                                        {remainingChars <= 20 && (
                                            <span
                                                className={cn(
                                                    'absolute inset-0 flex items-center justify-center text-xs font-medium',
                                                    remainingChars < 0 &&
                                                        'text-destructive',
                                                    remainingChars >= 0 &&
                                                        remainingChars < 20 &&
                                                        'text-amber-500',
                                                )}
                                            >
                                                {remainingChars}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <Button
                                    onClick={() => handleSubmit()}
                                    disabled={
                                        (!content.trim() &&
                                            mediaFiles.length === 0) ||
                                        remainingChars < 0 ||
                                        isSubmitting ||
                                        mediaFiles.some((m) => m.isUploading)
                                    }
                                    size="sm"
                                    className="rounded-full px-4 font-semibold"
                                >
                                    {isSubmitting
                                        ? 'Posting...'
                                        : mediaFiles.some((m) => m.isUploading)
                                          ? 'Uploading...'
                                          : 'Post'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
