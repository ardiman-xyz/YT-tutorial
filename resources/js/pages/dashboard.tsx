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
        <AppLayout>
            <Head title="Dashboard" />

            <div className="border-b p-4 text-xl font-bold">Home</div>

            <div className="divide-y">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="p-4 hover:bg-gray-50">
                        <p className="font-semibold">Postingan #{i + 1}</p>
                        <p className="text-gray-600">
                            Ini contoh isi konten panjang untuk mengetes scroll.
                        </p>
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}
