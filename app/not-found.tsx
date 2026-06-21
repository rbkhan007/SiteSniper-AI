"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <main className="min-h-screen pt-16 flex items-center justify-center px-4 bg-hero-gradient">
      <div className="absolute inset-0 bg-grid-dots opacity-30" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-center">
        <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.8 }} className="text-8xl sm:text-9xl font-bold text-primary/20 block">
          404
        </motion.span>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-4 mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md">The page you&apos;re looking for doesn&apos;t exist or has been moved. Try roasting a website instead.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all">
            Back to Home
          </Link>
          <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-all">
            Dashboard
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
