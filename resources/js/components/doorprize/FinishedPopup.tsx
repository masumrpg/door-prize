import { motion } from 'framer-motion';
import { FinishedPopupProps } from '@/interface';
import { router } from '@inertiajs/react';

// Popup Components
const FinishedPopup = ({ setShowFinishedPopup, setShowAllPrizes }: FinishedPopupProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
        <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="w-full max-w-md rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 p-8 text-center text-white shadow-2xl"
        >
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mb-4 text-6xl">
                🎉
            </motion.div>
            <h2 className="mb-4 text-2xl font-bold">Selamat!</h2>
            <p className="mb-6 text-lg">
                Semua hadiah doorprize telah terbagi kepada para pemenang!
                <br />
                Terima kasih atas partisipasi semua karyawan.
            </p>
            <div className="flex gap-3">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setShowFinishedPopup(false);
                        setShowAllPrizes(true);
                    }}
                    className="flex-1 rounded-lg bg-white/20 px-6 py-3 font-bold transition-colors hover:bg-white/30"
                >
                    Lihat Semua Pemenang
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setShowFinishedPopup(false);
                        router.visit('/doorprize');
                    }}
                    className="flex-1 rounded-lg bg-yellow-500 px-6 py-3 font-bold text-black transition-colors hover:bg-yellow-400"
                >
                    Ok
                </motion.button>
            </div>
        </motion.div>
    </motion.div>
);

export default FinishedPopup
