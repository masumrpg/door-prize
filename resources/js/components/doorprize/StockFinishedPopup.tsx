import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import React from 'react';
import { StockFinishedPopupProps } from '@/interface';

const StockFinishedPopup = ({currentPrize,setShowStockFinishedPopup}: StockFinishedPopupProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 max-w-md w-full text-center text-white shadow-2xl"
        >
            <div className="text-5xl mb-4">
                <AlertCircle size={60} className="mx-auto text-yellow-300" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Stok Habis!</h2>
            <p className="text-lg mb-6">
                Hadiah <strong>{currentPrize?.name}</strong> sudah habis terbagi!<br/>
                Melanjutkan ke hadiah berikutnya...
            </p>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStockFinishedPopup(false)}
                className="px-8 py-3 bg-yellow-500 text-black rounded-lg font-bold hover:bg-yellow-400 transition-colors"
            >
                OK, Lanjut
            </motion.button>
        </motion.div>
    </motion.div>
);

export default StockFinishedPopup
