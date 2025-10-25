import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { PostActions } from './PostActions';
import { PostMediaGrid } from './PostMedia';

interface PostMedia {
    id: number;
    url: string;
    type: 'image' | 'video' | 'gif';
    thumbnail?: string;
    duration?: string;
}

interface PostUser {
    id?: number;
    name: string;
    username: string;
    avatar?: string;
    verified?: boolean;
}

interface PostData {
    id: number;
    user: PostUser;
    content: string;
    media: PostMedia[];
    created_at: string;
    user_id: number;
}

interface PostDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    post: PostData | null;
    currentUser: PostUser;
    formatTimestamp: (date: string) => string;
    onDelete?: (postId: number) => void;
}

export function PostDetailModal({
    open,
    onOpenChange,
    post,
    currentUser,
    formatTimestamp,
    onDelete,
}: PostDetailModalProps) {
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    if (!post) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
                    open ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
                onClick={() => onOpenChange(false)}
            />

            {/* Fullscreen Modal */}
            <div
                className={cn(
                    'fixed inset-0 z-50 flex h-full w-full bg-background transition-transform duration-300 ease-out',
                    open ? 'translate-y-0' : 'translate-y-full',
                )}
            >
                {/* Left Column — Post Detail */}
                <div className="flex-1 overflow-y-auto border-r">
                    {/* Header */}
                    <div className="bg-b/70 sticky top-0 z-10 flex items-center gap-4 border-b border-white/10 px-4 py-3 backdrop-blur-lg">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                            className="h-9 w-9 rounded-full"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                        <h2 className="flex-1 text-xl font-bold">Post</h2>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <PostMediaGrid media={post.media} />

                        <div className="mt-3 text-sm text-muted-foreground">
                            {formatTimestamp(post.created_at)}
                        </div>

                        <Separator className="my-3" />

                        <PostActions
                            replies={0}
                            likes={0}
                            reposts={0}
                            views={0}
                            isLiked={false}
                            isReposted={false}
                            isBookmarked={false}
                            onLike={() => {}}
                            onRepost={() => {}}
                            onReply={() => {}}
                            onBookmark={() => {}}
                            onShare={() => {}}
                        />
                    </div>
                </div>

                {/* Right Column — Comments */}
                <div className="flex w-full flex-col bg-muted/10 md:w-[400px]">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <h3 className="text-lg font-semibold">Comments</h3>
                    </div>

                    {/* Comment List */}
                    <div className="flex-1 space-y-4 overflow-y-auto p-4">
                        {/* Example comment */}
                        <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="text-sm font-semibold">
                                    User123
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Keren banget UI-nya 🔥
                                </p>
                            </div>
                        </div>
                        {/* You can map actual comments here */}
                    </div>

                    {/* Comment Input */}
                    <div className="border-t p-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage
                                    src={currentUser.avatar}
                                    alt={currentUser.name}
                                />
                                <AvatarFallback>
                                    {currentUser.name
                                        .substring(0, 2)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <Button size="sm" className="rounded-full">
                                Reply
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
