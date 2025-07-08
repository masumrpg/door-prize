import PageLoader from '@/components/page/Loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Prize, Winner } from '@/interface';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Activity, Award, Calendar, Eye, Gift, TrendingUp, Trophy, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface PageProps {
    currentEvent?: {
        id: number;
        name: string;
        description: string;
        status: string;
        eventDate: string;
    };
    stats?: {
        totalEmployees: number;
        totalWinners: number;
        availableCount: number;
        totalPrizes: number;
    };
    prizes?: Prize[];
    recentWinners?: Winner[];
    events?: {
        id: number;
        name: string;
        description: string;
        status: string;
        eventDate: string;
    }[];
    [key: string]: unknown;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'completed':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'draft':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
};

const formatDate = (dateString: string | number | Date) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const getStatusText = (status: string) => {
    switch (status) {
        case 'active':
            return 'Aktif';
        case 'completed':
            return 'Selesai';
        case 'draft':
            return 'Draf';
        default:
            return status;
    }
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function DoorprizeDashboard() {
    const { currentEvent, stats, prizes, recentWinners, events } = usePage<PageProps>().props;
    const [prizeModalOpen, setPrizeModalOpen] = useState(false);
    const [winnersModalOpen, setWinnersModalOpen] = useState(false);

    const reloadedRef = useRef(false);

    useEffect(() => {
        if (!reloadedRef.current) {
            reloadedRef.current = true;
            router.reload();
        }
    }, []);

    if (!currentEvent || !stats || !prizes || !recentWinners || !events) return <PageLoader />;

    const participationRate = ((stats.totalWinners / stats.totalEmployees) * 100).toFixed(1);
    const totalPrizesAwarded = prizes.reduce((sum, prize) => sum + (prize.totalStock - prize.stock), 0);

    // Limit display to 5 items
    const displayedPrizes = prizes.slice(0, 5);
    const displayedWinners = recentWinners.slice(0, 5);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dasbor" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">Kelola acara doorprize dan lacak pemenang</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 hover:cursor-pointer"
                                onClick={() => router.visit('/events')}
                            >
                                <Calendar className="h-4 w-4" />
                                Lihat Acara
                            </Button>
                            <Button className="flex items-center gap-2 hover:cursor-pointer" onClick={() => router.visit('/doorprize')}>
                                <Gift className="h-4 w-4" />
                                Undian
                            </Button>
                        </div>
                    </div>

                    {/* Current Event Card */}
                    {currentEvent && (
                        <Card className="border-l-4 border-l-blue-500">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-blue-500" />
                                        <CardTitle className="text-lg">Acara Aktif Saat Ini</CardTitle>
                                    </div>
                                    <Badge className={getStatusColor(currentEvent.status)}>{getStatusText(currentEvent.status)}</Badge>
                                </div>
                                <CardDescription className="text-xl font-semibold text-gray-900 dark:text-white">{currentEvent.name}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    <span>Tanggal Acara: {formatDate(currentEvent.eventDate)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                                <p className="text-xs text-muted-foreground">Peserta yang memenuhi syarat</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Pemenang</CardTitle>
                                <Trophy className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalWinners}</div>
                                <p className="text-xs text-muted-foreground">Tingkat partisipasi {participationRate}%</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Peserta Tersedia</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.availableCount}</div>
                                <p className="text-xs text-muted-foreground">Belum memenangkan hadiah apapun</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Hadiah Diberikan</CardTitle>
                                <Award className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalPrizesAwarded}</div>
                                <p className="text-xs text-muted-foreground">
                                    Dari {prizes.reduce((sum, prize) => sum + prize.totalStock, 0)} total hadiah
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Prize Stock Status */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Gift className="h-5 w-5" />
                                            Status Stok Hadiah
                                        </CardTitle>
                                        <CardDescription>Ketersediaan semua hadiah saat ini</CardDescription>
                                    </div>
                                    <Dialog open={prizeModalOpen} onOpenChange={setPrizeModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                                <Eye className="h-4 w-4" />
                                                Lihat Semua
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-h-[85vh] max-w-5xl">
                                            <DialogHeader className="pb-4">
                                                <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                                                    <Gift className="h-6 w-6 text-primary" />
                                                    Semua Status Stok Hadiah
                                                </DialogTitle>
                                                <p className="text-base text-gray-600 dark:text-gray-400">
                                                    Daftar lengkap semua hadiah dan ketersediaan stok
                                                </p>
                                            </DialogHeader>
                                            <ScrollArea className="h-[650px] w-full rounded-lg">
                                                <div className="space-y-4 p-2">
                                                    {prizes.map((prize) => (
                                                        <div
                                                            key={prize.id}
                                                            className="flex items-center justify-between rounded-xl border-2 p-6 shadow-sm transition-shadow hover:shadow-md"
                                                        >
                                                            <div className="flex items-center gap-6">
                                                                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-gray-50 dark:bg-gray-800">
                                                                    <img
                                                                        src={prize.imageUrl}
                                                                        alt="gambar hadiah"
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 space-y-2">
                                                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                        {prize.name}
                                                                    </p>
                                                                    <p className="text-base text-gray-600 dark:text-gray-400">
                                                                        <span className="font-medium">{prize.stock}</span> dari{' '}
                                                                        <span className="font-medium">{prize.totalStock}</span> tersisa
                                                                    </p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-500">
                                                                        {prize.totalStock - prize.stock} hadiah telah diberikan
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-shrink-0 flex-col items-end gap-3">
                                                                <Badge
                                                                    variant={prize.stock > 0 ? 'secondary' : 'destructive'}
                                                                    className="px-3 py-1 text-sm"
                                                                >
                                                                    {prize.stock > 0 ? 'Tersedia' : 'Habis'}
                                                                </Badge>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                        {Math.round((prize.stock / prize.totalStock) * 100)}%
                                                                    </span>
                                                                    <div className="h-3 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                                                                        <div
                                                                            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                                                                            style={{
                                                                                width: `${(prize.stock / prize.totalStock) * 100}%`,
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {displayedPrizes.map((prize) => (
                                        <div key={prize.id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-gray-100">
                                                    <img src={prize.imageUrl} alt="gambar" className={'h-full w-full object-cover'} />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{prize.name}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {prize.stock} dari {prize.totalStock} tersisa
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                                                    <div
                                                        className={`h-2 rounded-full bg-primary transition-all duration-300`}
                                                        style={{
                                                            width: `${(prize.stock / prize.totalStock) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                                <Badge variant={prize.stock > 0 ? 'secondary' : 'destructive'}>
                                                    {prize.stock > 0 ? 'Tersedia' : 'Habis'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {prizes.length > 5 && (
                                    <div className="mt-4 text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setPrizeModalOpen(true)}
                                            className="text-primary hover:text-primary/80"
                                        >
                                            Lihat {prizes.length - 5} hadiah lainnya
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Winners */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Semua Pemenang
                                        </CardTitle>
                                        <CardDescription>Undian hadiah terbaru</CardDescription>
                                    </div>
                                    <Dialog open={winnersModalOpen} onOpenChange={setWinnersModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                                <Eye className="h-4 w-4" />
                                                Lihat Semua
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-h-[85vh] max-w-4xl">
                                            <DialogHeader className="pb-4">
                                                <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                                                    <Trophy className="h-6 w-6 text-primary" />
                                                    Semua Pemenang Doorprize
                                                </DialogTitle>
                                                <p className="text-base text-gray-600 dark:text-gray-400">Daftar lengkap semua pemenang doorprize</p>
                                            </DialogHeader>
                                            <ScrollArea className="h-[650px] w-full rounded-lg">
                                                <div className="space-y-4 p-2">
                                                    {recentWinners.map((winner) => (
                                                        <div
                                                            key={winner.id}
                                                            className="flex items-center gap-6 rounded-xl border-2 p-6 shadow-sm transition-shadow hover:shadow-md"
                                                        >
                                                            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                                                                {winner.prize.imageUrl ? (
                                                                    <img
                                                                        src={winner.prize.imageUrl}
                                                                        alt={winner.prize.name}
                                                                        className="h-full w-full object-contain"
                                                                    />
                                                                ) : (
                                                                    <Trophy className="h-8 w-8 text-white" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1 space-y-2">
                                                                <div className="flex items-center gap-3">
                                                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                        {winner.employee.name}
                                                                    </p>
                                                                    <Badge variant="outline" className="px-3 py-1 text-sm">
                                                                        {winner.employee.employeeId}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Gift className="h-4 w-4 text-gray-500" />
                                                                    <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                                                                        {winner.prize.name}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{winner.timestamp}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {displayedWinners.map((winner) => (
                                        <div key={winner.id} className="flex items-center gap-3 rounded-lg border p-2">
                                            <Users />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{winner.employee.name}</p>
                                                <p className="truncate text-xs text-gray-600 dark:text-gray-400">{winner.prize.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500">{winner.timestamp}</p>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {winner.employee.employeeId}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                                {recentWinners.length > 5 && (
                                    <div className="mt-4 text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setWinnersModalOpen(true)}
                                            className="text-primary hover:text-primary/80"
                                        >
                                            Lihat {recentWinners.length - 5} pemenang lainnya
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
