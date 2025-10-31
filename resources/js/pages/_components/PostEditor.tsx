import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { FormEvent, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AudienceSelector } from './PostEditor/AudienceSelector';
import { CharacterCounter } from './PostEditor/CharacterCounter';
import { EditorActions } from './PostEditor/EditorActions';
import { useAutoResizeTextarea, useCharacterCounter } from './PostEditor/hooks';
import { MediaPreview } from './PostEditor/MediaPreview';
import { TabNavigation } from './PostEditor/TabNavigation';
import {
    Audience,
    MAX_CONTENT_LENGTH,
    TabType,
    User,
} from './PostEditor/types';
import { useMediaUpload } from './PostEditor/useMediaUpload';

interface PostEditorProps {
    user: User;
    onPostCreated?: () => void;
}

export function PostEditor({ user, onPostCreated }: PostEditorProps) {
    const [content, setContent] = useState('');
    const [audience, setAudience] = useState<Audience>('everyone');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('for-you');

    const textareaRef = useAutoResizeTextarea(content);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const charCounter = useCharacterCounter(content, MAX_CONTENT_LENGTH);

    const {
        mediaFiles,
        hasVideo,
        hasMaxImages,
        handleImageUpload,
        handleVideoUpload,
        removeMedia,
        clearMedia,
    } = useMediaUpload();

    const handleSubmit = async (e?: FormEvent) => {
        e?.preventDefault();

        if (!content.trim() && mediaFiles.length === 0) {
            toast.error('Post must have content or media.');
            return;
        }

        const uploadingVideo = mediaFiles.find(
            (m) => m.type === 'video' && m.isUploading,
        );
        if (uploadingVideo) {
            toast.error('Please wait for video to finish uploading.');
            return;
        }

        if (isSubmitting || charCounter.isOverLimit) return;

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('content', content);
        formData.append('audience', audience);

        // Add images
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
                    clearMedia();
                    setContent('');
                    onPostCreated?.();
                    toast.success('Post created successfully!');
                },
                onError: (errors) => {
                    console.error('Post creation error:', errors);
                    toast.error('Failed to create post. Please try again.');
                },
                onFinish: () => setIsSubmitting(false),
            });
        } catch (error) {
            console.error('Error posting:', error);
            setIsSubmitting(false);
            toast.error('Failed to create post.');
        }
    };

    const isPostDisabled =
        (!content.trim() && mediaFiles.length === 0) ||
        charCounter.isOverLimit ||
        isSubmitting ||
        mediaFiles.some((m) => m.isUploading);

    const getPostButtonText = () => {
        if (isSubmitting) return 'Posting...';
        if (mediaFiles.some((m) => m.isUploading)) return 'Uploading...';
        return 'Post';
    };

    return (
        <div className="border-b bg-card">
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="p-4">
                <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                        <AudienceSelector
                            audience={audience}
                            onAudienceChange={setAudience}
                        />

                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's happening?"
                            className="min-h-[60px] w-full resize-none border-0 bg-transparent p-0 text-xl outline-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
                            style={{ maxHeight: '300px' }}
                        />

                        <MediaPreview
                            mediaFiles={mediaFiles}
                            onRemove={removeMedia}
                        />

                        <div className="flex items-center justify-between border-t pt-3">
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

                            <EditorActions
                                hasVideo={hasVideo}
                                hasMaxImages={hasMaxImages}
                                hasAnyMedia={mediaFiles.length > 0}
                                onImageUpload={() =>
                                    imageInputRef.current?.click()
                                }
                                onVideoUpload={() =>
                                    videoInputRef.current?.click()
                                }
                            />

                            <div className="flex items-center gap-3">
                                {content.length > 0 && (
                                    <CharacterCounter
                                        remaining={charCounter.remaining}
                                        percentage={charCounter.percentage}
                                        strokeColor={charCounter.strokeColor}
                                    />
                                )}

                                <Button
                                    onClick={() => handleSubmit()}
                                    disabled={isPostDisabled}
                                    size="sm"
                                    className="rounded-full px-4 font-semibold"
                                >
                                    {getPostButtonText()}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
