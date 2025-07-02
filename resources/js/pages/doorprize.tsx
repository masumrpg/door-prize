import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Play, Pause, RotateCcw, Trophy, Users, ExternalLink, Package } from 'lucide-react';
import { Employee, Prize, Winner } from '@/interface';
import AllWinnersModal from '@/components/doorprize/AllWinnersModal';
import FinishedPopup from '@/components/doorprize/FinishedPopup';
import StockFinishedPopup from '@/components/doorprize/StockFinishedPopup';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

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
    stats: EmployeeStats
};

const DoorprizeApp: React.FC = () => {
    const { employees, prizes: initPrizes, winners: initWinners, event, stats } = usePage<PageProps>().props;

    console.log("Employees",employees);
    console.log("Winner",initWinners);
    console.log("Event",event);
    console.log("Prize",initPrizes);
    console.log("Stats",stats);

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
        return winners.filter(winner => winner.prize.id === currentPrize.id);
    }, [winners, currentPrize]);

    // Check if all prizes are out of stock
    const allPrizesFinished = useMemo(() => {
        return prizes.every(prize => prize.stock === 0);
    }, [prizes]);

    // Effect to show finished popup when all prizes are done
    useEffect(() => {
        if (allPrizesFinished && winners.length > 0 && !showFinishedPopup) {
            setShowFinishedPopup(true);
        }
    }, [allPrizesFinished, winners.length, showFinishedPopup]);

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
        setSpinCounter(prev => prev + 1);
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
            setSpinCounter(prev => prev + 1);

            setIsSpinning(false);

            try {
                // Call API to draw winner
                const response = await axios.post('/doorprize/draw', {
                    prize_id: currentPrize.id,
                    employee_id: finalWinner.id
                });

                if (response.data.success) {
                    setShowWinner(true);

                    // Update winners list
                    setWinners(prev => [response.data.winner, ...prev]);

                    // Update prizes list with new stock
                    setPrizes(prev => prev.map(prize =>
                        prize.id === currentPrize.id
                            ? { ...prize, stock: response.data.prize.stock }
                            : prize
                    ));

                    // Reload available employees
                    await loadAvailableEmployees();

                    // Check if current prize stock is finished
                    if (response.data.prize.stock === 0) {
                        setTimeout(() => {
                            setShowStockFinishedPopup(true);
                        }, 2000);
                    }
                } else {
                    alert('Gagal melakukan undian: ' + response.data.error);
                }
            } catch (error: unknown) {
                console.error('Error drawing winner:', error);
                if (axios.isAxiosError(error)) {
                    alert('Terjadi kesalahan: ' + (error.response?.data?.error || error.message));
                } else if (error instanceof Error) {
                    alert('Terjadi kesalahan umum: ' + error.message);
                } else {
                    alert('Kesalahan tidak diketahui');
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

                alert('Data undian berhasil direset!');
            } else {
                alert('Gagal mereset data: ' + response.data.error);
            }
        } catch (error: unknown) {
            console.error('Error resetting draw:', error);
            if (axios.isAxiosError(error)) {
                alert('Terjadi kesalahan: ' + (error.response?.data?.error || error.message));
            } else if (error instanceof Error) {
                alert('Terjadi kesalahan umum: ' + error.message);
            } else {
                alert('Kesalahan tidak diketahui');
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
            <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 p-4 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center text-white"
                >
                    <Trophy size={100} className="mx-auto mb-6 text-amber-400" />
                    <h1 className="text-4xl font-bold mb-4">🎉 Semua Hadiah Telah Terbagi! 🎉</h1>
                    <p className="text-xl mb-8 text-slate-200">Terima kasih atas partisipasi semua karyawan</p>
                    <div className="flex gap-4 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resetDraw}
                            disabled={isDrawing}
                            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-xl font-bold text-xl transition-colors disabled:opacity-50"
                        >
                            Mulai Ulang
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={goToAllWinners}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-bold text-xl flex items-center gap-2 transition-colors"
                        >
                            <ExternalLink size={24} />
                            Lihat Semua Pemenang
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                        <Gift className="text-amber-400" size={50} />
                        DOORPRIZE
                        <Gift className="text-amber-400" size={50} />
                    </h1>
                    <p className="text-xl text-slate-300 flex items-center justify-center gap-2">
                        <Users size={24} />
                        {event.name} - {event.date}
                    </p>
                    <p className="text-lg text-slate-400">
                        Total {stats.totalEmployees} Karyawan Berpartisipasi
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Draw Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Current Prize with Stock */}
                        {currentPrize && (
                            <motion.div
                                key={currentPrize.id}
                                className={`bg-gradient-to-r ${currentPrize.color} p-6 rounded-2xl shadow-xl relative ${currentPrize.stock === 0 ? 'opacity-60' : ''}`}
                                whileHover={{ scale: currentPrize.stock > 0 ? 1.02 : 1 }}
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                {currentPrize.stock === 0 && (
                                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10">
                                        <div className="text-white text-2xl font-bold bg-red-600/90 px-6 py-3 rounded-lg">
                                            HABIS
                                        </div>
                                    </div>
                                )}

                                {/* Layout: Gambar di Kiri, Info di Kanan */}
                                <div className="flex flex-col lg:flex-row items-center gap-6 text-white">
                                    {/* Gambar Hadiah */}
                                    <div className="flex-shrink-0">
                                        <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-2xl overflow-hidden shadow-lg">
                                            <img
                                                src={currentPrize.imageUrl}
                                                alt={currentPrize.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-8xl bg-white/20 rounded-2xl">🎁</div>';
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Informasi Hadiah */}
                                    <div className="flex-1 text-center lg:text-left space-y-4">
                                        <h2 className="text-3xl lg:text-4xl font-bold">{currentPrize.name}</h2>

                                        {/* Stats dalam Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/15 px-4 py-3 rounded-lg">
                                                <Package size={24} />
                                                <span className="text-lg font-semibold">Stok: {currentPrize.stock}</span>
                                            </div>
                                            <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/15 px-4 py-3 rounded-lg">
                                                <Users size={24} />
                                                <span className="text-lg font-semibold">
                                                    Tersedia: {loadingEmployees ? '...' : availableEmployees.length}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress Bar untuk Pemenang */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Progress Pemenang</span>
                                                <span>{Math.round((currentPrizeWinners.length / currentPrize.totalStock) * 100)}%</span>
                                            </div>
                                            <div className="w-full bg-white/20 rounded-full h-3">
                                                <div
                                                    className="bg-amber-400 h-3 rounded-full transition-all duration-500"
                                                    style={{ width: `${(currentPrizeWinners.length / currentPrize.totalStock) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Prize Navigation */}
                        {prizes.length > 1 && (
                            <div className="flex justify-center items-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={goToPrevPrize}
                                    disabled={isSpinning || isDrawing}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-slate-500 transition-colors"
                                >
                                    ← Sebelumnya
                                </motion.button>

                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg">
                                    <span className="text-white text-sm">
                                        {currentPrizeIndex + 1} / {prizes.length}
                                    </span>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={goToNextPrize}
                                    disabled={isSpinning || isDrawing}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-slate-500 transition-colors"
                                >
                                    Selanjutnya →
                                </motion.button>
                            </div>
                        )}

                        {/* Employee Display */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                            <div className="text-center">
                                <motion.div
                                    key={`${currentEmployee.id}-${spinCounter}`}
                                    initial={{ scale: 0.8, opacity: 0.8 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4"
                                >
                                    <div className="text-8xl">
                                        {isSpinning ? '🎲' : showWinner ? '🎉' : '👤'}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-white">
                                            {isSpinning ? 'Mengundi...' : showWinner ? 'PEMENANG!' : 'Siap Mengundi'}
                                        </h3>
                                        <motion.div
                                            className="text-4xl font-bold text-amber-400 bg-slate-800/50 rounded-lg p-4"
                                            animate={isSpinning ? {
                                                scale: [1, 1.1, 1],
                                                rotate: [0, 5, -5, 0]
                                            } : {}}
                                            transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.5 }}
                                        >
                                            {currentEmployee.name}
                                        </motion.div>
                                        <p className="text-slate-300 text-sm">ID: {currentEmployee.id}</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex justify-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startDraw}
                                disabled={isSpinning || isDrawing || availableEmployees.length === 0 || !currentPrize || currentPrize.stock === 0 || loadingEmployees}
                                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-xl transition-all ${
                                    isSpinning || isDrawing || availableEmployees.length === 0 || !currentPrize || currentPrize.stock === 0 || loadingEmployees
                                        ? 'bg-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg'
                                }`}
                            >
                                {isSpinning ? <Pause size={24} /> : <Play size={24} />}
                                {isDrawing ? 'Menyimpan...' : isSpinning ? 'Sedang Mengundi...' : currentPrize?.stock === 0 ? 'Stok Habis' : 'Mulai Undian'}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={resetDraw}
                                disabled={isDrawing}
                                className="flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg transition-colors disabled:opacity-50"
                            >
                                <RotateCcw size={24} />
                                Reset
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={goToAllWinners}
                                className="flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-colors"
                            >
                                <ExternalLink size={24} />
                                Semua Pemenang
                            </motion.button>
                        </div>

                        {availableEmployees.length === 0 && currentPrize && currentPrize.stock > 0 && !loadingEmployees && (
                            <div className="text-center text-amber-200 bg-amber-800/30 p-4 rounded-lg border border-amber-600/30">
                                ⚠️ Semua karyawan sudah memenangkan hadiah ini!
                            </div>
                        )}

                        {currentPrize && currentPrize.stock === 0 && (
                            <div className="text-center text-red-200 bg-red-800/30 p-4 rounded-lg border border-red-600/30">
                                🚫 Stok hadiah ini sudah habis! Silakan pilih hadiah lain.
                            </div>
                        )}

                        {loadingEmployees && (
                            <div className="text-center text-blue-200 bg-blue-800/30 p-4 rounded-lg border border-blue-600/30">
                                ⏳ Memuat data karyawan yang tersedia...
                            </div>
                        )}
                    </div>

                    {/* Current Prize Winners */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-h-[600px] overflow-y-auto">
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Trophy className="text-amber-400" />
                            Pemenang {currentPrize?.name || 'Hadiah'}
                        </h3>

                        <AnimatePresence>
                            {currentPrizeWinners.length === 0 ? (
                                <p className="text-slate-300 text-center py-8">Belum ada pemenang untuk hadiah ini</p>
                            ) : (
                                <div className="space-y-3">
                                    {currentPrizeWinners.map((winner) => (
                                        <motion.div
                                            key={winner.id}
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            className="bg-white/15 rounded-lg p-4 border border-white/20"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={winner.prize.imageUrl}
                                                        alt={winner.prize.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            const parent = target.parentElement;
                                                            if (parent) {
                                                                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl bg-white/20 rounded-lg">🎁</div>';
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="bg-amber-500 text-slate-900 text-xs px-2 py-1 rounded font-bold">
                                                                #{winner.winnerNumber}
                                                            </span>
                                                            <h4 className="font-black text-white">{winner.employee.name}</h4>
                                                        </div>
                                                    </div>
                                                    <p className="text-md font-semibold text-slate-100">{winner.prize.name}</p>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm text-slate-200">ID: {winner.employee.id}</p>
                                                        <p className="text-sm text-slate-200">{winner.timestamp}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>

                        {/* Prize Stock Info */}
                        {currentPrize && (
                            <div className="mt-6 pt-4 border-t border-white/20">
                                <div className="text-sm text-slate-300">
                                    <p>Total Hadiah: {currentPrize.totalStock}</p>
                                    <p>Sudah Terbagi: {currentPrizeWinners.length}</p>
                                    <p>Sisa: {currentPrize.stock}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Popups */}
                <AnimatePresence>
                    {showFinishedPopup && <FinishedPopup setShowAllPrizes={setShowAllPrizes} setShowFinishedPopup={setShowFinishedPopup} />}
                    {showStockFinishedPopup && <StockFinishedPopup currentPrize={currentPrize} setShowStockFinishedPopup={setShowStockFinishedPopup} />}
                    {showAllPrizes && <AllWinnersModal prizes={prizes} winners={winners} setShowAllPrizes={setShowAllPrizes} />}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DoorprizeApp;
