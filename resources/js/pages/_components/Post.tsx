import { PostProps } from '../types';
import { PostActions } from './PostActions';
import { PostHeader } from './PostHeader';
import { PostMediaGrid } from './PostMedia';

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
    } = props;

    return (
        <article className="border-b bg-card p-4 transition-colors hover:bg-muted/30">
            <PostHeader
                user={user}
                timestamp={timestamp}
                isFollowing={props.isFollowing}
            />

            <div className="mt-2 text-[15px] leading-normal">{content}</div>

            <PostMediaGrid media={media} />

            {source && (
                <div className="mt-2 text-sm text-muted-foreground">
                    From {source}
                </div>
            )}

            <PostActions
                replies={replies}
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
        </article>
    );
}
