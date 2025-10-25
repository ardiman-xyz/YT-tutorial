import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { User } from '@/types/post';
import { Head, router, usePage } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';

import {
    AddTeamIcon,
    FavouriteIcon,
    MessageDone02Icon,
    MessageNotification01Icon,
    RepeatOne02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { CheckCheck, Heart, Settings } from 'lucide-react';

interface Notification {
    id: number;
    type: 'like' | 'reply' | 'repost' | 'follow' | 'mention';
    user: {
        id: number;
        name: string;
        username: string;
        avatar?: string;
        is_verified: boolean;
    };
    post?: {
        id: number;
        content: string;
        preview?: string;
    };
    created_at: string;
    read_at: string | null;
}

interface NotificationsData {
    all: Notification[];
    verified: Notification[];
    mentions: Notification[];
}

export default function Notifications() {
    const { auth, notifications } = usePage<any>().props as {
        auth: { user: User };
        notifications: NotificationsData;
    };

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read and navigate
        if (notification.type === 'follow') {
            router.visit(`/profile/${notification.user.id}`);
        } else if (notification.post) {
            router.visit(`/status/${notification.post.id}`);
        }
    };

    const handleMarkAllRead = () => {
        // TODO: Implement mark all as read
        console.log('Mark all as read');
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'like':
                return (
                    <HugeiconsIcon
                        icon={FavouriteIcon}
                        size={24}
                        color="currentColor"
                        className="fill-pink-500 text-pink-500"
                    />
                );
            case 'reply':
                return (
                    <HugeiconsIcon
                        icon={MessageNotification01Icon}
                        size={24}
                        color="currentColor"
                        className="text-blue-500"
                    />
                );
            case 'repost':
                return (
                    <HugeiconsIcon
                        icon={RepeatOne02Icon}
                        size={24}
                        color="currentColor"
                        className="text-green-500"
                    />
                );
            case 'follow':
                return (
                    <HugeiconsIcon
                        icon={AddTeamIcon}
                        size={24}
                        color="currentColor"
                        className="text-blue-500"
                    />
                );
            case 'mention':
                return (
                    <HugeiconsIcon
                        icon={MessageDone02Icon}
                        size={24}
                        color="currentColor"
                        className="text-blue-500"
                    />
                );
            default:
                return null;
        }
    };

    const getNotificationText = (notification: Notification) => {
        const userName = notification.user.name;

        switch (notification.type) {
            case 'like':
                return `${userName} liked your post`;
            case 'reply':
                return `${userName} replied to your post`;
            case 'repost':
                return `${userName} reposted your post`;
            case 'follow':
                return `${userName} started following you`;
            case 'mention':
                return `${userName} mentioned you`;
            default:
                return '';
        }
    };

    const NotificationItem = ({
        notification,
    }: {
        notification: Notification;
    }) => {
        const isUnread = !notification.read_at;

        return (
            <div
                onClick={() => handleNotificationClick(notification)}
                className={`flex cursor-pointer gap-3 border-b p-4 transition-colors hover:bg-muted/50 ${
                    isUnread ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''
                }`}
            >
                {/* Icon */}
                <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    {/* User Info */}
                    <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage
                                    src={notification.user.avatar}
                                    alt={notification.user.name}
                                />
                                <AvatarFallback>
                                    {notification.user.name
                                        .substring(0, 2)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold hover:underline">
                                        {notification.user.name}
                                    </span>
                                    {notification.user.is_verified && (
                                        <svg
                                            className="h-4 w-4 flex-shrink-0 text-blue-500"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                        >
                                            <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6 11.66l1.4-1.46 3.14 3.14 6.95-6.95L19 8.06l-8.46 8.14z" />
                                        </svg>
                                    )}
                                </div>
                                <p className="text-sm">
                                    {getNotificationText(notification)}
                                </p>
                            </div>
                        </div>

                        {/* Timestamp */}
                        <span className="flex-shrink-0 text-xs text-muted-foreground">
                            {formatDistanceToNow(
                                new Date(notification.created_at),
                                {
                                    addSuffix: true,
                                },
                            )}
                        </span>
                    </div>

                    {/* Post Preview (if applicable) */}
                    {notification.post && (
                        <div className="mt-2 rounded-lg border bg-muted/30 p-3">
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                {notification.post.content}
                            </p>
                        </div>
                    )}

                    {/* Follow Button (for follow notifications) */}
                    {notification.type === 'follow' && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 rounded-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Follow back
                            }}
                        >
                            Follow back
                        </Button>
                    )}

                    {/* Unread indicator */}
                    {isUnread && (
                        <div className="absolute top-1/2 right-4 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-500" />
                    )}
                </div>
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title="Notifications" />

            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center justify-between p-4">
                        <h1 className="text-xl font-bold">Notifications</h1>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleMarkAllRead}
                                className="h-9 w-9"
                            >
                                <CheckCheck className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                    router.visit('/settings/notifications')
                                }
                                className="h-9 w-9"
                            >
                                <Settings className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="h-auto w-full justify-start rounded-none border-b-0 bg-transparent p-0">
                            <TabsTrigger
                                value="all"
                                className="flex-1 rounded-none border-b-2 border-transparent px-4 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                All
                            </TabsTrigger>
                            <TabsTrigger
                                value="verified"
                                className="flex-1 rounded-none border-b-2 border-transparent px-4 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Verified
                            </TabsTrigger>
                            <TabsTrigger
                                value="mentions"
                                className="flex-1 rounded-none border-b-2 border-transparent px-4 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                Mentions
                            </TabsTrigger>
                        </TabsList>

                        {/* All Tab */}
                        <TabsContent value="all" className="mt-0">
                            {notifications.all.length > 0 ? (
                                <div>
                                    {notifications.all.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="mb-2 flex justify-center">
                                        <div className="rounded-full bg-muted p-4">
                                            <Heart className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <p className="text-lg font-semibold">
                                        No notifications yet
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        When someone likes, replies, or follows
                                        you, you'll see it here
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        {/* Verified Tab */}
                        <TabsContent value="verified" className="mt-0">
                            {notifications.verified.length > 0 ? (
                                <div>
                                    {notifications.verified.map(
                                        (notification) => (
                                            <NotificationItem
                                                key={notification.id}
                                                notification={notification}
                                            />
                                        ),
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-lg font-semibold">
                                        No notifications from verified accounts
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Notifications from verified accounts
                                        will appear here
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        {/* Mentions Tab */}
                        <TabsContent value="mentions" className="mt-0">
                            {notifications.mentions.length > 0 ? (
                                <div>
                                    {notifications.mentions.map(
                                        (notification) => (
                                            <NotificationItem
                                                key={notification.id}
                                                notification={notification}
                                            />
                                        ),
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-lg font-semibold">
                                        No mentions yet
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        When someone mentions you, you'll see it
                                        here
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
