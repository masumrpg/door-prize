import React, { useState, useEffect } from 'react';
import { Trophy, Package, Search, ArrowLeft } from 'lucide-react';
import { Prize, Winner } from '@/interface';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WinnersPageProps {
    initialWinners?: Winner[];
    initialPrizes?: Prize[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Pemenang Doorprize',
        href: '/doorprize/winners',
    },
];

export default function Winners({ initialWinners, initialPrizes }: WinnersPageProps) {
    const [winners, setWinners] = useState<Winner[]>(initialWinners || []);
    const [prizes, setPrizes] = useState<Prize[]>(initialPrizes || []);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedPrize, setSelectedPrize] = useState<string>('all');

    useEffect(() => {
        // Fetch winners data if not provided as props
        if (!initialWinners || !initialPrizes) {
            fetchWinners();
        } else {
            setLoading(false);
        }
    }, [initialWinners, initialPrizes]);

    const fetchWinners = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/doorprize/winners');
            setWinners(response.data.winners);
            setPrizes(response.data.prizes);
        } catch (error) {
            console.error('Error fetching winners:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter winners based on search term and selected prize
    const filteredWinners = winners.filter((winner) => {
        const matchesSearch = 
            winner.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            winner.employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            winner.prize.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesPrize = selectedPrize === 'all' || winner.prize.id === selectedPrize;
        
        return matchesSearch && matchesPrize;
    });

    // Prepare data for rendering

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pemenang Doorprize" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 overflow-x-auto">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Trophy className="h-8 w-8 text-amber-500" />
                            Pemenang Doorprize
                        </h1>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Dashboard
                            </Link>
                        </Button>
                    </div>
                    <p className="text-muted-foreground">Daftar semua pemenang doorprize dari acara yang sedang aktif.</p>
                </div>

                {/* Filter Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Pemenang</CardTitle>
                        <CardDescription>Cari dan filter pemenang berdasarkan nama atau hadiah</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Cari nama karyawan atau hadiah..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-64">
                                <Select
                                    value={selectedPrize}
                                    onValueChange={setSelectedPrize}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter berdasarkan hadiah" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Hadiah</SelectItem>
                                        {prizes.map((prize) => (
                                            <SelectItem key={prize.id} value={prize.id}>
                                                {prize.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Winners List */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {loading ? (
                        <div className="col-span-2 flex justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                <p>Memuat data pemenang...</p>
                            </div>
                        </div>
                    ) : filteredWinners.length === 0 ? (
                        <div className="col-span-2 bg-muted/50 rounded-lg p-8 text-center">
                            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-medium mb-2">Tidak ada pemenang ditemukan</h3>
                            <p className="text-muted-foreground">
                                {searchTerm || selectedPrize !== 'all' 
                                    ? 'Coba ubah filter pencarian Anda'
                                    : 'Belum ada pemenang yang terdaftar untuk acara ini'}
                            </p>
                        </div>
                    ) : (
                        prizes.map((prize) => {
                            const prizeWinners = filteredWinners.filter((w) => w.prize.id === prize.id);
                            if (selectedPrize !== 'all' && prize.id !== selectedPrize) return null;
                            if (prizeWinners.length === 0) return null;
                            
                            return (
                                <Card key={prize.id} className={`overflow-hidden border-t-4 ${prize.color || 'border-primary'}`}>
                                    <CardHeader className="flex flex-row items-start gap-4">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                                            <img
                                                src={prize.imageUrl}
                                                alt={prize.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl bg-muted rounded-lg">🎁</div>';
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle>{prize.name}</CardTitle>
                                            <CardDescription className="flex items-center gap-4 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <Package className="h-4 w-4" />
                                                    <span>Stok: {prize.stock}/{prize.totalStock}</span>
                                                </div>
                                                <span>•</span>
                                                <span>{prizeWinners.length} pemenang</span>
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                            {prizeWinners.map((winner) => (
                                                <div 
                                                    key={winner.id} 
                                                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-1 text-xs font-bold">
                                                                #{winner.winnerNumber}
                                                            </span>
                                                            <span className="font-medium">{winner.employee.name}</span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">{winner.timestamp}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">ID: {winner.employee.id}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Summary Statistics */}
                {!loading && filteredWinners.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistik Pemenang</CardTitle>
                            <CardDescription>Ringkasan statistik pemenang doorprize</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div className="bg-muted/50 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-amber-500">{winners.length}</div>
                                    <div className="text-sm text-muted-foreground">Total Pemenang</div>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-emerald-500">{prizes.filter((p) => p.stock === 0).length}</div>
                                    <div className="text-sm text-muted-foreground">Hadiah Habis</div>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-blue-500">{prizes.reduce((sum, p) => sum + (p.totalStock - p.stock), 0)}</div>
                                    <div className="text-sm text-muted-foreground">Item Terbagi</div>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-purple-500">{prizes.reduce((sum, p) => sum + p.stock, 0)}</div>
                                    <div className="text-sm text-muted-foreground">Sisa Stok</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}