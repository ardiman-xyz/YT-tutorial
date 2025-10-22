export interface PostMedia {
    id: number;
    url: string;
    type: 'image' | 'video';
    thumbnail?: string;
    duration?: string;
}

export interface PostUser {
    id: number;
    name: string;
    username: string;
    avatar?: string;
    verified?: boolean;
}

export interface PostProps {
    id: number;
    user: PostUser;
    content: string;
    media?: PostMedia[];
    timestamp: string;
    source?: string;
    likes: number;
    replies: number;
    reposts: number;
    views: number;
    bookmarks?: number;
    isLiked?: boolean;
    isReposted?: boolean;
    isBookmarked?: boolean;
    isFollowing?: boolean;
    onLike?: () => void;
    onRepost?: () => void;
    onBookmark?: () => void;
    onReply?: () => void;
    onShare?: () => void;
}
