import { Trophy } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { Prize, Winner } from '@/interface';

interface CurrentPrizeWinnerProps {
    currentPrize: Prize | null;
    currentPrizeWinners: Winner[];
}

export default function CurrentPrizeWinner({currentPrize, currentPrizeWinners}: CurrentPrizeWinnerProps) {
    return (
    <div className="max-h-[600px] overflow-y-auto rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg">
        <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold text-white">
            <Trophy className="text-amber-400" />
            Pemenang {currentPrize?.name || 'Hadiah'}
        </h3>

        <AnimatePresence>
            {currentPrizeWinners.length === 0 ? (
                <p className="py-8 text-center text-slate-300">Belum ada pemenang untuk hadiah ini</p>
            ) : (
                <div className="space-y-3">
                    {currentPrizeWinners.map((winner) => (
                        <motion.div
                            key={winner.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="rounded-lg border border-white/20 bg-white/15 p-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                                    <img
                                        src={winner.prize.imageUrl}
                                        alt={winner.prize.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                                parent.innerHTML =
                                                    '<div class="w-full h-full flex items-center justify-center text-2xl bg-white/20 rounded-lg">🎁</div>';
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="mb-1 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                                                <span className="rounded bg-amber-500 px-2 py-1 text-xs font-bold text-slate-900">
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
            <div className="mt-6 border-t border-white/20 pt-4">
                <div className="text-sm text-slate-300">
                    <p>Total Hadiah: {currentPrize.totalStock}</p>
                    <p>Sudah Terbagi: {currentPrizeWinners.length}</p>
                    <p>Sisa: {currentPrize.stock}</p>
                </div>
            </div>
        )}
    </div>
    )
}
