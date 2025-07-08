import { Employee, Prize, Winner } from '@/interface';
import { motion } from 'framer-motion';
import { ExternalLink, Package, Pause, Play, RotateCcw, Users } from 'lucide-react';

interface MainDrawAreaProps {
    currentPrize: Prize | null;
    loadingEmployees: boolean;
    availableEmployees: Employee[];
    currentPrizeWinners: Winner[];
    prizes: Prize[];
    goToPrevPrize: () => void;
    isSpinning: boolean;
    isDrawing: boolean;
    currentEmployee: Employee;
    spinCounter: number;
    currentPrizeIndex: number;
    goToNextPrize: () => void;
    showWinner: boolean;
    resetDraw: () => Promise<void>;
    startDraw: () => Promise<(() => void) | undefined>;
    goToAllWinners: () => Promise<void>;
}

export default function MainDrawArea({
    currentPrize,
    loadingEmployees,
    availableEmployees,
    currentPrizeWinners,
    prizes,
    goToPrevPrize,
    isDrawing,
    isSpinning,
    currentEmployee,
    spinCounter,
    currentPrizeIndex,
    goToNextPrize,
    showWinner,
    resetDraw,
    startDraw,
    goToAllWinners,
}: MainDrawAreaProps) {
    return (
        <div className="space-y-6 lg:col-span-2">
            {/* Current Prize with Stock */}
            {currentPrize && (
                <motion.div
                    key={currentPrize.id}
                    className={`bg-gradient-to-r ${currentPrize.color} relative rounded-2xl p-6 shadow-xl ${currentPrize.stock === 0 ? 'opacity-60' : ''}`}
                    whileHover={{ scale: currentPrize.stock > 0 ? 1.02 : 1 }}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    {currentPrize.stock === 0 && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/50">
                            <div className="rounded-lg bg-red-600/90 px-6 py-3 text-2xl font-bold text-white">HABIS</div>
                        </div>
                    )}

                    {/* Layout: Gambar di Kiri, Info di Kanan */}
                    <div className="flex flex-col items-center gap-6 text-white lg:flex-row">
                        {/* Gambar Hadiah */}
                        <div className="flex-shrink-0">
                            <div className="h-48 w-48 overflow-hidden rounded-2xl shadow-lg lg:h-64 lg:w-64">
                                <img
                                    src={currentPrize.imageUrl}
                                    alt={currentPrize.name}
                                    className="h-full w-full object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                            parent.innerHTML =
                                                '<div class="w-full h-full flex items-center justify-center text-8xl bg-white/20 rounded-2xl">🎁</div>';
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Informasi Hadiah */}
                        <div className="flex-1 space-y-4 text-center lg:text-left">
                            <h2 className="text-3xl font-bold lg:text-4xl">{currentPrize.name}</h2>

                            {/* Stats dalam Grid */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex items-center justify-center gap-2 rounded-lg bg-white/15 px-4 py-3 lg:justify-start">
                                    <Package size={24} />
                                    <span className="text-lg font-semibold">Stok: {currentPrize.stock}</span>
                                </div>
                                <div className="flex items-center justify-center gap-2 rounded-lg bg-white/15 px-4 py-3 lg:justify-start">
                                    <Users size={24} />
                                    <span className="text-lg font-semibold">Tersedia: {loadingEmployees ? '...' : availableEmployees.length}</span>
                                </div>
                            </div>

                            {/* Progress Bar untuk Pemenang */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Progress Pemenang</span>
                                    <span>{Math.round((currentPrizeWinners.length / currentPrize.totalStock) * 100)}%</span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-white/20">
                                    <div
                                        className="h-3 rounded-full bg-amber-400 transition-all duration-500"
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
                <div className="flex items-center justify-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={goToPrevPrize}
                        disabled={isSpinning || isDrawing}
                        className="flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-500 disabled:opacity-50"
                    >
                        ← Sebelumnya
                    </motion.button>

                    <div className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2">
                        <span className="text-sm text-white">
                            {currentPrizeIndex + 1} / {prizes.length}
                        </span>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={goToNextPrize}
                        disabled={isSpinning || isDrawing}
                        className="flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-500 disabled:opacity-50"
                    >
                        Selanjutnya →
                    </motion.button>
                </div>
            )}

            {/* Employee Display */}
            <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-lg">
                <div className="text-center">
                    <motion.div
                        key={`${currentEmployee.id}-${spinCounter}`}
                        initial={{ scale: 0.8, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                    >
                        <div className="text-8xl">{isSpinning ? '🎲' : showWinner ? '🎉' : '👤'}</div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">
                                {isSpinning ? 'Mengundi...' : showWinner ? 'PEMENANG!' : 'Siap Mengundi'}
                            </h3>
                            <motion.div
                                className="rounded-lg bg-slate-800/50 p-4 text-4xl font-bold text-amber-400"
                                animate={
                                    isSpinning
                                        ? {
                                              scale: [1, 1.1, 1],
                                              rotate: [0, 5, -5, 0],
                                          }
                                        : {}
                                }
                                transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.5 }}
                            >
                                {currentEmployee.name}
                            </motion.div>
                            <p className="text-sm text-slate-300">ID: {currentEmployee.id}</p>
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
                    disabled={
                        isSpinning || isDrawing || availableEmployees.length === 0 || !currentPrize || currentPrize.stock === 0 || loadingEmployees
                    }
                    className={`flex items-center gap-2 rounded-xl px-8 py-4 text-xl font-bold transition-all ${
                        isSpinning || isDrawing || availableEmployees.length === 0 || !currentPrize || currentPrize.stock === 0 || loadingEmployees
                            ? 'cursor-not-allowed bg-gray-500'
                            : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg hover:from-emerald-700 hover:to-emerald-800'
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
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-xl font-bold text-white shadow-lg transition-colors hover:from-red-700 hover:to-red-800 disabled:opacity-50"
                >
                    <RotateCcw size={24} />
                    Reset
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToAllWinners}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-xl font-bold text-white shadow-lg transition-colors hover:from-blue-700 hover:to-blue-800"
                >
                    <ExternalLink size={24} />
                    Semua Pemenang
                </motion.button>
            </div>

            {availableEmployees.length === 0 && currentPrize && currentPrize.stock > 0 && !loadingEmployees && (
                <div className="rounded-lg border border-amber-600/30 bg-amber-800/30 p-4 text-center text-amber-200">
                    ⚠️ Semua karyawan sudah memenangkan hadiah ini!
                </div>
            )}

            {currentPrize && currentPrize.stock === 0 && (
                <div className="rounded-lg border border-red-600/30 bg-red-800/30 p-4 text-center text-red-200">
                    🚫 Stok hadiah ini sudah habis! Silakan pilih hadiah lain.
                </div>
            )}

            {loadingEmployees && (
                <div className="rounded-lg border border-blue-600/30 bg-blue-800/30 p-4 text-center text-blue-200">
                    ⏳ Memuat data karyawan yang tersedia...
                </div>
            )}
        </div>
    );
}
