import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Activity, Award, Calendar, Clock, Gift, TrendingUp, Trophy, Users } from 'lucide-react';

// Mock data - replace with your actual props from Laravel
const mockData = {
    currentEvent: {
        id: 1,
        name: 'Annual Company Doorprize 2024',
        date: '2024-12-15',
        status: 'active',
    },
    stats: {
        totalEmployees: 250,
        totalWinners: 45,
        availableCount: 205,
        totalPrizes: 15,
    },
    prizes: [
        { id: 1, name: 'iPhone 15', stock: 2, totalStock: 3, color: '#3B82F6' },
        { id: 2, name: 'MacBook Air', stock: 0, totalStock: 1, color: '#10B981' },
        { id: 3, name: 'AirPods Pro', stock: 8, totalStock: 10, color: '#F59E0B' },
        { id: 4, name: 'Gift Voucher $100', stock: 15, totalStock: 20, color: '#EF4444' },
    ],
    recentWinners: [
        {
            id: 1,
            employee: { name: 'John Doe', id: 'EMP001' },
            prize: { name: 'iPhone 15', color: '#3B82F6' },
            timestamp: '2024-12-15 14:30:00',
            winnerNumber: 1,
        },
        {
            id: 2,
            employee: { name: 'Jane Smith', id: 'EMP002' },
            prize: { name: 'AirPods Pro', color: '#F59E0B' },
            timestamp: '2024-12-15 14:25:00',
            winnerNumber: 2,
        },
        {
            id: 3,
            employee: { name: 'Mike Johnson', id: 'EMP003' },
            prize: { name: 'Gift Voucher $100', color: '#EF4444' },
            timestamp: '2024-12-15 14:20:00',
            winnerNumber: 3,
        },
    ],
    events: [
        { id: 1, name: 'Annual Company Doorprize 2024', status: 'active', event_date: '2024-12-15', winners_count: 45 },
        { id: 2, name: 'Mid Year Celebration', status: 'completed', event_date: '2024-06-15', winners_count: 32 },
        { id: 3, name: 'New Year Event 2025', status: 'draft', event_date: '2025-01-15', winners_count: 0 },
    ],
};

interface PageProps {
    currentEvent?: {
        id: number;
        name: string;
        description: string;
        status: string;
        eventDate: string;
    }
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

const formatTime = (timestamp: string | number | Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function DoorprizeDashboard() {
    const {currentEvent:cEvent} = usePage<PageProps>().props;
    console.log(cEvent);
    const { currentEvent, stats, prizes, recentWinners, events } = mockData;

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
                                    <span>Event Date: {formatDate(currentEvent.date)}</span>
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
                                                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: prize.color }} />
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
                                                        className="h-2 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${(prize.stock / prize.totalStock) * 100}%`,
                                                            backgroundColor: prize.color,
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
                                            <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: winner.prize.color }} />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{winner.employee.name}</p>
                                                <p className="truncate text-xs text-gray-600 dark:text-gray-400">{winner.prize.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500">{formatTime(winner.timestamp)}</p>
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

                    {/* Events Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Events Overview
                            </CardTitle>
                            <CardDescription>All doorprize events and their status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {events.map((event) => (
                                    <div key={event.id} className="rounded-lg border p-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <Badge className={getStatusColor(event.status)}>
                                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                            </Badge>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(event.event_date)}</span>
                                        </div>
                                        <h3 className="mb-1 font-medium">{event.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{event.winners_count} winners</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
