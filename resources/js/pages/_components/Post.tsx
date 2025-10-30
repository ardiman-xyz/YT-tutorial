import { PostActions } from './PostActions';
import { PostHeader } from './PostHeader';
import { PostMediaGrid } from './PostMedia';

interface PostUser {
    id?: number;
    name: string;
    username: string;
    avatar?: string;
    verified?: boolean;
}

interface PostMedia {
    id: number;
    url: string;
    type: 'image' | 'video' | 'gif';
    thumbnail?: string;
    duration?: string;
}

interface PostProps {
    user: PostUser;
    content: string;
    media?: PostMedia[];
    timestamp: string;
    source?: string;
    likes: number;
    replies: number;
    reposts: number;
    views: number;
    isLiked: boolean;
    isReposted: boolean;
    isBookmarked: boolean;
    onLike?: (e?: React.MouseEvent) => void;
    onRepost?: (e?: React.MouseEvent) => void;
    onBookmark?: (e?: React.MouseEvent) => void;
    onReply?: (e?: React.MouseEvent) => void;
    onShare?: (e?: React.MouseEvent) => void;
    isFollowing?: boolean;
    onFollow?: (e?: React.MouseEvent) => void;
    onDelete?: () => void;
    bookmarks?: number;
}

export function Post(props: PostProps) {
    const {
        user,
        content,
        media = [],
        timestamp,
        source,
        likes,
        replies,
        reposts,
        views,
        isLiked,
        isReposted,
        isBookmarked,
        onLike,
        onRepost,
        onBookmark,
        onReply,
        onShare,
        onDelete,
        onFollow,
        bookmarks = 0,
    } = props;

    const handleAction = (
        callback: ((e?: React.MouseEvent) => void) | undefined,
        e: React.MouseEvent,
    ) => {
        e.stopPropagation();
        if (callback) callback(e);
    };

    return (
        <article className="border-b bg-card p-4 transition-colors hover:bg-muted/30">
            <div onClick={(e) => e.stopPropagation()}>
                <PostHeader
                    user={user}
                    timestamp={timestamp}
                    isFollowing={props.isFollowing}
                    onDelete={onDelete}
                    onFollow={onFollow}
                />
            </div>

            <div className="mt-2 text-[15px] leading-normal">{content}</div>

            <PostMediaGrid media={media} />

            {source && (
                <div className="mt-2 text-sm text-muted-foreground">
                    From {source}
                </div>
            )}

            <div onClick={(e) => e.stopPropagation()}>
                <PostActions
                    replies={replies}
                    bookmarks={bookmarks}
                    likes={likes}
                    reposts={reposts}
                    views={views}
                    isLiked={!!isLiked}
                    isReposted={!!isReposted}
                    isBookmarked={!!isBookmarked}
                    onLike={onLike || (() => {})}
                    onRepost={onRepost || (() => {})}
                    onReply={onReply || (() => {})}
                    onBookmark={onBookmark || (() => {})}
                    onShare={onShare || (() => {})}
                />
            </div>
        </article>
    );
}
