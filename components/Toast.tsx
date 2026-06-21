"use client";

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Toast { id: string; message: string; type: "success" | "error" | "info"; }
interface ToastContextType { toast: (message: string, type?: Toast["type"]) => void; }

const ToastContext = createContext<ToastContextType>({ toast: () => {} });
export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-xs sm:max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 16, x: 16 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, x: 16 }}
              className={`px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm text-sm font-medium ${
                t.type === "success" ? "bg-green-500/15 text-green-500 border border-green-500/20"
                : t.type === "error" ? "bg-red-500/15 text-red-500 border border-red-500/20"
                : "bg-card border border-card-border text-foreground"
              }`}>
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
