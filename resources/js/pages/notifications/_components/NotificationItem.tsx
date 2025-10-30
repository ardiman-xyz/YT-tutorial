import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    AddTeamIcon,
    FavouriteIcon,
    MessageDone02Icon,
    MessageNotification01Icon,
    RepeatOne02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '../types';

export function NotificationItem({
    notification,
    onRead,
}: {
    notification: Notification;
    onRead: (id: number) => void;
}) {
    const isUnread = !notification.read_at;

    const getIcon = () => {
        const base = { size: 24, color: 'currentColor' };
        switch (notification.type) {
            case 'like':
                return (
                    <HugeiconsIcon
                        icon={FavouriteIcon}
                        {...base}
                        className="fill-pink-500 text-pink-500"
                    />
                );
            case 'reply':
                return (
                    <HugeiconsIcon
                        icon={MessageNotification01Icon}
                        {...base}
                        className="text-blue-500"
                    />
                );
            case 'repost':
                return (
                    <HugeiconsIcon
                        icon={RepeatOne02Icon}
                        {...base}
                        className="text-green-500"
                    />
                );
            case 'follow':
                return (
                    <HugeiconsIcon
                        icon={AddTeamIcon}
                        {...base}
                        className="text-blue-500"
                    />
                );
            case 'mention':
                return (
                    <HugeiconsIcon
                        icon={MessageDone02Icon}
                        {...base}
                        className="text-blue-500"
                    />
                );
        }
    };

    const getText = () => {
        const name = notification.actor.name;
        switch (notification.type) {
            case 'like':
                return `${name} liked your post`;
            case 'reply':
                return `${name} replied to your post`;
            case 'repost':
                return `${name} reposted your post`;
            case 'follow':
                return `${name} started following you`;
            case 'mention':
                return `${name} mentioned you`;
            default:
                return '';
        }
    };

    const handleClick = async () => {
        await onRead(notification.id);

        if (notification.type === 'follow')
            router.visit(`/profile/${notification.actor.id}`);
        else if (notification.post)
            router.visit(`/status/${notification.post.id}`);
    };

    return (
        <div
            onClick={handleClick}
            className={`flex cursor-pointer gap-3 border-b p-4 transition-colors hover:bg-muted/50 ${
                isUnread ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''
            }`}
        >
            <div className="flex-shrink-0">{getIcon()}</div>

            <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={notification.actor.avatar}
                                alt={notification.actor.name}
                            />
                            <AvatarFallback>
                                {notification.actor.name
                                    .substring(0, 2)
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                            <p className="font-bold hover:underline">
                                {notification.actor.name}
                            </p>
                            <p className="text-sm">{getText()}</p>
                        </div>
                    </div>

                    <span className="flex-shrink-0 text-xs text-muted-foreground">
                        {formatDistanceToNow(
                            new Date(notification.created_at),
                            { addSuffix: true },
                        )}
                    </span>
                </div>

                {notification.post && (
                    <div className="mt-2 rounded-lg border bg-muted/30 p-3">
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                            {notification.post.content}
                        </p>
                    </div>
                )}

                {notification.type === 'follow' && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 rounded-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Follow back
                    </Button>
                )}
            </div>
        </div>
    );
}
