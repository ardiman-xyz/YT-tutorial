import { LikeButton } from '@/components/like-button';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatNumber } from '@/lib/utils';
import { Analytics01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Share } from 'lucide-react';
import { BookmarkButton } from './BookmarkButton';
import ChatButton from './ChatButton';
import RepostButton from './RepostButton';

interface PostActionsProps {
    replies: number;
    likes: number;
    reposts: number;
    views: number;
    isLiked: boolean;
    isReposted: boolean;
    isBookmarked: boolean;
    onLike: (e?: React.MouseEvent) => void;
    onRepost: (e?: React.MouseEvent) => void;
    onReply: (e?: React.MouseEvent) => void;
    onBookmark: (e?: React.MouseEvent) => void;
    onShare: (e?: React.MouseEvent) => void;
    bookmarks: number;
}

export function PostActions({
    replies,
    likes,
    reposts,
    views,
    isLiked,
    isReposted,
    isBookmarked,
    onLike,
    onRepost,
    onReply,
    onBookmark,
    onShare,
    bookmarks,
}: PostActionsProps) {
    const handleClick = (
        callback: (e?: React.MouseEvent) => void,
        e: React.MouseEvent,
    ) => {
        e.stopPropagation();
        callback(e);
    };

    return (
        <div className="mt-3 flex items-center justify-between">
            <TooltipProvider>
                {/* Reply */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <ChatButton
                            comments={replies}
                            onClick={(e) => handleClick(onReply, e)}
                        />
                    </TooltipTrigger>
                    <TooltipContent>Reply</TooltipContent>
                </Tooltip>

                {/* Repost */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <RepostButton
                            isReposted={isReposted}
                            reposts={reposts}
                            onRepost={(e) => handleClick(onRepost, e)}
                        />
                    </TooltipTrigger>
                    <TooltipContent>Repost</TooltipContent>
                </Tooltip>

                {/* Like - Animated */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div>
                            <LikeButton
                                isLiked={isLiked}
                                count={likes}
                                onClick={(e) => handleClick(onLike, e)}
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>Like</TooltipContent>
                </Tooltip>

                {/* Views */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <HugeiconsIcon icon={Analytics01Icon} size={20} />
                            <span className="ml-1.5 text-xs">
                                {formatNumber(views)}
                            </span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Views</TooltipContent>
                </Tooltip>

                {/* Bookmark & Share */}
                <div className="flex items-center">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="mr-2 flex items-center">
                                <BookmarkButton
                                    isBookmarked={isBookmarked}
                                    onClick={(e) => handleClick(onBookmark, e)}
                                />
                                {/* Tampilkan jumlah bookmark */}
                                {bookmarks > 0 && (
                                    <span className="-ml-2 text-xs text-muted-foreground">
                                        {formatNumber(bookmarks)}
                                    </span>
                                )}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>Bookmark</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleClick(onShare, e)}
                            >
                                <Share className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share</TooltipContent>
                    </Tooltip>
                </div>
            </TooltipProvider>
        </div>
    );
}
