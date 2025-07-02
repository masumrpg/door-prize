import { motion } from 'framer-motion';
import { FinishedPopupProps } from '@/interface';

// Popup Components
const FinishedPopup = ({setShowFinishedPopup, setShowAllPrizes}:FinishedPopupProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
        <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-8 max-w-md w-full text-center text-white shadow-2xl"
        >
            <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl mb-4"
            >
                🎉
            </motion.div>
            <h2 className="text-2xl font-bold mb-4">Selamat!</h2>
            <p className="text-lg mb-6">
                Semua hadiah doorprize telah terbagi kepada para pemenang!<br/>
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
                    className="flex-1 px-6 py-3 bg-white/20 rounded-lg font-bold hover:bg-white/30 transition-colors"
                >
                    Lihat Semua Pemenang
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowFinishedPopup(false)}
                    className="flex-1 px-6 py-3 bg-yellow-500 text-black rounded-lg font-bold hover:bg-yellow-400 transition-colors"
                >
                    OK
                </motion.button>
            </div>
        </motion.div>
    </motion.div>
);

export default FinishedPopup
