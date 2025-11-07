import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import { useNotifications } from '@/hooks/useNotifications';
import NewPostListener from '@/pages/_components/NewPostListener';
import { usePage } from '@inertiajs/react';
import { Toaster } from 'sonner';

type AppLayoutProps = {
    children: React.ReactNode;
    isRightSidebarOpen?: boolean;
    enableNewPostListener?: boolean;
};

export default function AppLayout({
    children,
    isRightSidebarOpen = true,
}: AppLayoutProps) {
    const { auth } = usePage<any>().props;

    const { unreadCount, clearUnreadCount } = useNotifications(auth.user.id);

    return (
        <div className="flex justify-center">
            <Toaster position="bottom-center" richColors />

            <NewPostListener />

            <LeftSidebar
                unreadCount={unreadCount}
                clearUnreadCount={clearUnreadCount}
            />
            <main className="min-h-screen w-full max-w-2xl">{children}</main>

            {isRightSidebarOpen && <RightSidebar />}
        </div>
    );
}
