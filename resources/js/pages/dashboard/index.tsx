import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Activity, Award, Calendar, Clock, Gift, TrendingUp, Trophy, Users } from 'lucide-react';
import { Prize, Winner } from '@/interface';
import PageLoader from '@/components/page/Loader';
import { useEffect, useRef } from 'react';

interface PageProps {
    currentEvent?: {
        id: number;
        name: string;
        description: string;
        status: string;
        eventDate: string;
    }
    stats?: {
        totalEmployees: number;
        totalWinners: number;
        availableCount: number;
        totalPrizes: number;
    }
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
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function DoorprizeDashboard() {
    const {currentEvent, stats, prizes, recentWinners, events} = usePage<PageProps>().props;

    const reloadedRef = useRef(false);

    useEffect(() => {
        if (!reloadedRef.current) {
            reloadedRef.current = true;
            router.reload();
        }
    }, []);

    if (!currentEvent || !stats || !prizes || !recentWinners || !events) return <PageLoader/>

    const participationRate = ((stats.totalWinners / stats.totalEmployees) * 100).toFixed(1);
    const totalPrizesAwarded = prizes.reduce((sum, prize) => sum + (prize.totalStock - prize.stock), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Doorprize Dashboard</h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">Manage your doorprize events and track winners</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                View Events
                            </Button>
                            <Button className="flex items-center gap-2">
                                <Gift className="h-4 w-4" />
                                Start Drawing
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
                                        <CardTitle className="text-lg">Current Active Event</CardTitle>
                                    </div>
                                    <Badge className={getStatusColor(currentEvent.status)}>
                                        {currentEvent.status.charAt(0).toUpperCase() + currentEvent.status.slice(1)}
                                    </Badge>
                                </div>
                                <CardDescription className="text-xl font-semibold text-gray-900 dark:text-white">{currentEvent.name}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    <span>Event Date: {formatDate(currentEvent.eventDate)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                                <p className="text-xs text-muted-foreground">Eligible participants</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Winners</CardTitle>
                                <Trophy className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalWinners}</div>
                                <p className="text-xs text-muted-foreground">{participationRate}% participation rate</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Available Participants</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.availableCount}</div>
                                <p className="text-xs text-muted-foreground">Haven't won any prize yet</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Prizes Awarded</CardTitle>
                                <Award className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalPrizesAwarded}</div>
                                <p className="text-xs text-muted-foreground">
                                    Out of {prizes.reduce((sum, prize) => sum + prize.totalStock, 0)} total prizes
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Prize Stock Status */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Gift className="h-5 w-5" />
                                    Prize Stock Status
                                </CardTitle>
                                <CardDescription>Current availability of all prizes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {prizes.map((prize) => (
                                        <div key={prize.id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-gray-100">
                                                    <img src={prize.imageUrl} alt="image" className={'h-full w-full object-cover'} />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{prize.name}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {prize.stock} of {prize.totalStock} remaining
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 bg-primary`}
                                                        style={{
                                                            width: `${(prize.stock / prize.totalStock) * 100}%`,
                                                        }}
                                                    />
                                                </div>
                                                <Badge variant={prize.stock > 0 ? 'secondary' : 'destructive'}>
                                                    {prize.stock > 0 ? 'Available' : 'Sold Out'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Winners */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Recent Winners
                                </CardTitle>
                                <CardDescription>Latest prize drawings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recentWinners.map((winner) => (
                                        <div key={winner.id} className="flex items-center gap-3 rounded-lg border p-2">
                                            <Users />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{winner.employee.name}</p>
                                                <p className="truncate text-xs text-gray-600 dark:text-gray-400">{winner.prize.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500">{winner.timestamp}</p>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                #{winner.winnerNumber}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
