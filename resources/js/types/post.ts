// resources/js/types/post.ts

export interface User {
    id: number;
    name: string;
    username: string;
    avatar?: string;
    is_verified?: boolean;
}

export interface Media {
    id: number;
    post_id: number;
    type: 'image' | 'video' | 'gif';
    url: string;
    thumbnail_url?: string;
    duration?: string;
    order: number;
}

export interface Post {
    id: number;
    user_id: number;
    content: string;
    created_at: string;
    updated_at: string;
    is_liked?: boolean;
    is_following?: boolean;
    is_reposted?: boolean;
    is_bookmarked?: boolean;

    // Relationships
    user: User;
    media: Media[];

    // Counts (for future use)
    replies_count?: number;
    reposts_count?: number;
    likes_count?: number;
    views_count?: number;
    bookmarks_count?: number;
    parent_id?: number | null;
}

export interface CreatePostData {
    content?: string;
    images?: File[];
    audience?: 'everyone' | 'circle';
}

export interface PaginatedPosts {
    data: Post[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url?: string;
    prev_page_url?: string;
}
