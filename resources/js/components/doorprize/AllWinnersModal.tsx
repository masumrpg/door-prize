import { AllWinnersModalProps } from '@/interface';
import { motion } from 'framer-motion';
import { Trophy, X, Package } from 'lucide-react';

// All Winners Modal Component
const AllWinnersModal = ({ prizes, winners, setShowAllPrizes }: AllWinnersModalProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        onClick={() => setShowAllPrizes(false)}
    >
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="h-[90vh] w-full max-w-6xl rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 border border-white/20 flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-3 text-3xl font-bold text-white">
                        <Trophy className="text-amber-400" />
                        Semua Pemenang Doorprize
                    </h2>
                    <button
                        onClick={() => setShowAllPrizes(false)}
                        className="text-white transition-colors hover:text-red-400 p-2 rounded-lg hover:bg-white/10"
                    >
                        <X size={32} />
                    </button>
                </div>
            </div>

            <div className="flex-1 px-6 pt-6 overflow-y-auto">
                <div className="grid gap-6 lg:grid-cols-2 pb-6">
                    {prizes.map((prize) => {
                        const prizeWinners = winners.filter((w) => w.prize.id === prize.id);
                        return (
                            <div key={prize.id} className={`bg-gradient-to-r ${prize.color} rounded-xl p-6 shadow-xl ${prize.stock === 0 ? 'ring-2 ring-amber-400' : ''}`}>
                                <div className="mb-4 flex items-center gap-4">
                                    {/* Prize Image */}
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
                                                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl bg-white/20 rounded-lg">🎁</div>';
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="text-white flex-1">
                                        <h3 className="text-xl font-bold mb-1">{prize.name}</h3>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1 bg-white/15 px-2 py-1 rounded">
                                                <Package size={16} />
                                                <span>Stok: {prize.stock}</span>
                                            </div>
                                            <span className="bg-white/15 px-2 py-1 rounded">
                                            {prizeWinners.length}/{prize.totalStock} terbagi
                                        </span>
                                            {prize.stock === 0 && (
                                                <span className="bg-amber-500 text-slate-900 px-2 py-1 rounded font-bold text-xs">
                                                HABIS
                                            </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-white/80 mb-1">
                                        <span>Progress Pemenang</span>
                                        <span>{Math.round((prizeWinners.length / prize.totalStock) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-white/20 rounded-full h-2">
                                        <div
                                            className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${(prizeWinners.length / prize.totalStock) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="max-h-48 space-y-2 overflow-y-auto">
                                    {prizeWinners.length === 0 ? (
                                        <p className="py-4 text-center text-white/70 bg-white/10 rounded-lg">
                                            Belum ada pemenang
                                        </p>
                                    ) : (
                                        prizeWinners.map((winner) => (
                                            <div key={winner.id} className="rounded-lg bg-white/15 p-3 border border-white/20">
                                                <div className="flex items-center gap-3">
                                                    {/* Winner Prize Image */}
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={winner.prize.imageUrl}
                                                            alt={winner.prize.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                                const parent = target.parentElement;
                                                                if (parent) {
                                                                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-lg bg-white/20 rounded-lg">🎁</div>';
                                                                }
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center gap-2">
                                                            <span className="rounded bg-amber-500 px-2 py-1 text-xs font-bold text-slate-900">
                                                                #{winner.winnerNumber}
                                                            </span>
                                                                <span className="font-bold text-white">{winner.employee.name}</span>
                                                            </div>
                                                            <span className="text-xs text-white/70">{winner.timestamp}</span>
                                                        </div>
                                                        <p className="text-xs text-white/70">ID: {winner.employee.id}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="p-6 border-t border-white/20 flex-shrink-0">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center text-white">
                    <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                        <div className="text-2xl font-bold text-amber-400">{winners.length}</div>
                        <div className="text-sm text-slate-300">Total Pemenang</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                        <div className="text-2xl font-bold text-emerald-400">{prizes.filter((p) => p.stock === 0).length}</div>
                        <div className="text-sm text-slate-300">Hadiah Habis</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                        <div className="text-2xl font-bold text-blue-400">{prizes.reduce((sum, p) => sum + (p.totalStock - p.stock), 0)}</div>
                        <div className="text-sm text-slate-300">Item Terbagi</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                        <div className="text-2xl font-bold text-purple-400">{prizes.reduce((sum, p) => sum + p.stock, 0)}</div>
                        <div className="text-sm text-slate-300">Sisa Stok</div>
                    </div>
                </div>
            </div>
        </motion.div>
    </motion.div>
);

export default AllWinnersModal;
