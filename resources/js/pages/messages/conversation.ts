export interface Message {
    id: number;
    content: string;
    sender_id: number;
    created_at: string;
}

export interface Conversation {
    id: number;
    user: {
        id: number;
        name: string;
        username: string;
        avatar?: string;
        is_verified: boolean;
        is_online: boolean;
    };
    last_message?: {
        content: string;
        created_at: string;
        is_read: boolean;
    };
    unread_count: number;
}
