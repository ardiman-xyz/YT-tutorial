import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
    Analytics01Icon,
    BubbleChatIcon,
    FavouriteIcon,
    RepeatIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Bookmark, Share } from 'lucide-react';

interface PostActionsProps {
    replies: number;
    likes: number;
    reposts: number;
    views: number;
    isLiked: boolean;
    isReposted: boolean;
    isBookmarked: boolean;
    onLike: () => void;
    onRepost: () => void;
    onReply: () => void;
    onBookmark: () => void;
    onShare: () => void;
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
}: PostActionsProps) {
    const formatNumber = (n: number) =>
        n >= 1_000_000
            ? (n / 1_000_000).toFixed(1) + 'M'
            : n >= 1_000
              ? (n / 1_000).toFixed(1) + 'K'
              : n.toString();

    return (
        <div className="mt-3 flex items-center justify-between">
            <TooltipProvider>
                {/* Reply */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={onReply}>
                            <HugeiconsIcon icon={BubbleChatIcon} size={20} />
                            <span className="ml-1.5 text-xs">
                                {formatNumber(replies)}
                            </span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reply</TooltipContent>
                </Tooltip>

                {/* Repost */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={onRepost}>
                            <HugeiconsIcon
                                icon={RepeatIcon}
                                size={20}
                                color={isReposted ? 'green' : 'currentColor'}
                            />
                            <span className="ml-1.5 text-xs">
                                {formatNumber(reposts)}
                            </span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Repost</TooltipContent>
                </Tooltip>

                {/* Like */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={onLike}>
                            <HugeiconsIcon
                                icon={FavouriteIcon}
                                size={20}
                                color={isLiked ? 'red' : 'currentColor'}
                                className={cn(isLiked && 'fill-red-500')}
                            />
                            <span className="ml-1.5 text-xs">
                                {formatNumber(likes)}
                            </span>
                        </Button>
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
                    <Button variant="ghost" size="icon" onClick={onBookmark}>
                        <Bookmark
                            className={cn(
                                isBookmarked && 'fill-blue-500 text-blue-500',
                            )}
                        />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onShare}>
                        <Share className="h-4 w-4" />
                    </Button>
                </div>
            </TooltipProvider>
        </div>
    );
}
