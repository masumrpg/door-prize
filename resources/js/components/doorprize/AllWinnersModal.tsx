import { AllWinnersModalProps } from '@/interface';
import { motion } from 'framer-motion';
import { Trophy, X } from 'lucide-react';

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
            className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 p-6"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-3 text-3xl font-bold text-white">
                    <Trophy className="text-yellow-400" />
                    Semua Pemenang Doorprize
                </h2>
                <button onClick={() => setShowAllPrizes(false)} className="text-white transition-colors hover:text-red-400">
                    <X size={32} />
                </button>
            </div>

            <div className="grid max-h-[70vh] gap-6 overflow-y-auto lg:grid-cols-2">
                {prizes.map((prize) => {
                    const prizeWinners = winners.filter((w) => w.prize.id === prize.id);
                    return (
                        <div key={prize.id} className={`bg-gradient-to-r ${prize.color} rounded-xl p-6`}>
                            <div className="mb-4 flex items-center gap-4">
                                <div className="text-4xl">{prize.imageUrl}</div>
                                <div className="text-white">
                                    <h3 className="text-xl font-bold">{prize.name}</h3>
                                    <p className="text-sm opacity-90">
                                        {prizeWinners.length} dari {prize.totalStock} terbagi
                                    </p>
                                </div>
                            </div>

                            <div className="max-h-60 space-y-2 overflow-y-auto">
                                {prizeWinners.length === 0 ? (
                                    <p className="py-4 text-center text-white/70">Belum ada pemenang</p>
                                ) : (
                                    prizeWinners.map((winner) => (
                                        <div key={winner.id} className="rounded-lg bg-white/20 p-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <span className="rounded bg-yellow-500 px-2 py-1 text-xs font-bold text-black">
                                                            #{winner.winnerNumber}
                                                        </span>
                                                        <span className="font-bold text-white">{winner.employee.name}</span>
                                                    </div>
                                                    <p className="text-xs text-white/70">ID: {winner.employee.id}</p>
                                                </div>
                                                <span className="text-xs text-white/70">{winner.timestamp}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 border-t border-white/20 pt-4">
                <div className="grid grid-cols-3 gap-4 text-center text-white">
                    <div>
                        <div className="text-2xl font-bold text-yellow-400">{winners.length}</div>
                        <div className="text-sm opacity-80">Total Pemenang</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-400">{prizes.filter((p) => p.stock === 0).length}</div>
                        <div className="text-sm opacity-80">Hadiah Terbagi</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-blue-400">{prizes.reduce((sum, p) => sum + (p.totalStock - p.stock), 0)}</div>
                        <div className="text-sm opacity-80">Total Item Terbagi</div>
                    </div>
                </div>
            </div>
        </motion.div>
    </motion.div>
);

export default AllWinnersModal;
