import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AiSearch02Icon,
    AllBookmarkIcon,
    Home01Icon,
    Message01Icon,
    MoreHorizontalFreeIcons,
    Notification01Icon,
    UserIcon,
    UserMultiple02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { router, usePage } from '@inertiajs/react';
import { LogOut, MoreHorizontal, User } from 'lucide-react';
import NavItem from './NavItem';

interface User {
    id: number;
    name: string;
    username: string;
    avatar?: string;
}

export default function LeftSidebar() {
    const { url, props } = usePage<{ auth: { user: User } }>();
    const user = props.auth?.user;

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleProfile = () => {
        router.visit(`/profile/${user.id}`);
    };

    return (
        <aside className="sticky top-0 h-screen w-64 p-4">
            <div className="flex h-full flex-col justify-between">
                <div>
                    <div className="mb-4 pl-3 text-2xl font-bold text-blue-500">
                        <img src="/images/zephyr.png" alt="logo" />
                    </div>

                    <nav className="space-y-2">
                        <NavItem
                            href="/dashboard"
                            active={url === '/dashboard'}
                            icon={
                                <HugeiconsIcon
                                    icon={Home01Icon}
                                    size={24}
                                    color="currentColor"
                                />
                            }
                        >
                            Home
                        </NavItem>
                        <NavItem
                            href="/explore"
                            active={url === '/explore'}
                            icon={
                                <HugeiconsIcon
                                    icon={AiSearch02Icon}
                                    size={24}
                                    color="currentColor"
                                />
                            }
                        >
                            Explore
                        </NavItem>
                        <NavItem
                            href="/notifications"
                            active={url === '/notifications'}
                            icon={
                                <HugeiconsIcon
                                    icon={Notification01Icon}
                                    size={24}
                                    color="currentColor"
                                />
                            }
                        >
                            Notifications
                        </NavItem>
                        <NavItem
                            href="/messages"
                            active={url === '/messages'}
                            icon={
                                <HugeiconsIcon
                                    icon={Message01Icon}
                                    size={24}
                                    color="currentColor"
                                />
                            }
                        >
                            Messages
                        </NavItem>
                        <NavItem
                            href="/bookmarks"
                            active={url === '/bookmarks'}
                            icon={
                                <HugeiconsIcon
                                    icon={AllBookmarkIcon}
                                    size={24}
                                    color="currentColor"
                                />
                            }
                        >
                            Bookmarks
                        </NavItem>
                        <NavItem
                            href="/communities"
                            active={url === '/communities'}
                            icon={
                                <HugeiconsIcon
                                    icon={UserMultiple02Icon}
                                    size={24}
                                    color="currentColor"
                                />
                            }
                        >
                            Communities
                        </NavItem>
                        <NavItem
                            href={`/profile/${user?.id}`}
                            active={url === `/profile/${user?.id}`}
                            icon={
                                <HugeiconsIcon
                                    icon={UserIcon}
                                    size={24}
                                    color="currentColor"
                                />
                            }
                        >
                            Profile
                        </NavItem>
                        <NavItem
                            href="/more"
                            active={url === '/more'}
                            icon={
                                <HugeiconsIcon
                                    icon={MoreHorizontalFreeIcons}
                                    size={24}
                                    color="currentColor"
                                />
                            }
                        >
                            More
                        </NavItem>
                    </nav>

                    <button className="mt-8 w-full rounded-full bg-blue-500 px-4 py-3 text-center font-semibold text-white hover:bg-blue-600">
                        Post
                    </button>
                </div>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="mt-auto flex w-full items-center gap-3 rounded-full p-3 transition-colors hover:bg-muted">
                            <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src={user?.avatar}
                                    alt={user?.name}
                                />
                                <AvatarFallback>
                                    {user?.name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-semibold">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    @{user?.username}
                                </p>
                            </div>
                            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={handleProfile}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out @{user?.username}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>
    );
}
