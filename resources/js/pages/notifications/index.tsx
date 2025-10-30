import { useRealtimeNotif } from '@/hooks/useRealtimeNotif';
import AppLayout from '@/layouts/app-layout';
import type { User } from '@/types/post';
import { Head, usePage } from '@inertiajs/react';
import { NotificationHeader } from './_components/NotificationHeader';
import { NotificationTabs } from './_components/NotificationTabs';
import type { NotificationsData } from './types';

export default function Notifications() {
    const { auth, notifications: initialNotifications } = usePage<any>()
        .props as {
        auth: { user: User };
        notifications: NotificationsData;
    };

    const { notifications, markAllRead, markAsRead } = useRealtimeNotif(
        auth.user.id,
        initialNotifications,
    );

    return (
        <AppLayout>
            <Head title="Notifications" />
            <div className="mx-auto max-w-2xl">
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <NotificationHeader onMarkAllRead={markAllRead} />
                    <NotificationTabs
                        notifications={notifications}
                        onRead={markAsRead}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
