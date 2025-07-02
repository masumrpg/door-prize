import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';
import React from 'react';

interface ResetConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const ResetConfirmationModal: React.FC<ResetConfirmationModalProps> = ({ isOpen, onConfirm, onCancel, isLoading = false }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={onCancel}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-md rounded-2xl border border-white/20 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                    disabled={isLoading}
                >
                    <X size={20} />
                </button>

                {/* Warning Icon */}
                <div className="mb-4 flex justify-center">
                    <div className="rounded-full border border-red-500/30 bg-red-500/20 p-3">
                        <AlertTriangle size={40} className="text-red-400" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="mb-2 text-center text-2xl font-bold text-white">Konfirmasi Reset</h2>

                {/* Message */}
                <div className="mb-6 space-y-2 text-center">
                    <p className="text-slate-200">Apakah Anda yakin ingin mereset semua data undian?</p>
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                        <p className="flex items-center justify-center gap-2 text-sm font-semibold text-red-300">
                            <AlertTriangle size={16} />
                            Semua pemenang akan dihapus!
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 rounded-xl bg-slate-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Batal
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 font-semibold text-white transition-all hover:from-red-700 hover:to-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Mereset...
                            </>
                        ) : (
                            <>
                                <RotateCcw size={18} />
                                Ya, Reset
                            </>
                        )}
                    </motion.button>
                </div>

                {/* Additional Warning */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-slate-400">Tindakan ini tidak dapat dibatalkan</p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ResetConfirmationModal;
