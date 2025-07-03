import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function NoActiveEvent() {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tidak Ada Event Aktif" />
            <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">No Active Event</h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    Saat ini belum ada event doorprize yang aktif. Anda dapat melihat atau membuat event untuk memulai.
                </p>
                <Button onClick={() => router.visit('/events')} className="mt-4 hover:cursor-pointer">
                    Ke Halaman Event
                </Button>
            </div>
        </AppLayout>
    );
}
