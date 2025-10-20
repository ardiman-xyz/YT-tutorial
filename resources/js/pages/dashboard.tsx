import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="p-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Selamat datang di YT Tutorial Laravel!
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Card 1 */}
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                                Upload File Besar
                            </h3>
                            <span className="text-3xl">📤</span>
                        </div>
                        <p className="mb-4 text-sm text-gray-600">
                            Pelajari cara upload file besar dengan chunking dan
                            progress bar
                        </p>
                        <a
                            href="/upload-file"
                            className="inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Mulai Tutorial
                        </a>
                    </div>

                    {/* Card 2 - Coming soon */}
                    <div className="rounded-lg bg-white p-6 opacity-60 shadow">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                                Fitur Lainnya
                            </h3>
                            <span className="text-3xl">🚀</span>
                        </div>
                        <p className="mb-4 text-sm text-gray-600">
                            Fitur-fitur menarik lainnya akan segera hadir
                        </p>
                        <button
                            disabled
                            className="inline-block cursor-not-allowed rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-400"
                        >
                            Coming Soon
                        </button>
                    </div>

                    {/* Card 3 - Coming soon */}
                    <div className="rounded-lg bg-white p-6 opacity-60 shadow">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                                Tutorial Premium
                            </h3>
                            <span className="text-3xl">⭐</span>
                        </div>
                        <p className="mb-4 text-sm text-gray-600">
                            Akses tutorial premium dengan fitur lengkap
                        </p>
                        <button
                            disabled
                            className="inline-block cursor-not-allowed rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-400"
                        >
                            Coming Soon
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
