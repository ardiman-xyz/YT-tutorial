import { useEcho } from '@laravel/echo-react';
import axios from 'axios';
import { useEffect, useState } from 'react';

export interface Notification {
    id: number;
    type: 'like' | 'reply' | 'repost' | 'follow' | 'mention';
    actor: {
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

export interface NotificationsData {
    all: Notification[];
    verified: Notification[];
    mentions: Notification[];
}

export function useRealtimeNotif(userId: number, initial: NotificationsData) {
    const [notifications, setNotifications] =
        useState<NotificationsData>(initial);

    useEcho(`user.${userId}`, '.PostLiked', (data: any) => {
        const newNotification: Notification = {
            id: Date.now(),
            type: 'like',
            actor: {
                id: 0,
                name: data.liker_name,
                username: data.liker_username,
                avatar: data.liker_avatar,
                is_verified: false,
            },
            post: {
                id: data.post_id,
                content: data.post_content,
            },
            created_at: data.timestamp,
            read_at: null,
        };

        setNotifications((prev) => ({
            all: [newNotification, ...prev.all],
            verified: prev.verified,
            mentions: prev.mentions,
        }));
    });

    useEffect(() => {
        axios.post('/notifications/mark-all-read').catch(console.error);
    }, []);

    const markAllRead = async () => {
        await axios.post('/notifications/mark-all-read');
        setNotifications((prev) => ({
            all: prev.all.map((n) => ({
                ...n,
                read_at: new Date().toISOString(),
            })),
            verified: prev.verified.map((n) => ({
                ...n,
                read_at: new Date().toISOString(),
            })),
            mentions: prev.mentions.map((n) => ({
                ...n,
                read_at: new Date().toISOString(),
            })),
        }));
    };

    const markAsRead = async (id: number) => {
        await axios.post(`/notifications/${id}/read`);
    };

    return { notifications, setNotifications, markAllRead, markAsRead };
}
