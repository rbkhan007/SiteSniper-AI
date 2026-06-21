"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps { isOpen: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void; }

export default function ConfirmDialog({ isOpen, title, message, confirmLabel = "Confirm", onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm px-4" onClick={onCancel}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md p-6 glass-strong rounded-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={onCancel} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={onConfirm} className="px-4 py-2 text-sm bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors font-medium">{confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
