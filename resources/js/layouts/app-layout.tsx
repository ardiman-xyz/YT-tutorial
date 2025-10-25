import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import { Toaster } from 'sonner';

type AppLayoutProps = {
    children: React.ReactNode;
    isRightSidebarOpen?: boolean; // 👉 parameter baru (opsional)
};

export default function AppLayout({
    children,
    isRightSidebarOpen = true,
}: AppLayoutProps) {
    return (
        <div className="flex justify-center">
            <Toaster position="bottom-center" />

            {/* Sidebar kiri */}
            <LeftSidebar />

            {/* Konten utama */}
            <main className="min-h-screen w-full max-w-2xl">{children}</main>

            {isRightSidebarOpen && <RightSidebar />}
        </div>
    );
}
