import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { Post as PostType, User } from '@/types/post';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';
import { Post } from './_components/Post';
import { PostEditor } from './_components/PostEditor';
import { ReplyDialog } from './_components/ReplyDialog';

export default function Dashboard() {
    const { posts: initialPosts, auth } = usePage<any>().props as {
        posts: PostType[];
        auth: { user: User };
    };

    const [posts, setPosts] = useState<PostType[]>(initialPosts);

    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        postId: number | null;
    }>({
        open: false,
        postId: null,
    });

    const [replyDialog, setReplyDialog] = useState<{
        open: boolean;
        post: PostType | null;
    }>({
        open: false,
        post: null,
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

    const handlePostCreated = () => {
        router.reload({ only: ['posts'] });
    };

    const handleDeleteClick = (postId: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setDeleteDialog({ open: true, postId });
    };

    const handleDeleteConfirm = () => {
        if (deleteDialog.postId) {
            // Optimistic update - remove from UI immediately
            setPosts((prevPosts) =>
                prevPosts.filter((post) => post.id !== deleteDialog.postId),
            );
            setDeleteDialog({ open: false, postId: null });

            // Send delete request
            router.delete(`/posts/${deleteDialog.postId}`, {
                preserveScroll: true,
                onError: () => {
                    // If error, reload to restore correct state
                    router.reload({ only: ['posts'] });
                },
            });
        }
    };

    const handlePostClick = (post: PostType) => {
        router.visit(`/status/${post.id}`);
    };

    const handleLike = async (postId: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        try {
            const response = await axios.post(`/posts/${postId}/like`);

            // Update local state
            setPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            is_liked: response.data.isLiked,
                            likes_count: response.data.likesCount,
                        };
                    }
                    return post;
                }),
            );
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleFollow = async (userId: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        try {
            const response = await axios.post(`/users/${userId}/follow`);

            // Update local state
            setPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post.user.id === userId) {
                        return {
                            ...post,
                            is_following: response.data.isFollowing,
                        };
                    }
                    return post;
                }),
            );
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    const handleRepost = async (postId: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        try {
            const response = await axios.post(`/posts/${postId}/repost`);

            // Update local state
            setPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            is_reposted: response.data.isReposted,
                            reposts_count: response.data.repostsCount,
                        };
                    }
                    return post;
                }),
            );
        } catch (error) {
            console.error('Error toggling repost:', error);
        }
    };

    const handleBookmark = async (postId: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        try {
            const response = await axios.post(`/posts/${postId}/bookmark`);

            // Update local state
            setPosts((prevPosts) =>
                prevPosts.map((post) => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            is_bookmarked: response.data.isBookmarked,
                        };
                    }
                    return post;
                }),
            );

            toast.success(
                response.data.isBookmarked
                    ? 'Post bookmarked'
                    : 'Bookmark removed',
            );
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };

    const handleReplyClick = (post: PostType, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setReplyDialog({ open: true, post });
    };

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="mx-auto max-w-2xl">
                <PostEditor
                    user={auth.user}
                    onPostCreated={handlePostCreated}
                />

                {posts.length > 0 && (
                    <div className="border-b py-3 text-center">
                        <Button variant="link" className="text-primary">
                            Show {posts.length} posts
                        </Button>
                    </div>
                )}

                <div className="divide-y divide-border">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            onClick={() => handlePostClick(post)}
                            className="cursor-pointer"
                        >
                            <Post
                                user={{
                                    ...post.user,
                                    verified: post.user.is_verified,
                                }}
                                content={post.content}
                                media={post.media}
                                timestamp={formatTimestamp(post.created_at)}
                                likes={post.likes_count || 0}
                                replies={post.replies_count || 0}
                                reposts={post.reposts_count || 0}
                                views={0}
                                isLiked={post.is_liked || false}
                                bookmarks={post.bookmarks_count || 0}
                                isReposted={post.is_reposted || false}
                                isBookmarked={post.is_bookmarked || false}
                                onLike={(e) => handleLike(post.id, e)}
                                onRepost={(e) => handleRepost(post.id, e)}
                                onReply={(e) => handleReplyClick(post, e)}
                                onBookmark={(e) => handleBookmark(post.id, e)}
                                onShare={() => {}}
                                isFollowing={post.is_following || false}
                                onFollow={(e) => handleFollow(post.user.id, e)}
                                onDelete={
                                    post.user_id === auth.user.id
                                        ? () => handleDeleteClick(post.id)
                                        : undefined
                                }
                            />
                        </div>
                    ))}
                </div>

                {posts.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                        <p className="text-lg font-semibold">No posts yet</p>
                        <p className="mt-1 text-sm">
                            Start following people or create your first post!
                        </p>
                    </div>
                )}

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

                {replyDialog.post && (
                    <ReplyDialog
                        open={replyDialog.open}
                        onOpenChange={(open) =>
                            setReplyDialog({ open, post: null })
                        }
                        post={{
                            id: replyDialog.post.id,
                            content: replyDialog.post.content,
                            user: replyDialog.post.user,
                        }}
                        currentUser={auth.user}
                    />
                )}
            </div>
        </AppLayout>
    );
}
