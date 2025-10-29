// resources/js/layouts/partials/NavItem.tsx

import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface NavItemProps {
    href: string;
    active: boolean;
    icon: ReactNode;
    children: ReactNode;
    onClick?: () => void;
}

export default function NavItem({
    href,
    active,
    icon,
    children,
    onClick,
}: NavItemProps) {
    const handleClick = (e: React.MouseEvent) => {
        if (onClick) {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <Link
            href={href}
            onClick={handleClick}
            className={cn(
                'flex items-center gap-4 rounded-full px-4 py-3 text-xl transition-colors',
                active
                    ? 'bg-primary/10 font-bold'
                    : 'font-normal hover:bg-muted',
            )}
        >
            {icon}
            <span>{children}</span>
        </Link>
    );
}
