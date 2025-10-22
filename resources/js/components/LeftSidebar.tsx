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
import { usePage } from '@inertiajs/react';
import NavItem from './NavItem';

export default function LeftSidebar() {
    const { url } = usePage();

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
                            href="/profile"
                            active={url === '/profile'}
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

                <div className="mt-auto flex items-center gap-3 rounded-full p-2 hover:bg-gray-100">
                    <div className="h-10 w-10 rounded-full bg-gray-300" />
                    <div>
                        <p className="text-sm font-semibold">User Name</p>
                        <p className="text-xs text-gray-500">@username</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
