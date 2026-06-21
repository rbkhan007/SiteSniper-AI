"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ViralRoastEngine() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ roast: string; painPoint: string; emailSubject: string; emailBody: string; foundEmail: string | null } | null>(null);
  const [error, setError] = useState("");

  const handleRoast = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/public-roast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain: domain.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze");
      setResult(data);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); } finally { setLoading(false); }
  };

  const inputCls = "flex-1 px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm sm:text-base bg-input-bg border border-input-border";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleRoast()} placeholder="Enter any website (e.g., example.com)" className={inputCls} disabled={loading} />
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleRoast} disabled={loading || !domain.trim()} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-orange-500/25 whitespace-nowrap">
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Roasting...
            </span>
          ) : "Roast This Site"}
        </motion.button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="mt-6 space-y-4">
            <div className="p-5 sm:p-6 glass-strong rounded-2xl">
              <h3 className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-2">The Roast</h3>
              <p className="text-base sm:text-lg text-foreground leading-relaxed">{result.roast}</p>
            </div>
            <div className="p-5 sm:p-6 glass-strong rounded-2xl">
              <h3 className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-2">Pain Point Detected</h3>
              <p className="text-sm sm:text-base text-foreground">{result.painPoint}</p>
            </div>
            <div className="p-5 sm:p-6 glass-strong rounded-2xl">
              <h3 className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-2">Cold Email Ready</h3>
              <p className="text-sm text-muted-foreground mb-2">Subject: {result.emailSubject}</p>
              <p className="text-sm sm:text-base text-foreground">{result.emailBody}</p>
            </div>
            <div className="text-center pt-4">
              <a href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all text-sm sm:text-base">
                Get 50 Free Lead Credits — Sign Up
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
