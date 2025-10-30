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
