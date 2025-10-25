import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import type { Post as PostType, User } from '@/types/post';
import { Head, router, usePage } from '@inertiajs/react';
import { Bookmark, MoreHorizontal, Trash2 } from 'lucide-react';
import { Post } from '../_components/Post';

interface BookmarksData {
    bookmarks: PostType[];
}

export default function Bookmarks() {
    const { auth, bookmarks } = usePage<any>().props as {
        auth: { user: User };
        bookmarks: PostType[];
    };

    const handleClearAll = () => {
        if (confirm('Are you sure you want to clear all bookmarks?')) {
            // TODO: Implement clear all bookmarks
            console.log('Clear all bookmarks');
        }
    };

    const handleLike = (postId: number) => {
        router.post(
            `/posts/${postId}/like`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handleRepost = (postId: number) => {
        router.post(
            `/posts/${postId}/repost`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handleBookmark = (postId: number) => {
        router.post(
            `/posts/${postId}/bookmark`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    // Refresh bookmarks
                    router.reload({ only: ['bookmarks'] });
                },
            },
        );
    };

    const handleReply = (postId: number) => {
        router.visit(`/status/${postId}`);
    };

    const handleShare = (postId: number) => {
        // Copy link to clipboard
        const url = `${window.location.origin}/status/${postId}`;
        navigator.clipboard.writeText(url);
        // TODO: Show toast notification
    };

    return (
        <AppLayout>
            <Head title="Bookmarks" />

            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center justify-between p-4">
                        <div>
                            <h1 className="text-xl font-bold">Bookmarks</h1>
                            <p className="text-sm text-muted-foreground">
                                @{auth.user.username}
                            </p>
                        </div>

                        {bookmarks.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9"
                                    >
                                        <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={handleClearAll}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Clear all bookmarks
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                {/* Bookmarks List */}
                <div>
                    {bookmarks.length > 0 ? (
                        <div className="divide-y">
                            {bookmarks.map((post) => (
                                <div
                                    key={post.id}
                                    onClick={() =>
                                        router.visit(`/status/${post.id}`)
                                    }
                                    className="cursor-pointer"
                                >
                                    <Post
                                        user={{
                                            ...post.user,
                                            verified: post.user.is_verified,
                                        }}
                                        content={post.content}
                                        media={post.media}
                                        timestamp={post.created_at}
                                        likes={post.likes_count || 0}
                                        replies={post.replies_count || 0}
                                        reposts={post.reposts_count || 0}
                                        views={0}
                                        isLiked={post.is_liked || false}
                                        isReposted={post.is_reposted || false}
                                        isBookmarked={
                                            post.is_bookmarked || false
                                        }
                                        onLike={() => handleLike(post.id)}
                                        onRepost={() => handleRepost(post.id)}
                                        onReply={() => handleReply(post.id)}
                                        onBookmark={() =>
                                            handleBookmark(post.id)
                                        }
                                        onShare={() => handleShare(post.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center p-8 text-center"
                            style={{ minHeight: 'calc(100vh - 200px)' }}
                        >
                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                <Bookmark className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h2 className="mb-2 text-2xl font-bold">
                                Save posts for later
                            </h2>
                            <p className="max-w-sm text-muted-foreground">
                                Bookmark posts to easily find them again in the
                                future.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
