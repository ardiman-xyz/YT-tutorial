import { Link } from '@inertiajs/react';
import React from 'react';

export default function NavItem({
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
