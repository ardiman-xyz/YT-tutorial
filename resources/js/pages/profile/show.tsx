import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { Post as PostType, User } from '@/types/post';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, Calendar, Link as LinkIcon, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Post } from '../_components/Post';
import { ReplyDialog } from '../_components/ReplyDialog';

interface Profile {
    id: number;
    name: string;
    username: string;
    bio?: string;
    location?: string;
    website?: string;
    avatar?: string;
    header?: string;
    is_verified: boolean;
    created_at: string;
    stats: {
        posts_count: number;
        followers_count: number;
        following_count: number;
        likes_count: number;
    };
    is_following: boolean;
    is_own_profile: boolean;
}

export default function ProfileShow() {
    const {
        profile: initialProfile,
        posts: initialPosts,
        auth,
    } = usePage<any>().props as {
        profile: Profile;
        posts: PostType[];
        auth: { user: User };
    };

    const [profile, setProfile] = useState(initialProfile);
    const [posts, setPosts] = useState(initialPosts);
    const [replyDialog, setReplyDialog] = useState<{
        open: boolean;
        post: PostType | null;
    }>({
        open: false,
        post: null,
    });

    const formatJoinDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    };

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

    const handleFollow = async () => {
        try {
            await axios.post(`/users/${profile.id}/follow`);

            setProfile((prev) => ({
                ...prev,
                is_following: !prev.is_following,
                stats: {
                    ...prev.stats,
                    followers_count: prev.is_following
                        ? prev.stats.followers_count - 1
                        : prev.stats.followers_count + 1,
                },
            }));
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    const handleLike = async (postId: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        try {
            const response = await axios.post(`/posts/${postId}/like`);

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

    const handleRepost = async (postId: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        try {
            const response = await axios.post(`/posts/${postId}/repost`);

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
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };

    const handleReplyClick = (post: PostType, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setReplyDialog({ open: true, post });
    };

    const handlePostClick = (post: PostType) => {
        router.visit(`/status/${post.id}`);
    };

    return (
        <AppLayout>
            <Head title={`${profile.name} (@${profile.username})`} />

            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.visit('/dashboard')}
                        className="h-9 w-9 rounded-full"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">{profile.name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {profile.stats.posts_count} posts
                        </p>
                    </div>
                </div>

                {/* Profile Header */}
                <div>
                    {/* Header Image */}
                    {profile.header && (
                        <div className="h-48 w-full bg-muted">
                            <img
                                src={profile.header}
                                alt="Profile header"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}
                    {!profile.header && (
                        <div className="h-48 w-full bg-gradient-to-r from-blue-500 to-purple-500" />
                    )}

                    <div className="px-4">
                        {/* Avatar & Edit Button */}
                        <div className="-mt-16 mb-3 flex items-end justify-between">
                            <Avatar className="h-32 w-32 border-4 border-background">
                                <AvatarImage
                                    src={profile.avatar}
                                    alt={profile.name}
                                />
                                <AvatarFallback className="text-3xl">
                                    {profile.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {profile.is_own_profile ? (
                                <Link href="/profile/edit">
                                    <Button
                                        variant="outline"
                                        className="rounded-full font-semibold"
                                    >
                                        Edit profile
                                    </Button>
                                </Link>
                            ) : (
                                <Button
                                    onClick={handleFollow}
                                    variant={
                                        profile.is_following
                                            ? 'outline'
                                            : 'default'
                                    }
                                    className="rounded-full font-semibold"
                                >
                                    {profile.is_following
                                        ? 'Following'
                                        : 'Follow'}
                                </Button>
                            )}
                        </div>

                        {/* Name & Username */}
                        <div className="mb-3">
                            <div className="flex items-center gap-1">
                                <h2 className="text-xl font-bold">
                                    {profile.name}
                                </h2>
                                {profile.is_verified && (
                                    <svg
                                        className="h-5 w-5 text-blue-500"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6 11.66l1.4-1.46 3.14 3.14 6.95-6.95L19 8.06l-8.46 8.14z" />
                                    </svg>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                @{profile.username}
                            </p>
                        </div>

                        {/* Bio */}
                        {profile.bio && (
                            <p className="mb-3 whitespace-pre-wrap">
                                {profile.bio}
                            </p>
                        )}

                        {/* Meta Info */}
                        <div className="mb-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                            {profile.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{profile.location}</span>
                                </div>
                            )}
                            {profile.website && (
                                <a
                                    href={profile.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-primary hover:underline"
                                >
                                    <LinkIcon className="h-4 w-4" />
                                    <span>
                                        {profile.website.replace(
                                            /^https?:\/\//,
                                            '',
                                        )}
                                    </span>
                                </a>
                            )}
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    Joined {formatJoinDate(profile.created_at)}
                                </span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="mb-4 flex gap-4 text-sm">
                            <Link
                                href={`/profile/${profile.id}/following`}
                                className="hover:underline"
                            >
                                <span className="font-bold">
                                    {profile.stats.following_count}
                                </span>
                                <span className="ml-1 text-muted-foreground">
                                    Following
                                </span>
                            </Link>
                            <Link
                                href={`/profile/${profile.id}/followers`}
                                className="hover:underline"
                            >
                                <span className="font-bold">
                                    {profile.stats.followers_count}
                                </span>
                                <span className="ml-1 text-muted-foreground">
                                    Followers
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
                        <TabsTrigger
                            value="posts"
                            className="flex-1 rounded-none border-b-2 border-transparent px-4 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            Posts
                        </TabsTrigger>
                        <TabsTrigger
                            value="likes"
                            onClick={() =>
                                router.visit(`/profile/${profile.id}/likes`)
                            }
                            className="flex-1 rounded-none border-b-2 border-transparent px-4 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            Likes
                        </TabsTrigger>
                        <TabsTrigger
                            value="media"
                            onClick={() =>
                                router.visit(`/profile/${profile.id}/media`)
                            }
                            className="flex-1 rounded-none border-b-2 border-transparent px-4 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            Media
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts" className="mt-0">
                        <div className="divide-y divide-border">
                            {posts.length > 0 ? (
                                posts.map((post) => (
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
                                            timestamp={formatTimestamp(
                                                post.created_at,
                                            )}
                                            likes={post.likes_count || 0}
                                            replies={post.replies_count || 0}
                                            reposts={post.reposts_count || 0}
                                            views={0}
                                            isLiked={post.is_liked || false}
                                            isReposted={
                                                post.is_reposted || false
                                            }
                                            isBookmarked={
                                                post.is_bookmarked || false
                                            }
                                            onLike={(e) =>
                                                handleLike(post.id, e)
                                            }
                                            onRepost={(e) =>
                                                handleRepost(post.id, e)
                                            }
                                            onReply={(e) =>
                                                handleReplyClick(post, e)
                                            }
                                            onBookmark={(e) =>
                                                handleBookmark(post.id, e)
                                            }
                                            onShare={() => {}}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    <p className="text-lg font-semibold">
                                        No posts yet
                                    </p>
                                    <p className="mt-1 text-sm">
                                        {profile.is_own_profile
                                            ? 'Start posting to build your timeline!'
                                            : `@${profile.username} hasn't posted yet.`}
                                    </p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

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
