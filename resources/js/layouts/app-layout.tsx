import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import { Toaster } from 'sonner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex justify-center">
            <Toaster position="top-center" />

            {/* Sidebar kiri */}
            <LeftSidebar />

            {/* Konten utama */}
            <main className="min-h-screen w-full max-w-2xl border-x">
                {children}
            </main>

            {/* Sidebar kanan */}
            <RightSidebar />
        </div>
    );
}
