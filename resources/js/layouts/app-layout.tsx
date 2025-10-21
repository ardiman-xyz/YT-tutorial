import { Link, usePage } from '@inertiajs/react';
import React from 'react';

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

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { url } = usePage();

    return (
        <div className="flex justify-center">
            {/* Sidebar kiri */}
            <aside className="sticky top-0 h-screen w-64 p-4">
                <div className="flex h-full flex-col justify-between">
                    <div>
                        <div className="mb-8 pl-3 text-2xl font-bold text-blue-500">
                            XClone
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

            {/* Konten utama */}
            <main className="min-h-screen w-full max-w-2xl border-x">
                <div className="space-y-4 p-4">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="rounded-md border p-3">
                            <h2 className="font-semibold">
                                Postingan #{i + 1}
                            </h2>
                            <p>
                                Ini contoh isi konten panjang untuk mengetes
                                scroll.
                            </p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Sidebar kanan */}
            <aside className="sticky top-0 h-screen w-72 p-4">
                <input
                    type="text"
                    placeholder="Search"
                    className="mb-4 w-full rounded-full bg-gray-100 px-4 py-2 text-sm focus:outline-none"
                />

                <div className="rounded-2xl bg-gray-50 p-4 shadow">
                    <h2 className="mb-3 text-lg font-bold">What’s happening</h2>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li>#HARQEELTAKEN · 30.7K posts</li>
                        <li>#OPPOFootball · Trending</li>
                        <li>#HariBhaktiPendampingDesa · Politics</li>
                    </ul>
                    <button className="mt-3 text-blue-500 hover:underline">
                        Show more
                    </button>
                </div>

                <div className="mt-4 rounded-2xl bg-gray-50 p-4 shadow">
                    <h2 className="mb-3 text-lg font-bold">Who to follow</h2>
                    <div className="space-y-3 text-sm">
                        <FollowItem name="GraphQL" username="@GraphQL" />
                        <FollowItem name="Larajobs" username="@laraveljobs" />
                        <FollowItem name="Laracon EU" username="@LaraconEU" />
                    </div>
                    <button className="mt-3 text-blue-500 hover:underline">
                        Show more
                    </button>
                </div>
            </aside>
        </div>
    );
}

function NavItem({
    href,
    icon,
    active,
    children,
}: {
    href: string;
    icon: React.ReactNode;
    active?: boolean;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-4 rounded-full px-4 py-2 text-lg font-medium transition ${
                active
                    ? 'text-blue-500'
                    : 'text-gray-800 hover:bg-gray-100 hover:text-blue-500'
            }`}
        >
            <span className="h-6 w-6">{icon}</span>
            <span>{children}</span>
        </Link>
    );
}

function FollowItem({ name, username }: { name: string; username: string }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="font-semibold">{name}</p>
                <p className="text-gray-500">{username}</p>
            </div>
            <button className="rounded-full bg-black px-4 py-1 text-sm font-semibold text-white hover:bg-gray-800">
                Follow
            </button>
        </div>
    );
}
