import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, UserMinus, UserPlus } from 'lucide-react';

interface PostUser {
    id?: number;
    name: string;
    username: string;
    avatar?: string;
    verified?: boolean;
}

interface PostHeaderProps {
    user: PostUser;
    timestamp: string;
    isFollowing?: boolean;
    onFollow?: (e?: React.MouseEvent) => void;
    onDelete?: () => void;
}

export function PostHeader({
    user,
    timestamp,
    isFollowing,
    onFollow,
    onDelete,
}: PostHeaderProps) {
    return (
        <div className="flex items-start justify-between">
            <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                        {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div>
                    <div className="flex items-center gap-1">
                        <span className="font-bold hover:underline">
                            {user.name}
                        </span>
                        {user.verified && (
                            <svg
                                className="h-4 w-4 text-blue-500"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6 11.66l1.4-1.46 3.14 3.14 6.95-6.95L19 8.06l-8.46 8.14z" />
                            </svg>
                        )}
                        <span className="text-sm text-muted-foreground">
                            @{user.username}
                        </span>
                        <span className="text-sm text-muted-foreground">·</span>
                        <span className="text-sm text-muted-foreground">
                            {timestamp}
                        </span>
                    </div>
                </div>
            </div>

            {/* Three-dot menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    {/* Follow/Unfollow - show if onFollow exists */}
                    {onFollow && (
                        <>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFollow(e);
                                }}
                            >
                                {isFollowing ? (
                                    <>
                                        <UserMinus className="mr-2 h-4 w-4" />
                                        <span>Unfollow @{user.username}</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        <span>Follow @{user.username}</span>
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}

                    {/* Delete - only show if onDelete exists */}
                    {onDelete && (
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
