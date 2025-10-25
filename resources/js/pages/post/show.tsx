import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import type { Post as PostType, User } from '@/types/post';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Post } from '../_components/Post';
import { PostActions } from '../_components/PostActions';
import { PostMediaGrid } from '../_components/PostMedia';
import { ReplyDialog } from '../_components/ReplyDialog';

export default function PostShow() {
    const { post: initialPost, auth } = usePage<any>().props as {
        post: PostType & { replies: PostType[] };
        auth: { user: User };
    };

    const [post, setPost] = useState(initialPost);
    const [replyDialogOpen, setReplyDialogOpen] = useState(false);

    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        postId: number | null;
    }>({
        open: false,
        postId: null,
    });

    const formatTimestamp = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const formatFullDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handleBack = () => {
        router.visit('/dashboard');
    };

    const handleDeleteClick = (postId: number) => {
        setDeleteDialog({ open: true, postId });
    };

    const handleDeleteConfirm = () => {
        if (deleteDialog.postId) {
            router.delete(`/posts/${deleteDialog.postId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    router.visit('/dashboard');
                },
            });
        }
    };

    const handleLike = async (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        try {
            const response = await axios.post(`/posts/${post.id}/like`);

            setPost((prevPost) => ({
                ...prevPost,
                is_liked: response.data.isLiked,
                likes_count: response.data.likesCount,
            }));
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleRepost = async (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        try {
            const response = await axios.post(`/posts/${post.id}/repost`);

            setPost((prevPost) => ({
                ...prevPost,
                is_reposted: response.data.isReposted,
                reposts_count: response.data.repostsCount,
            }));
        } catch (error) {
            console.error('Error toggling repost:', error);
        }
    };

    const handleBookmark = async (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        try {
            const response = await axios.post(`/posts/${post.id}/bookmark`);

            setPost((prevPost) => ({
                ...prevPost,
                is_bookmarked: response.data.isBookmarked,
            }));
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };

    const handleReplyClick = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setReplyDialogOpen(true);
    };

    return (
        <AppLayout>
            <Head title={`${post.user.name} on Zephyr`} />

            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="h-9 w-9 rounded-full"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Post</h1>
                </div>

                {/* Main Post */}
                <div className="border-b p-4">
                    <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage
                                src={post.user.avatar}
                                alt={post.user.name}
                            />
                            <AvatarFallback>
                                {post.user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold">
                                            {post.user.name}
                                        </span>
                                        {post.user.is_verified && (
                                            <svg
                                                className="h-4 w-4 text-blue-500"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6 11.66l1.4-1.46 3.14 3.14 6.95-6.95L19 8.06l-8.46 8.14z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        @{post.user.username}
                                    </div>
                                </div>

                                {post.user_id === auth.user.id && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleDeleteClick(post.id)
                                                }
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 text-[15px] leading-normal break-words whitespace-pre-wrap">
                        {post.content}
                    </div>

                    <PostMediaGrid media={post.media} />

                    <div className="mt-3 text-sm text-muted-foreground">
                        {formatFullDate(post.created_at)}
                    </div>

                    <Separator className="my-3" />

                    <PostActions
                        replies={post.replies?.length || 0}
                        likes={post.likes_count || 0}
                        reposts={post.reposts_count || 0}
                        views={0}
                        isLiked={post.is_liked || false}
                        isReposted={post.is_reposted || false}
                        isBookmarked={post.is_bookmarked || false}
                        onLike={handleLike}
                        onRepost={handleRepost}
                        onReply={handleReplyClick}
                        onBookmark={handleBookmark}
                        onShare={() => {}}
                    />

                    <Separator className="my-3" />
                </div>

                {/* Replies */}
                <div className="divide-y divide-border">
                    {post.replies && post.replies.length > 0 ? (
                        post.replies.map((reply) => (
                            <Post
                                key={reply.id}
                                user={{
                                    ...reply.user,
                                    verified: reply.user.is_verified,
                                }}
                                content={reply.content}
                                media={reply.media}
                                timestamp={formatTimestamp(reply.created_at)}
                                likes={reply.likes_count || 0}
                                replies={0}
                                reposts={0}
                                views={0}
                                isLiked={reply.is_liked || false}
                                isReposted={false}
                                isBookmarked={false}
                                onLike={() => {}}
                                onRepost={() => {}}
                                onReply={() => {}}
                                onBookmark={() => {}}
                                onShare={() => {}}
                                isFollowing={false}
                                onDelete={
                                    reply.user_id === auth.user.id
                                        ? () => handleDeleteClick(reply.id)
                                        : undefined
                                }
                            />
                        ))
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            <p className="text-sm">No replies yet</p>
                            <p className="mt-1 text-xs">
                                Be the first to reply!
                            </p>
                        </div>
                    )}
                </div>

                <ConfirmDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) =>
                        setDeleteDialog({ open, postId: null })
                    }
                    onConfirm={handleDeleteConfirm}
                    title="Delete post?"
                    description="This action cannot be undone. Your post will be permanently deleted."
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="destructive"
                />

                <ReplyDialog
                    open={replyDialogOpen}
                    onOpenChange={setReplyDialogOpen}
                    post={{
                        id: post.id,
                        content: post.content,
                        user: post.user,
                    }}
                    currentUser={auth.user}
                />
            </div>
        </AppLayout>
    );
}
