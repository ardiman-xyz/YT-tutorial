import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { Post as PostType, User } from '@/types/post';
import { Head, router, usePage } from '@inertiajs/react';
import { Hash, Search, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { Post } from '../_components/Post';

interface TrendingTopic {
    id: number;
    name: string;
    category: string;
    posts_count: number;
}

interface SuggestedUser {
    id: number;
    name: string;
    username: string;
    avatar?: string;
    bio?: string;
    is_verified: boolean;
    followers_count: number;
    is_following: boolean;
}

interface ExploreData {
    trending: TrendingTopic[];
    suggested_users: SuggestedUser[];
    popular_posts: PostType[];
    recent_posts: PostType[];
}

export default function Explore() {
    const { auth, explore } = usePage<any>().props as {
        auth: { user: User };
        explore: ExploreData;
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('for-you');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.visit(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleHashtagClick = (hashtag: string) => {
        router.visit(`/hashtag/${encodeURIComponent(hashtag)}`);
    };

    const handleUserClick = (username: string) => {
        router.visit(`/profile/${username}`);
    };

    const handleFollow = (userId: number) => {
        // TODO: Implement follow
        console.log('Follow user:', userId);
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <AppLayout>
            <Head title="Explore" />

            <div className="mx-auto max-w-2xl">
                {/* Header with Search */}
                <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="p-4">
                        <h1 className="mb-4 text-xl font-bold">Explore</h1>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search for people, posts, or hashtags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pr-4 pl-10"
                            />
                        </form>
                    </div>

                    {/* Tabs */}
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="h-auto w-full justify-start rounded-none border-b-0 bg-transparent p-0">
                            <TabsTrigger
                                value="for-you"
                                className="flex-1 rounded-none border-b-2 border-transparent px-4 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                For You
                            </TabsTrigger>
                            <TabsTrigger
                                value="trending"
                                className="flex-1 rounded-none border-b-2 border-transparent px-4 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Trending
                            </TabsTrigger>
                            <TabsTrigger
                                value="people"
                                className="flex-1 rounded-none border-b-2 border-transparent px-4 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                <Users className="mr-2 h-4 w-4" />
                                People
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Content */}
                <Tabs value={activeTab} className="w-full">
                    {/* For You Tab */}
                    <TabsContent value="for-you" className="mt-0">
                        {/* Trending Section */}
                        <div className="border-b p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="text-lg font-bold">
                                    Trending now
                                </h2>
                                <Button variant="ghost" size="sm">
                                    See all
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {explore.trending.slice(0, 3).map((topic) => (
                                    <button
                                        key={topic.id}
                                        onClick={() =>
                                            handleHashtagClick(topic.name)
                                        }
                                        className="w-full rounded-lg p-3 text-left transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-xs text-muted-foreground">
                                                    {topic.category} · Trending
                                                </p>
                                                <p className="font-bold">
                                                    #{topic.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatNumber(
                                                        topic.posts_count,
                                                    )}{' '}
                                                    posts
                                                </p>
                                            </div>
                                            <Hash className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Suggested Users */}
                        <div className="border-b p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="text-lg font-bold">
                                    Who to follow
                                </h2>
                                <Button variant="ghost" size="sm">
                                    See all
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {explore.suggested_users
                                    .slice(0, 3)
                                    .map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-start justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex flex-1 gap-3">
                                                <Avatar
                                                    className="h-12 w-12 cursor-pointer"
                                                    onClick={() =>
                                                        handleUserClick(
                                                            user.username,
                                                        )
                                                    }
                                                >
                                                    <AvatarImage
                                                        src={user.avatar}
                                                        alt={user.name}
                                                    />
                                                    <AvatarFallback>
                                                        {user.name
                                                            .substring(0, 2)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1">
                                                        <span
                                                            className="cursor-pointer truncate font-bold hover:underline"
                                                            onClick={() =>
                                                                handleUserClick(
                                                                    user.username,
                                                                )
                                                            }
                                                        >
                                                            {user.name}
                                                        </span>
                                                        {user.is_verified && (
                                                            <svg
                                                                className="h-4 w-4 flex-shrink-0 text-blue-500"
                                                                viewBox="0 0 24 24"
                                                                fill="currentColor"
                                                            >
                                                                <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6 11.66l1.4-1.46 3.14 3.14 6.95-6.95L19 8.06l-8.46 8.14z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <p className="truncate text-sm text-muted-foreground">
                                                        @{user.username}
                                                    </p>
                                                    {user.bio && (
                                                        <p className="mt-1 line-clamp-2 text-sm">
                                                            {user.bio}
                                                        </p>
                                                    )}
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {formatNumber(
                                                            user.followers_count,
                                                        )}{' '}
                                                        followers
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() =>
                                                    handleFollow(user.id)
                                                }
                                                variant={
                                                    user.is_following
                                                        ? 'outline'
                                                        : 'default'
                                                }
                                                size="sm"
                                                className="rounded-full"
                                            >
                                                {user.is_following
                                                    ? 'Following'
                                                    : 'Follow'}
                                            </Button>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Popular Posts */}
                        <div className="divide-y">
                            {explore.popular_posts.length > 0 ? (
                                explore.popular_posts.map((post) => (
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
                                            isReposted={
                                                post.is_reposted || false
                                            }
                                            isBookmarked={
                                                post.is_bookmarked || false
                                            }
                                            onLike={() => {}}
                                            onRepost={() => {}}
                                            onReply={() => {}}
                                            onBookmark={() => {}}
                                            onShare={() => {}}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    <p>No posts to show yet</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Trending Tab */}
                    <TabsContent value="trending" className="mt-0">
                        <div className="divide-y">
                            {explore.trending.map((topic, index) => (
                                <button
                                    key={topic.id}
                                    onClick={() =>
                                        handleHashtagClick(topic.name)
                                    }
                                    className="w-full p-4 text-left transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                                <span className="text-sm font-bold text-muted-foreground">
                                                    {index + 1}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {topic.category} · Trending
                                                </span>
                                            </div>
                                            <p className="text-lg font-bold">
                                                #{topic.name}
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {formatNumber(
                                                    topic.posts_count,
                                                )}{' '}
                                                posts
                                            </p>
                                        </div>
                                        <Hash className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </TabsContent>

                    {/* People Tab */}
                    <TabsContent value="people" className="mt-0">
                        <div className="divide-y">
                            {explore.suggested_users.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-start justify-between p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex flex-1 gap-3">
                                        <Avatar
                                            className="h-12 w-12 cursor-pointer"
                                            onClick={() =>
                                                handleUserClick(user.username)
                                            }
                                        >
                                            <AvatarImage
                                                src={user.avatar}
                                                alt={user.name}
                                            />
                                            <AvatarFallback>
                                                {user.name
                                                    .substring(0, 2)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1">
                                                <span
                                                    className="cursor-pointer font-bold hover:underline"
                                                    onClick={() =>
                                                        handleUserClick(
                                                            user.username,
                                                        )
                                                    }
                                                >
                                                    {user.name}
                                                </span>
                                                {user.is_verified && (
                                                    <svg
                                                        className="h-4 w-4 text-blue-500"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                    >
                                                        <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6 11.66l1.4-1.46 3.14 3.14 6.95-6.95L19 8.06l-8.46 8.14z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                @{user.username}
                                            </p>
                                            {user.bio && (
                                                <p className="mt-2 line-clamp-2 text-sm">
                                                    {user.bio}
                                                </p>
                                            )}
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                {formatNumber(
                                                    user.followers_count,
                                                )}{' '}
                                                followers
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleFollow(user.id)}
                                        variant={
                                            user.is_following
                                                ? 'outline'
                                                : 'default'
                                        }
                                        size="sm"
                                        className="rounded-full"
                                    >
                                        {user.is_following
                                            ? 'Following'
                                            : 'Follow'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
