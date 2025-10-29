import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import { useNotifications } from '@/hooks/useNotifications';
import { usePage } from '@inertiajs/react';
import { Toaster } from 'sonner';

type AppLayoutProps = {
    children: React.ReactNode;
    isRightSidebarOpen?: boolean; // 👉 parameter baru (opsional)
};

export default function AppLayout({
    children,
    isRightSidebarOpen = true,
}: AppLayoutProps) {
    const { auth } = usePage<any>().props;

    const { unreadCount, clearUnreadCount } = useNotifications(auth.user.id);

    return (
        <div className="flex justify-center">
            <Toaster position="bottom-center" />

            <LeftSidebar
                unreadCount={unreadCount}
                clearUnreadCount={clearUnreadCount}
            />
            <main className="min-h-screen w-full max-w-2xl">{children}</main>

            {isRightSidebarOpen && <RightSidebar />}
        </div>
    );
}
