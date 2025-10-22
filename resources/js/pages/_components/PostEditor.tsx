import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { router } from '@inertiajs/react';
import { Globe, Users, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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

export function PostEditor({ user, onPostCreated }: PostEditorProps) {
    const [content, setContent] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [audience, setAudience] = useState<'everyone' | 'circle'>('everyone');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'for-you' | 'following'>(
        'for-you',
    );
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
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
        if (files.length + images.length > 4) {
            toast('You can upload up to 4 images per post.');
            return;
        }

        setImages([...images, ...files]);

        // Create previews
        const newPreviews: string[] = [];
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                if (newPreviews.length === files.length) {
                    setImagePreviews([...imagePreviews, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    // Remove image
    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    // Handle post submission
    const handleSubmit = async () => {
        if (!content.trim() && images.length === 0) return;
        if (isSubmitting) return;

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('content', content);
        formData.append('audience', audience);

        images.forEach((image, index) => {
            formData.append(`images[${index}]`, image);
        });

        try {
            router.post('/posts', formData, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setContent('');
                    setImages([]);
                    setImagePreviews([]);
                    if (onPostCreated) onPostCreated();
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        } catch (error) {
            console.error('Error posting:', error);
            setIsSubmitting(false);
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

    return (
        <div className="border-b bg-card">
            {/* Tab Navigation - Twitter/X style with underline only */}
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
                    <Avatar className="h-12 w-12">
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
                                    disabled
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

                        {/* Textarea - Custom styled without borders */}
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's happening?"
                            className="min-h-[60px] w-full resize-none border-0 bg-transparent p-0 text-xl outline-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
                            style={{ maxHeight: '300px' }}
                        />

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                            <div
                                className={cn(
                                    'grid gap-2',
                                    imagePreviews.length === 1 && 'grid-cols-1',
                                    imagePreviews.length === 2 && 'grid-cols-2',
                                    imagePreviews.length === 3 && 'grid-cols-2',
                                    imagePreviews.length === 4 && 'grid-cols-2',
                                )}
                            >
                                {imagePreviews.map((preview, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            'group relative overflow-hidden rounded-2xl bg-muted',
                                            imagePreviews.length === 3 &&
                                                index === 0 &&
                                                'row-span-2',
                                        )}
                                    >
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="h-full w-full object-cover"
                                            style={{
                                                maxHeight:
                                                    imagePreviews.length === 1
                                                        ? '400px'
                                                        : '200px',
                                            }}
                                        />
                                        <Button
                                            onClick={() => removeImage(index)}
                                            size="icon"
                                            variant="secondary"
                                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                                        >
                                            <X className="h-4 w-4 text-white" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Actions Bar */}
                        <div className="flex items-center justify-between border-t pt-3">
                            {/* Action Buttons */}
                            <div className="-ml-2 flex items-center">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-full text-primary hover:bg-primary/10"
                                                disabled={images.length >= 4}
                                            >
                                                <HugeiconsIcon
                                                    icon={Image02Icon}
                                                    size={24}
                                                    color="currentColor"
                                                />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Add images</p>
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
                                                    icon={
                                                        LeftToRightListTriangleIcon
                                                    }
                                                    size={24}
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
                                                    size={24}
                                                    color="currentColor"
                                                    strokeWidth={2}
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
                                                    size={24}
                                                    color="currentColor"
                                                    strokeWidth={2}
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
                                                    size={24}
                                                    color="currentColor"
                                                    strokeWidth={2}
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
                                            {/* Background circle */}
                                            <circle
                                                cx="16"
                                                cy="16"
                                                r="12"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                fill="none"
                                                className="text-muted-foreground/20"
                                            />
                                            {/* Progress circle */}
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
                                    onClick={handleSubmit}
                                    disabled={
                                        (!content.trim() &&
                                            images.length === 0) ||
                                        remainingChars < 0 ||
                                        isSubmitting
                                    }
                                    size="sm"
                                    className="rounded-full px-4 font-semibold"
                                >
                                    {isSubmitting ? 'Posting...' : 'Post'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
