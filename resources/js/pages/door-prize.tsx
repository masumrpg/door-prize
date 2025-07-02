
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Play, Pause, RotateCcw, Trophy, Users, ExternalLink, Package } from 'lucide-react';
import { Employee, Prize, Winner } from '@/interface';
import AllWinnersModal from '@/components/doorprize/AllWinnersModal';
import FinishedPopup from '@/components/doorprize/FinishedPopup';
import StockFinishedPopup from '@/components/doorprize/StockFinishedPopup';

// Generate 1400 sample employees
const generateEmployees = (): Employee[] => {
    const names: string[] = [
        'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fira', 'Gilang', 'Hani', 'Indra', 'Joko',
        'Kartika', 'Lisa', 'Masum', 'Nita', 'Oscar', 'Putri', 'Qori', 'Rian', 'Sari', 'Tono',
        'Ulfa', 'Vina', 'Wati', 'Xena', 'Yanto', 'Zara', 'Adi', 'Bella', 'Candra', 'Dina'
    ];

    const employees: Employee[] = [];
    for (let i = 1; i <= 1400; i++) {
        const randomName = names[Math.floor(Math.random() * names.length)];
        employees.push({
            id: `emp_${i}_${Math.random().toString(36).substr(2, 9)}`,
            name: `${randomName} ${i}`
        });
    }
    return employees;
};

const initialPrizes: Prize[] = [
    {
        id: 'kulkas',
        name: 'Kulkas 2 Pintu',
        imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300&h=300&fit=crop&crop=center',
        color: 'from-blue-600 to-blue-700',
        stock: 5,
        totalStock: 5
    },
    {
        id: 'tv',
        name: 'Smart TV 55"',
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop&crop=center',
        color: 'from-indigo-600 to-indigo-700',
        stock: 3,
        totalStock: 3
    },
    {
        id: 'iphone',
        name: 'iPhone 15 Pro',
        imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop&crop=center',
        color: 'from-slate-700 to-slate-800',
        stock: 2,
        totalStock: 2
    },
    {
        id: 'macbook',
        name: 'MacBook Air M3',
        imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop&crop=center',
        color: 'from-purple-600 to-purple-700',
        stock: 1,
        totalStock: 1
    },
    {
        id: 'watch',
        name: 'Apple Watch Series 9',
        imageUrl: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=300&h=300&fit=crop&crop=center',
        color: 'from-emerald-600 to-emerald-700',
        stock: 4,
        totalStock: 4
    },
    {
        id: 'voucher',
        name: 'Voucher Belanja 5 Juta',
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=300&fit=crop&crop=center',
        color: 'from-amber-600 to-amber-700',
        stock: 10,
        totalStock: 10
    },
    {
        id: 'sepeda',
        name: 'Sepeda Gunung',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
        color: 'from-teal-600 to-teal-700',
        stock: 2,
        totalStock: 2
    },
    {
        id: 'airpods',
        name: 'AirPods Pro',
        imageUrl: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=300&h=300&fit=crop&crop=center',
        color: 'from-rose-600 to-rose-700',
        stock: 6,
        totalStock: 6
    }
];

const DoorprizeApp: React.FC = () => {
    const [employees] = useState<Employee[]>(generateEmployees());
    const [currentEmployee, setCurrentEmployee] = useState<Employee>(employees[0]);
    const [isSpinning, setIsSpinning] = useState<boolean>(false);
    const [winners, setWinners] = useState<Winner[]>([]);
    const [prizes, setPrizes] = useState<Prize[]>(initialPrizes);
    const [currentPrizeIndex, setCurrentPrizeIndex] = useState<number>(0);
    const [showWinner, setShowWinner] = useState<boolean>(false);
    const [speed, setSpeed] = useState<number>(50);
    const [spinCounter, setSpinCounter] = useState<number>(0);

    // New states for popups and all prizes view
    const [showFinishedPopup, setShowFinishedPopup] = useState<boolean>(false);
    const [showAllPrizes, setShowAllPrizes] = useState<boolean>(false);
    const [showStockFinishedPopup, setShowStockFinishedPopup] = useState<boolean>(false);

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

    // Available employees (not yet won current prize)
    const availableEmployees = useMemo(() => {
        if (!currentPrize) return [];
        const currentPrizeWinnerIds = currentPrizeWinners.map(w => w.employee.id);
        return employees.filter(emp => !currentPrizeWinnerIds.includes(emp.id));
    }, [employees, currentPrizeWinners, currentPrize]);

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

    const startDraw = useCallback(() => {
        if (isSpinning || !currentPrize || currentPrize.stock === 0 || availableEmployees.length === 0) return;

        setIsSpinning(true);
        setShowWinner(false);
        setSpeed(50);

        // Gradually slow down the spinning
        const timer1 = setTimeout(() => setSpeed(100), 2000);
        const timer2 = setTimeout(() => setSpeed(200), 3000);
        const timer3 = setTimeout(() => setSpeed(400), 4000);
        const timer4 = setTimeout(() => {
            // Pick final winner from available employees
            const finalWinner = availableEmployees[Math.floor(Math.random() * availableEmployees.length)];
            setCurrentEmployee(finalWinner);
            setSpinCounter(prev => prev + 1);

            setIsSpinning(false);
            setShowWinner(true);

            if (currentPrize) {
                // Add winner to list using the final winner
                const winnerNumber = currentPrize.totalStock - currentPrize.stock + 1;
                const newWinner: Winner = {
                    id: `winner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    employee: finalWinner,
                    prize: { ...currentPrize },
                    timestamp: new Date().toLocaleTimeString('id-ID'),
                    winnerNumber
                };

                setWinners(prev => [newWinner, ...prev]);

                // Update prize stock
                setPrizes(prev => prev.map(prize =>
                    prize.id === currentPrize.id
                        ? { ...prize, stock: prize.stock - 1 }
                        : prize
                ));

                // Check if current prize stock is finished
                if (currentPrize.stock === 1) {
                    setTimeout(() => {
                        setShowStockFinishedPopup(true);
                    }, 2000);
                }
            }
        }, 5000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, [isSpinning, currentPrize, availableEmployees, prizes]);

    const resetDraw = useCallback(() => {
        setIsSpinning(false);
        setShowWinner(false);
        setWinners([]);
        setPrizes(initialPrizes);
        setCurrentPrizeIndex(0);
        setCurrentEmployee(employees[0]);
        setSpinCounter(0);
        setShowFinishedPopup(false);
        setShowStockFinishedPopup(false);
    }, [employees]);

    const goToAllWinners = useCallback(() => {
        setShowAllPrizes(true);
    }, []);

    const goToPrevPrize = useCallback(() => {
        const prevIndex = currentPrizeIndex === 0 ? prizes.length - 1 : currentPrizeIndex - 1;
        setCurrentPrizeIndex(prevIndex);
    }, [currentPrizeIndex, prizes.length]);

    const goToNextPrize = useCallback(() => {
        const nextIndex = (currentPrizeIndex + 1) % prizes.length;
        setCurrentPrizeIndex(nextIndex);
    }, [currentPrizeIndex, prizes.length]);

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
                            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-xl font-bold text-xl transition-colors"
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
                        DOORPRIZE KARYAWAN
                        <Gift className="text-amber-400" size={50} />
                    </h1>
                    <p className="text-xl text-slate-300 flex items-center justify-center gap-2">
                        <Users size={24} />
                        Total {employees.length} Karyawan Berpartisipasi
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
                                                <span className="text-lg font-semibold">
                                                    Pemenang: {currentPrizeWinners.length}/{currentPrize.totalStock}
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
                                    disabled={isSpinning}
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
                                    disabled={isSpinning}
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
                                disabled={isSpinning || availableEmployees.length === 0 || !currentPrize || currentPrize.stock === 0}
                                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-xl transition-all ${
                                    isSpinning || availableEmployees.length === 0 || !currentPrize || currentPrize.stock === 0
                                        ? 'bg-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg'
                                }`}
                            >
                                {isSpinning ? <Pause size={24} /> : <Play size={24} />}
                                {isSpinning ? 'Sedang Mengundi...' : currentPrize?.stock === 0 ? 'Stok Habis' : 'Mulai Undian'}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={resetDraw}
                                className="flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg transition-colors"
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

                        {availableEmployees.length === 0 && currentPrize && currentPrize.stock > 0 && (
                            <div className="text-center text-amber-200 bg-amber-800/30 p-4 rounded-lg border border-amber-600/30">
                                ⚠️ Semua karyawan sudah memenangkan hadiah ini!
                            </div>
                        )}

                        {currentPrize && currentPrize.stock === 0 && (
                            <div className="text-center text-red-200 bg-red-800/30 p-4 rounded-lg border border-red-600/30">
                                🚫 Stok hadiah ini sudah habis! Silakan pilih hadiah lain.
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
