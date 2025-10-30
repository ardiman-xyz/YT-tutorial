import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { NotificationsData } from '../types';
import { NotificationEmpty } from './NotificationEmpty';
import { NotificationItem } from './NotificationItem';

export function NotificationTabs({
    notifications,
    onRead,
}: {
    notifications: NotificationsData;
    onRead: (id: number) => void;
}) {
    return (
        <Tabs defaultValue="all" className="w-full">
            <TabsList className="h-auto w-full justify-start rounded-none border-b-0 bg-transparent p-0">
                <TabsTrigger
                    value="all"
                    className="flex-1 border-b-2 px-4 py-4 data-[state=active]:border-primary"
                >
                    All
                </TabsTrigger>
                <TabsTrigger
                    value="verified"
                    className="flex-1 border-b-2 px-4 py-4 data-[state=active]:border-primary"
                >
                    Verified
                </TabsTrigger>
                <TabsTrigger
                    value="mentions"
                    className="flex-1 border-b-2 px-4 py-4 data-[state=active]:border-primary"
                >
                    Mentions
                </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
                {notifications.all.length > 0 ? (
                    notifications.all.map((n) => (
                        <NotificationItem
                            key={n.id}
                            notification={n}
                            onRead={onRead}
                        />
                    ))
                ) : (
                    <NotificationEmpty
                        title="No notifications yet"
                        description="When someone likes, replies, or follows you, you'll see it here"
                    />
                )}
            </TabsContent>

            <TabsContent value="verified">
                {notifications.verified.length > 0 ? (
                    notifications.verified.map((n) => (
                        <NotificationItem
                            key={n.id}
                            notification={n}
                            onRead={onRead}
                        />
                    ))
                ) : (
                    <NotificationEmpty
                        title="No notifications from verified accounts"
                        description="Notifications from verified accounts will appear here"
                    />
                )}
            </TabsContent>

            <TabsContent value="mentions">
                {notifications.mentions.length > 0 ? (
                    notifications.mentions.map((n) => (
                        <NotificationItem
                            key={n.id}
                            notification={n}
                            onRead={onRead}
                        />
                    ))
                ) : (
                    <NotificationEmpty
                        title="No mentions yet"
                        description="When someone mentions you, you'll see it here"
                    />
                )}
            </TabsContent>
        </Tabs>
    );
}
