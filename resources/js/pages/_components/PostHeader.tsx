import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { PostUser } from '../types';

interface PostHeaderProps {
    user: PostUser;
    timestamp: string;
    isFollowing?: boolean;
}

export function PostHeader({ user, timestamp, isFollowing }: PostHeaderProps) {
    return (
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                        {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div>
                    <div className="flex items-center gap-1">
                        <span className="cursor-pointer font-semibold hover:underline">
                            {user.name}
                        </span>
                        {user.verified && (
                            <svg
                                className="h-4 w-4 text-blue-500"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34..." />
                            </svg>
                        )}
                        <span className="text-muted-foreground">
                            @{user.username}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">
                            {timestamp}
                        </span>
                    </div>
                </div>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-muted"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem>
                        {isFollowing
                            ? `Unfollow @${user.username}`
                            : `Follow @${user.username}`}
                    </DropdownMenuItem>
                    <DropdownMenuItem>Mute @{user.username}</DropdownMenuItem>
                    <DropdownMenuItem>Block @{user.username}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Report post</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
