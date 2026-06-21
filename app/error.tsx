"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Application error:", error); }, [error]);

  return (
    <main className="min-h-screen pt-16 flex items-center justify-center px-4 bg-hero-gradient">
      <div className="absolute inset-0 bg-grid-dots opacity-30" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-center max-w-md">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-8">An unexpected error occurred. Please try again.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={reset} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all">
            Try Again
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => (window.location.href = "/")} className="px-6 py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-all">
            Go Home
          </motion.button>
        </div>
        {error.digest && <p className="mt-6 text-xs text-muted-foreground font-mono">Error ID: {error.digest}</p>}
      </motion.div>
    </main>
  );
}
