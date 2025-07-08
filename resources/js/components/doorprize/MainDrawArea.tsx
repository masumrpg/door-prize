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
        <div className="space-y-4 lg:col-span-2 lg:space-y-6">
            {/* Current Prize with Stock */}
            {currentPrize && (
                <motion.div
                    key={currentPrize.id}
                    className={`bg-gradient-to-r ${currentPrize.color} relative rounded-xl p-4 shadow-xl sm:rounded-2xl sm:p-6 ${currentPrize.stock === 0 ? 'opacity-60' : ''}`}
                    whileHover={{ scale: currentPrize.stock > 0 ? 1.02 : 1 }}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    {currentPrize.stock === 0 && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/50 sm:rounded-2xl">
                            <div className="rounded-lg bg-red-600/90 px-4 py-2 text-lg font-bold text-white sm:px-6 sm:py-3 sm:text-2xl">HABIS</div>
                        </div>
                    )}

                    {/* Layout: Responsif dengan Flexbox */}
                    <div className="flex flex-col items-center gap-4 text-white sm:gap-6 lg:flex-row">
                        {/* Gambar Hadiah */}
                        <div className="flex-shrink-0">
                            <div className="h-32 w-32 overflow-hidden rounded-xl shadow-lg sm:h-40 sm:w-40 md:h-48 md:w-48 lg:h-56 lg:w-56 xl:h-64 xl:w-64">
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
                                                '<div class="w-full h-full flex items-center justify-center text-4xl sm:text-6xl md:text-8xl bg-white/20 rounded-xl">🎁</div>';
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Informasi Hadiah */}
                        <div className="flex-1 space-y-3 text-center sm:space-y-4 lg:text-left">
                            <h2 className="text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">{currentPrize.name}</h2>

                            {/* Stats dalam Grid */}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                                <div className="flex items-center justify-center gap-2 rounded-lg bg-white/15 px-3 py-2 sm:px-4 sm:py-3 lg:justify-start">
                                    <Package size={20} className="sm:h-6 sm:w-6" />
                                    <span className="text-sm font-semibold sm:text-base lg:text-lg">Stok: {currentPrize.stock}</span>
                                </div>
                                <div className="flex items-center justify-center gap-2 rounded-lg bg-white/15 px-3 py-2 sm:px-4 sm:py-3 lg:justify-start">
                                    <Users size={20} className="sm:h-6 sm:w-6" />
                                    <span className="text-sm font-semibold sm:text-base lg:text-lg">Tersedia: {loadingEmployees ? '...' : availableEmployees.length}</span>
                                </div>
                            </div>

                            {/* Progress Bar untuk Pemenang */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs sm:text-sm">
                                    <span>Progress Pemenang</span>
                                    <span>{Math.round((currentPrizeWinners.length / currentPrize.totalStock) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-white/20 sm:h-3">
                                    <div
                                        className="h-2 rounded-full bg-amber-400 transition-all duration-500 sm:h-3"
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
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={goToPrevPrize}
                        disabled={isSpinning || isDrawing}
                        className="flex items-center gap-1 rounded-lg bg-slate-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-500 disabled:opacity-50 sm:gap-2 sm:px-4 sm:text-base"
                    >
                        ← <span className="hidden sm:inline">Sebelumnya</span>
                    </motion.button>

                    <div className="flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 sm:px-4">
                        <span className="text-xs text-white sm:text-sm">
                            {currentPrizeIndex + 1} / {prizes.length}
                        </span>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={goToNextPrize}
                        disabled={isSpinning || isDrawing}
                        className="flex items-center gap-1 rounded-lg bg-slate-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-500 disabled:opacity-50 sm:gap-2 sm:px-4 sm:text-base"
                    >
                        <span className="hidden sm:inline">Selanjutnya</span> →
                    </motion.button>
                </div>
            )}

            {/* Employee Display */}
            <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-lg sm:rounded-2xl sm:p-6 lg:p-8">
                <div className="text-center">
                    <motion.div
                        key={`${currentEmployee.id}-${spinCounter}`}
                        initial={{ scale: 0.8, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3 sm:space-y-4"
                    >
                        <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl">{isSpinning ? '🎲' : showWinner ? '🎉' : '👤'}</div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-white sm:text-xl md:text-2xl">
                                {isSpinning ? 'Mengundi...' : showWinner ? 'PEMENANG!' : 'Siap Mengundi'}
                            </h3>
                            <motion.div
                                className="mx-auto max-w-xs rounded-lg bg-slate-800/50 p-3 text-xl font-bold text-amber-400 sm:max-w-sm sm:p-4 sm:text-2xl md:text-3xl lg:text-4xl"
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
                            <p className="text-xs text-slate-300 sm:text-sm">ID: {currentEmployee.id}</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startDraw}
                    disabled={
                        isSpinning || isDrawing || availableEmployees.length === 0 || !currentPrize || currentPrize.stock === 0 || loadingEmployees
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-bold transition-all sm:px-6 sm:py-4 sm:text-lg lg:px-8 lg:text-xl ${
                        isSpinning || isDrawing || availableEmployees.length === 0 || !currentPrize || currentPrize.stock === 0 || loadingEmployees
                            ? 'cursor-not-allowed bg-gray-500'
                            : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg hover:from-emerald-700 hover:to-emerald-800'
                    }`}
                >
                    {isSpinning ? <Pause size={20} className="sm:h-6 sm:w-6" /> : <Play size={20} className="sm:h-6 sm:w-6" />}
                    <span className="text-center">
                        {isDrawing ? 'Menyimpan...' : isSpinning ? 'Sedang Mengundi...' : currentPrize?.stock === 0 ? 'Stok Habis' : 'Mulai Undian'}
                    </span>
                </motion.button>

                <div className="flex gap-2 sm:gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetDraw}
                        disabled={isDrawing}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 text-base font-bold text-white shadow-lg transition-colors hover:from-red-700 hover:to-red-800 disabled:opacity-50 sm:flex-none sm:px-6 sm:py-4 sm:text-lg lg:text-xl"
                    >
                        <RotateCcw size={20} className="sm:h-6 sm:w-6" />
                        <span className="hidden sm:inline">Reset</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={goToAllWinners}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-base font-bold text-white shadow-lg transition-colors hover:from-blue-700 hover:to-blue-800 sm:flex-none sm:px-6 sm:py-4 sm:text-lg lg:text-xl"
                    >
                        <ExternalLink size={20} className="sm:h-6 sm:w-6" />
                        <span className="hidden sm:inline">Semua Pemenang</span>
                        <span className="sm:hidden">Pemenang</span>
                    </motion.button>
                </div>
            </div>

            {/* Alert Messages */}
            {availableEmployees.length === 0 && currentPrize && currentPrize.stock > 0 && !loadingEmployees && (
                <div className="rounded-lg border border-amber-600/30 bg-amber-800/30 p-3 text-center text-sm text-amber-200 sm:p-4 sm:text-base">
                    ⚠️ Semua karyawan sudah memenangkan hadiah ini!
                </div>
            )}

            {currentPrize && currentPrize.stock === 0 && (
                <div className="rounded-lg border border-red-600/30 bg-red-800/30 p-3 text-center text-sm text-red-200 sm:p-4 sm:text-base">
                    🚫 Stok hadiah ini sudah habis! Silakan pilih hadiah lain.
                </div>
            )}

            {loadingEmployees && (
                <div className="rounded-lg border border-blue-600/30 bg-blue-800/30 p-3 text-center text-sm text-blue-200 sm:p-4 sm:text-base">
                    ⏳ Memuat data karyawan yang tersedia...
                </div>
            )}
        </div>
    );
}
