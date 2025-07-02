import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, CheckCircle2, CircleDashed, Gift, Sparkles, Trophy, Users } from 'lucide-react';

interface DashboardProps {
    stats?: {
        totalEvents: number;
        activeEvents: number;
        totalPrizes: number;
        activePrizes: number;
        totalEmployees: number;
        totalWinners: number;
    };
    recentEvents?: Array<{
        id: number;
        name: string;
        event_date: string;
        status: string;
        winners_count: number;
    }>;
    topPrizes?: Array<{
        id: number;
        name: string;
        image_url: string;
        total_stock: number;
        remaining_stock: number;
        winners_count: number;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ stats, recentEvents, topPrizes }: DashboardProps) {
    // Dummy data jika props tidak tersedia
    const dashboardStats = stats || {
        totalEvents: 5,
        activeEvents: 2,
        totalPrizes: 15,
        activePrizes: 10,
        totalEmployees: 250,
        totalWinners: 120,
    };

    const dashboardEvents = recentEvents || [
        { id: 1, name: 'Ulang Tahun Perusahaan', event_date: '2023-12-15', status: 'completed', winners_count: 25 },
        { id: 2, name: 'Gathering Tahunan', event_date: '2023-11-20', status: 'completed', winners_count: 30 },
        { id: 3, name: 'Acara Natal', event_date: '2023-12-24', status: 'active', winners_count: 15 },
        { id: 4, name: 'Tahun Baru 2024', event_date: '2024-01-01', status: 'active', winners_count: 0 },
    ];

    const dashboardPrizes = topPrizes || [
        { id: 1, name: 'Smartphone', image_url: '/storage/prizes/phone.jpg', total_stock: 5, remaining_stock: 1, winners_count: 4 },
        { id: 2, name: 'Laptop', image_url: '/storage/prizes/laptop.jpg', total_stock: 3, remaining_stock: 0, winners_count: 3 },
        { id: 3, name: 'Smart TV', image_url: '/storage/prizes/tv.jpg', total_stock: 2, remaining_stock: 1, winners_count: 1 },
        { id: 4, name: 'Voucher Belanja', image_url: '/storage/prizes/voucher.jpg', total_stock: 20, remaining_stock: 5, winners_count: 15 },
    ];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Doorprize</h1>
                    <p className="text-muted-foreground">Pantau statistik dan aktivitas doorprize dalam satu tampilan.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Acara</CardTitle>
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardStats.totalEvents}</div>
                            <p className="mt-1 text-xs text-muted-foreground">{dashboardStats.activeEvents} acara aktif</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Hadiah</CardTitle>
                            <Gift className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardStats.totalPrizes}</div>
                            <p className="mt-1 text-xs text-muted-foreground">{dashboardStats.activePrizes} hadiah aktif</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardStats.totalEmployees}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Terdaftar dalam sistem</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pemenang</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardStats.totalWinners}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Dari semua acara</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    {/* Recent Events */}
                    <Card className="md:col-span-2 lg:col-span-4">
                        <CardHeader className="flex flex-row items-center">
                            <div>
                                <CardTitle>Acara Terbaru</CardTitle>
                                <CardDescription>Daftar acara doorprize terbaru</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Acara</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Pemenang</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dashboardEvents.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/events/${event.id}`} className="hover:underline">
                                                    {event.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{formatDate(event.event_date)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {event.status === 'active' ? (
                                                        <>
                                                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                            <span>Aktif</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                                                            <span>Selesai</span>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{event.winners_count}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/events" className="w-full">
                                    <span>Lihat Semua Acara</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Top Prizes */}
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Hadiah Populer</CardTitle>
                            <CardDescription>Hadiah dengan pemenang terbanyak</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {dashboardPrizes.map((prize) => (
                                    <div key={prize.id} className="flex items-center gap-4">
                                        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                                            {prize.image_url ? (
                                                <img src={prize.image_url} alt={prize.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <Gift className="m-3 h-6 w-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <Link href={`/prizes/${prize.id}`} className="font-medium hover:underline">
                                                {prize.name}
                                            </Link>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Trophy className="h-3 w-3" /> {prize.winners_count} pemenang
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    {prize.remaining_stock > 0 ? (
                                                        <>
                                                            <CheckCircle2 className="h-3 w-3 text-green-500" /> Tersedia
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CircleDashed className="h-3 w-3 text-gray-400" /> Habis
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium">
                                            {prize.remaining_stock}/{prize.total_stock}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/prizes" className="w-full">
                                    <span>Lihat Semua Hadiah</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Button asChild className="h-24 flex-col gap-1">
                        <Link href="/doorprize">
                            <Sparkles className="h-6 w-6" />
                            <span className="text-lg font-medium">Mulai Doorprize</span>
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-24 flex-col gap-1">
                        <Link href="/events/create">
                            <CalendarDays className="h-6 w-6" />
                            <span className="text-lg font-medium">Buat Acara Baru</span>
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-24 flex-col gap-1">
                        <Link href="/prizes/create">
                            <Gift className="h-6 w-6" />
                            <span className="text-lg font-medium">Tambah Hadiah</span>
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-24 flex-col gap-1">
                        <Link href="/doorprize/winners">
                            <Trophy className="h-6 w-6" />
                            <span className="text-lg font-medium">Lihat Pemenang</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
