import { motion } from "framer-motion";
import { AlertTriangle, CalendarDays, Gift, Plus, Trophy } from "lucide-react";

const NoActiveEventError: React.FC = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl text-center"
            >
                {/* Icon dan Judul */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8">
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <AlertTriangle size={120} className="text-amber-400 drop-shadow-lg" />
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                className="absolute -top-2 -right-2"
                            >
                                <CalendarDays size={40} className="text-red-400" />
                            </motion.div>
                        </div>
                    </div>
                    <h1 className="mb-4 text-4xl font-bold text-white">Tidak Ada Event Aktif</h1>
                    <p className="mb-2 text-xl text-slate-300">Saat ini tidak ada event doorprize yang sedang berjalan</p>
                    <p className="text-lg text-slate-400">Silakan buat atau aktifkan event terlebih dahulu untuk memulai undian</p>
                </motion.div>

                {/* Card Informasi */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg"
                >
                    <div className="mb-4 flex items-center justify-center gap-3">
                        <Gift className="text-amber-400" size={32} />
                        <h2 className="text-2xl font-semibold text-white">Doorprize System</h2>
                    </div>
                    <div className="space-y-3 text-slate-300">
                        <p className="flex items-center justify-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                            Kelola event doorprize dengan mudah
                        </p>
                        <p className="flex items-center justify-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                            Sistem undian yang fair dan transparan
                        </p>
                        <p className="flex items-center justify-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                            Tracking pemenang secara real-time
                        </p>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col justify-center gap-4 sm:flex-row"
                >
                    <motion.a
                        href="/events"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:from-emerald-700 hover:to-emerald-800 hover:shadow-xl"
                    >
                        <CalendarDays size={24} />
                        Kelola Events
                    </motion.a>

                    <motion.a
                        href="/events/create"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
                    >
                        <Plus size={24} />
                        Buat Event Baru
                    </motion.a>
                </motion.div>

                {/* Footer Info */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 text-sm text-slate-400">
                    <p>💡 Tip: Pastikan event sudah diaktifkan dan memiliki hadiah yang tersedia</p>
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 opacity-20">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                        <Gift size={60} className="text-amber-400" />
                    </motion.div>
                </div>
                <div className="absolute right-10 bottom-10 opacity-20">
                    <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}>
                        <Trophy size={80} className="text-emerald-400" />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default NoActiveEventError