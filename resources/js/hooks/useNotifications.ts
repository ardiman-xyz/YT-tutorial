import { router } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface NotificationData {
    post_id: number;
    liker_name: string;
    liker_username: string;
    liker_avatar?: string;
    post_content: string;
    timestamp: string;
}

export function useNotifications(userId: number) {
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch initial unread count
    useEffect(() => {
        axios
            .get('/notifications/unread-count')
            .then((res) => setUnreadCount(res.data.count))
            .catch((err) =>
                console.error('Failed to fetch unread count:', err),
            );
    }, []);

    // Listen to real-time notifications
    useEcho(`user.${userId}`, '.PostLiked', (data: NotificationData) => {
        console.log('PostLiked event received:', data);

        // Increment unread count
        setUnreadCount((prev) => prev + 1);

        // Show toast notification
        toast.success(`${data.liker_name} liked your post`, {
            description: data.post_content,
            action: {
                label: 'View',
                onClick: () => router.visit(`/status/${data.post_id}`),
            },
        });
    });

    const clearUnreadCount = () => {
        setUnreadCount(0);
    };

    return { unreadCount, clearUnreadCount };
}
