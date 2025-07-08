import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift,  Trophy, Users, ExternalLink, CalendarDays, Home } from 'lucide-react';
import { Employee, Prize, Winner } from '@/interface';
import AllWinnersModal from '@/components/doorprize/AllWinnersModal';
import FinishedPopup from '@/components/doorprize/FinishedPopup';
import StockFinishedPopup from '@/components/doorprize/StockFinishedPopup';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { toast, Toaster } from 'sonner';
import CurrentPrizeWinner from '@/components/doorprize/CurrentPrizeWinner';
import MainDrawArea from '@/components/doorprize/MainDrawArea';

interface EmployeeStats {
    totalEmployees: number;
    totalWinners: number;
    availableCount: number;
}

type PageProps = {
    employees: Employee[];
    prizes: Prize[];
    winners: Winner[];
    event: {
        id: number;
        name: string;
        date: string;
    };
    stats: EmployeeStats;
};

const Doorprize: React.FC = () => {
    const { employees, prizes: initPrizes, winners: initWinners, event, stats } = usePage<PageProps>().props;

    const [currentEmployee, setCurrentEmployee] = useState<Employee>(employees[0]);
    const [isSpinning, setIsSpinning] = useState<boolean>(false);
    const [winners, setWinners] = useState<Winner[]>(initWinners);
    const [prizes, setPrizes] = useState<Prize[]>(initPrizes);
    const [currentPrizeIndex, setCurrentPrizeIndex] = useState<number>(0);
    const [showWinner, setShowWinner] = useState<boolean>(false);
    const [speed, setSpeed] = useState<number>(50);
    const [spinCounter, setSpinCounter] = useState<number>(0);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);

    // New states for popups and all prizes view
    const [showFinishedPopup, setShowFinishedPopup] = useState<boolean>(false);
    const [showAllPrizes, setShowAllPrizes] = useState<boolean>(false);
    const [showStockFinishedPopup, setShowStockFinishedPopup] = useState<boolean>(false);

    // Available employees for current prize
    const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);

    // Get current prize (show all prizes, not just available ones)
    const currentPrize = useMemo(() => {
        if (prizes.length === 0) return null;
        return prizes[currentPrizeIndex % prizes.length];
    }, [prizes, currentPrizeIndex]);

    // Get current prize winners
    const currentPrizeWinners = useMemo(() => {
        if (!currentPrize) return [];
        return winners.filter((winner) => winner.prize.id === currentPrize.id);
    }, [winners, currentPrize]);

    // Check if all prizes are out of stock
    const allPrizesFinished = useMemo(() => {
        return prizes.every((prize) => prize.stock === 0);
    }, [prizes]);

    // Load available employees when prize changes
    useEffect(() => {
        if (currentPrize) {
            loadAvailableEmployees();
        }
    }, [currentPrize]);

    // Function to load available employees from API
    const loadAvailableEmployees = useCallback(async () => {
        if (!currentPrize) return;

        setLoadingEmployees(true);
        try {
            const response = await axios.get('/doorprize/available-employees');
            setAvailableEmployees(response.data.employees);
        } catch (error) {
            console.error('Error loading available employees:', error);
            setAvailableEmployees([]);
        } finally {
            setLoadingEmployees(false);
        }
    }, [currentPrize]);

    // Spinning effect with useCallback to prevent re-renders
    const spinEmployee = useCallback(() => {
        if (availableEmployees.length === 0) return;
        const randomEmployee = availableEmployees[Math.floor(Math.random() * availableEmployees.length)];
        setCurrentEmployee(randomEmployee);
        setSpinCounter((prev) => prev + 1);
    }, [availableEmployees]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSpinning && availableEmployees.length > 0) {
            interval = setInterval(spinEmployee, speed);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isSpinning, speed, spinEmployee]);

    const startDraw = useCallback(async () => {
        if (isSpinning || isDrawing || !currentPrize || currentPrize.stock === 0 || availableEmployees.length === 0) return;

        setIsSpinning(true);
        setIsDrawing(true);
        setShowWinner(false);
        setSpeed(50);

        // Gradually slow down the spinning
        const timer1 = setTimeout(() => setSpeed(100), 2000);
        const timer2 = setTimeout(() => setSpeed(200), 3000);
        const timer3 = setTimeout(() => setSpeed(400), 4000);

        const timer4 = setTimeout(async () => {
            // Pick final winner from available employees
            const finalWinner = availableEmployees[Math.floor(Math.random() * availableEmployees.length)];
            setCurrentEmployee(finalWinner);
            setSpinCounter((prev) => prev + 1);

            setIsSpinning(false);

            try {
                // Call API to draw winner
                const response = await axios.post('/doorprize/draw', {
                    prize_id: currentPrize.id,
                    employee_id: finalWinner.id,
                });

                if (response.data.success) {
                    setShowWinner(true);

                    // Update winners list
                    setWinners((prev) => [response.data.winner, ...prev]);

                    // Update prizes list with new stock
                    setPrizes((prev) => prev.map((prize) => (prize.id === currentPrize.id ? { ...prize, stock: response.data.prize.stock } : prize)));

                    // Reload available employees
                    await loadAvailableEmployees();

                    // Check if current prize stock is finished
                    if (response.data.prize.stock === 0) {
                        setTimeout(() => {
                            setShowStockFinishedPopup(true);
                        }, 2000);
                    }

                    if (response.data.prize.stock === 0) {
                        // Cek apakah ini hadiah terakhir yang habis
                        const updatedPrizes = prizes.map((p) => (p.id === currentPrize.id ? { ...p, stock: response.data.prize.stock } : p));

                        const isLastPrizeFinished = updatedPrizes.every((p) => p.stock === 0);

                        if (isLastPrizeFinished) {
                            setTimeout(() => {
                                setShowFinishedPopup(true);
                            }, 2000);
                        } else {
                            setTimeout(() => {
                                setShowStockFinishedPopup(true);
                            }, 2000);
                        }
                    }
                } else {
                    console.error('Gagal melakukan undian: ' + response.data.error);
                    toast.error('Gagal melakukan undian', response.data.error);
                }
            } catch (error: unknown) {
                console.error('Error drawing winner:', error);
                if (axios.isAxiosError(error)) {
                    toast.error('Terjadi kesalahan', error.response?.data?.error || error);
                } else if (error instanceof Error) {
                    toast.error('Terjadi kesalahan umum :' + error.message);
                } else {
                    toast.error('Kesalahan tidak diketahui');
                }
            } finally {
                setIsDrawing(false);
            }
        }, 5000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, [isSpinning, isDrawing, currentPrize, availableEmployees, loadAvailableEmployees]);

    const resetDraw = useCallback(async () => {
        if (isDrawing) return;

        const confirmed = confirm('Apakah Anda yakin ingin mereset semua data undian? Semua pemenang akan dihapus!');
        if (!confirmed) return;

        try {
            const response = await axios.post('/doorprize/reset');

            if (response.data.success) {
                // Reset all states
                setIsSpinning(false);
                setShowWinner(false);
                setWinners([]);
                setPrizes(initPrizes);
                setCurrentPrizeIndex(0);
                setCurrentEmployee(employees[0]);
                setSpinCounter(0);
                setShowFinishedPopup(false);
                setShowStockFinishedPopup(false);

                // Reload available employees
                await loadAvailableEmployees();

                toast.success('Data undian berhasil direset!');
            } else {
                toast.error('Gagal mereset data: ' + response.data.error);
            }
        } catch (error: unknown) {
            console.error('Error resetting draw:', error);
            if (axios.isAxiosError(error)) {
                toast.error('Terjadi kesalahan: ' + (error.response?.data?.error || error.message));
            } else if (error instanceof Error) {
                toast.error('Terjadi kesalahan umum: ' + error.message);
            } else {
                toast.error('Kesalahan tidak diketahui');
            }
        }
    }, [isDrawing, initPrizes, employees, loadAvailableEmployees]);

    const loadAllWinners = useCallback(async () => {
        try {
            const response = await axios.get('/doorprize/winners');
            setWinners(response.data.winners);
            setPrizes(response.data.prizes);
        } catch (error) {
            console.error('Error loading all winners:', error);
        }
    }, []);

    const goToAllWinners = useCallback(async () => {
        await loadAllWinners();
        setShowAllPrizes(true);
    }, [loadAllWinners]);

    const goToPrevPrize = useCallback(() => {
        if (isSpinning || isDrawing) return;
        const prevIndex = currentPrizeIndex === 0 ? prizes.length - 1 : currentPrizeIndex - 1;
        setCurrentPrizeIndex(prevIndex);
    }, [currentPrizeIndex, prizes.length, isSpinning, isDrawing]);

    const goToNextPrize = useCallback(() => {
        if (isSpinning || isDrawing) return;
        const nextIndex = (currentPrizeIndex + 1) % prizes.length;
        setCurrentPrizeIndex(nextIndex);
    }, [currentPrizeIndex, prizes.length, isSpinning, isDrawing]);

    if (!currentPrize && allPrizesFinished) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 p-4">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center text-white">
                    <Trophy size={100} className="mx-auto mb-6 text-amber-400" />
                    <h1 className="mb-4 text-4xl font-bold">🎉 Semua Hadiah Telah Terbagi! atau Belum Bikin Hadiah! 🎉</h1>
                    <p className="mb-8 text-xl text-slate-200">Terima kasih atas partisipasi semua karyawan</p>
                    <div className="flex justify-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resetDraw}
                            disabled={isDrawing}
                            className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-4 text-xl font-bold transition-colors hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50"
                        >
                            Ke Hadiah
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={goToAllWinners}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-xl font-bold transition-colors hover:from-blue-700 hover:to-blue-800"
                        >
                            <ExternalLink size={24} />
                            Ke Dashboard
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            <Head title="Undian" />

            <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 p-4">
                <div className="mx-auto max-w-6xl">
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
                        <h1 className="mb-4 flex items-center justify-center gap-3 text-5xl font-bold text-white">
                            <Gift className="text-amber-400" size={50} />
                            {event.name.toLocaleUpperCase()}
                            <Gift className="text-amber-400" size={50} />
                        </h1>
                        <p className="flex items-center justify-center gap-2 text-xl text-slate-300">
                            <Users size={24} />
                            {event.date}
                        </p>
                        <p className="text-lg text-slate-400">Total {stats.totalEmployees} Karyawan Berpartisipasi</p>
                        <div className="mt-4 flex justify-center gap-4">
                            <a
                                href="/dashboard"
                                className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-600"
                            >
                                <Home size={18} />
                                Dashboard
                            </a>
                            <a
                                href="/events"
                                className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-600"
                            >
                                <CalendarDays size={18} />
                                Kelola Events
                            </a>
                            <a
                                href="/prizes"
                                className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-600"
                            >
                                <Gift size={18} />
                                Kelola Hadiah
                            </a>
                        </div>
                    </motion.div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Draw Area */}
                        <MainDrawArea
                            startDraw={startDraw}
                            isDrawing={isDrawing}
                            resetDraw={resetDraw}
                            prizes={prizes}
                            availableEmployees={availableEmployees}
                            showWinner={showWinner}
                            goToAllWinners={goToAllWinners}
                            loadingEmployees={loadingEmployees}
                            currentPrizeWinners={currentPrizeWinners}
                            currentPrize={currentPrize}
                            currentPrizeIndex={currentPrizeIndex}
                            isSpinning={isSpinning}
                            currentEmployee={currentEmployee}
                            goToNextPrize={goToNextPrize}
                            goToPrevPrize={goToPrevPrize}
                            spinCounter={spinCounter}
                        />

                        {/* Current Prize Winners */}
                        <CurrentPrizeWinner currentPrize={currentPrize} currentPrizeWinners={currentPrizeWinners}/>
                    </div>

                    {/* Popups */}
                    <AnimatePresence>
                        {showFinishedPopup && <FinishedPopup setShowAllPrizes={setShowAllPrizes} setShowFinishedPopup={setShowFinishedPopup} />}
                        {showStockFinishedPopup && (
                            <StockFinishedPopup currentPrize={currentPrize} setShowStockFinishedPopup={setShowStockFinishedPopup} />
                        )}
                        {showAllPrizes && <AllWinnersModal prizes={prizes} winners={winners} setShowAllPrizes={setShowAllPrizes} />}
                        <Toaster richColors position="top-right" />
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
};

export default Doorprize;
