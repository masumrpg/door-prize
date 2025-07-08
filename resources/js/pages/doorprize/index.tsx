import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Trophy, Users, ExternalLink, CalendarDays, Home } from 'lucide-react';
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

// Confetti Component
const Confetti: React.FC<{ isActive: boolean; fullScreen?: boolean }> = ({ isActive, fullScreen = false }) => {
    const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; x: number; y: number; color: string; rotation: number; size: number }>>([]);

    useEffect(() => {
        if (isActive) {
            const pieces = Array.from({ length: fullScreen ? 150 : 50 }, (_, i) => ({
                id: i,
                x: Math.random() * (fullScreen ? window.innerWidth : 300),
                y: Math.random() * (fullScreen ? window.innerHeight : 200),
                color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'][Math.floor(Math.random() * 8)],
                rotation: Math.random() * 360,
                size: Math.random() * 8 + 4
            }));
            setConfettiPieces(pieces);

            // Clear confetti after animation
            const timer = setTimeout(() => {
                setConfettiPieces([]);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isActive, fullScreen]);

    if (!isActive) return null;

    return (
        <div className={`pointer-events-none ${fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0'} overflow-hidden`}>
            {confettiPieces.map((piece) => (
                <motion.div
                    key={piece.id}
                    className="absolute"
                    style={{
                        left: piece.x,
                        top: piece.y,
                        backgroundColor: piece.color,
                        width: piece.size,
                        height: piece.size,
                        borderRadius: '50%',
                    }}
                    initial={{
                        opacity: 1,
                        scale: 0,
                        rotate: piece.rotation,
                        y: piece.y - 100
                    }}
                    animate={{
                        opacity: [1, 1, 0],
                        scale: [0, 1, 0.8],
                        rotate: piece.rotation + 360,
                        y: piece.y + (fullScreen ? 300 : 150),
                        x: piece.x + (Math.random() - 0.5) * 100
                    }}
                    transition={{
                        duration: 3,
                        ease: "easeOut"
                    }}
                />
            ))}
        </div>
    );
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

    // Confetti states
    const [showWinnerConfetti, setShowWinnerConfetti] = useState<boolean>(false);
    const [showFullScreenConfetti, setShowFullScreenConfetti] = useState<boolean>(false);

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
        setShowWinnerConfetti(false);
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
                    // Show confetti for winner
                    setShowWinnerConfetti(true);

                    // Update winners list
                    setWinners((prev) => [response.data.winner, ...prev]);

                    // Update prizes list with new stock
                    setPrizes((prev) => prev.map((prize) => (prize.id === currentPrize.id ? { ...prize, stock: response.data.prize.stock } : prize)));

                    // Reload available employees
                    await loadAvailableEmployees();

                    // Check if current prize stock is finished
                    if (response.data.prize.stock === 0) {
                        // Cek apakah ini hadiah terakhir yang habis
                        const updatedPrizes = prizes.map((p) => (p.id === currentPrize.id ? { ...p, stock: response.data.prize.stock } : p));
                        const isLastPrizeFinished = updatedPrizes.every((p) => p.stock === 0);

                        if (isLastPrizeFinished) {
                            // Show full screen confetti for all prizes finished
                            setTimeout(() => {
                                setShowFullScreenConfetti(true);
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
                setShowWinnerConfetti(false);
                setShowFullScreenConfetti(false);

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
                <Confetti isActive={showFullScreenConfetti} fullScreen={true} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center text-white px-4 max-w-2xl mx-auto"
                >
                    <Trophy size={100} className="mx-auto mb-6 text-amber-400" />
                    <h1 className="mb-4 text-2xl md:text-4xl font-bold">🎉 Semua Hadiah Telah Terbagi! 🎉</h1>
                    <p className="mb-8 text-lg md:text-xl text-slate-200">Terima kasih atas partisipasi semua karyawan</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resetDraw}
                            disabled={isDrawing}
                            className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl font-bold transition-colors hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50"
                        >
                            Reset Undian
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={goToAllWinners}
                            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl font-bold transition-colors hover:from-blue-700 hover:to-blue-800"
                        >
                            <ExternalLink size={20} />
                            Lihat Semua Pemenang
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            <Head title="Undian" />
            <Confetti isActive={showFullScreenConfetti} fullScreen={true} />

            <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 p-2 md:p-4">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 md:mb-8 text-center px-2"
                    >
                        <h1 className="mb-4 flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3 text-2xl md:text-3xl lg:text-5xl font-bold text-white">
                            <Gift className="text-amber-400" size={40} />
                            <span className="text-center">{event.name.toLocaleUpperCase()}</span>
                            <Gift className="text-amber-400" size={40} />
                        </h1>
                        <p className="flex flex-col sm:flex-row items-center justify-center gap-2 text-lg md:text-xl text-slate-300">
                            <Users size={20} />
                            <span>{event.date}</span>
                        </p>
                        <p className="text-base md:text-lg text-slate-400 mt-2">
                            Total {stats.totalEmployees} Karyawan Berpartisipasi
                        </p>

                        {/* Navigation Menu */}
                        <div className="mt-4 flex flex-wrap justify-center gap-2 md:gap-4">
                            <a
                                href="/dashboard"
                                className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 md:px-4 py-2 text-sm md:text-base font-medium text-white transition-colors hover:bg-slate-600"
                            >
                                <Home size={16} />
                                <span className="hidden sm:inline">Dashboard</span>
                            </a>
                            <a
                                href="/events"
                                className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 md:px-4 py-2 text-sm md:text-base font-medium text-white transition-colors hover:bg-slate-600"
                            >
                                <CalendarDays size={16} />
                                <span className="hidden sm:inline">Events</span>
                            </a>
                            <a
                                href="/prizes"
                                className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 md:px-4 py-2 text-sm md:text-base font-medium text-white transition-colors hover:bg-slate-600"
                            >
                                <Gift size={16} />
                                <span className="hidden sm:inline">Hadiah</span>
                            </a>
                        </div>
                    </motion.div>

                    {/* Main Content Grid */}
                    <div className="grid gap-4 md:gap-6 lg:gap-8 lg:grid-cols-3">
                        {/* Main Draw Area */}
                        <div className="lg:col-span-2 relative">
                            <Confetti isActive={showWinnerConfetti} />
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
                        </div>

                        {/* Current Prize Winners */}
                        <div className="lg:col-span-1">
                            <CurrentPrizeWinner
                                currentPrize={currentPrize}
                                currentPrizeWinners={currentPrizeWinners}
                            />
                        </div>
                    </div>

                    {/* Popups */}
                    <AnimatePresence>
                        {showFinishedPopup && (
                            <FinishedPopup
                                setShowAllPrizes={setShowAllPrizes}
                                setShowFinishedPopup={setShowFinishedPopup}
                            />
                        )}
                        {showStockFinishedPopup && (
                            <StockFinishedPopup
                                currentPrize={currentPrize}
                                setShowStockFinishedPopup={setShowStockFinishedPopup}
                            />
                        )}
                        {showAllPrizes && (
                            <AllWinnersModal
                                prizes={prizes}
                                winners={winners}
                                setShowAllPrizes={setShowAllPrizes}
                            />
                        )}
                        <Toaster richColors position="top-right" />
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
};

export default Doorprize;
