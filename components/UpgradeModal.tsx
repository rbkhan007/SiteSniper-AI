"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface UpgradeModalProps { isOpen: boolean; onClose: () => void; }

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (tier: "growth" | "scale") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tier }) });
      const data = await res.json();

      if (res.status === 503) {
        // Stripe not configured — use dev test mode
        const testRes = await fetch("/api/stripe/test-upgrade", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tier }) });
        const testData = await testRes.json();
        if (!testRes.ok) {
          setError(testData.error || "Upgrade failed");
          return;
        }
        // Success — reload the page to reflect the new tier
        window.location.href = "/dashboard?upgraded=true";
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        setError(data.error);
      }
    } catch (e) {
      console.error("Checkout failed:", e);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm px-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="Upgrade plan">
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md p-6 sm:p-8 glass-strong rounded-3xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Upgrade Your Plan</h2>
              <p className="text-muted-foreground mt-2">Get more credits to crush your outreach</p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button onClick={() => handleUpgrade("growth")} disabled={loading} className="w-full p-4 sm:p-5 glass rounded-2xl text-left hover:border-orange-500/50 transition-all disabled:opacity-50">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-lg font-semibold text-foreground">Growth</span>
                    <span className="ml-2 px-2 py-0.5 bg-orange-500/10 text-orange-500 text-xs rounded-full font-medium">Popular</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-500">$49<span className="text-sm text-muted-foreground">/mo</span></span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">1,000 credits/month — Perfect for freelancers</p>
                <div className="flex flex-wrap gap-1.5">
                  {["25 campaigns", "Email delivery", "Priority processing", "RAG pipeline"].map((f) => <span key={f} className="px-2 py-1 text-xs rounded-lg bg-input-bg text-muted">{f}</span>)}
                </div>
              </button>

              <button onClick={() => handleUpgrade("scale")} disabled={loading} className="w-full p-4 sm:p-5 rounded-2xl text-left transition-all disabled:opacity-50 ring-2 ring-orange-500/30" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(239,68,68,0.08))" }}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-lg font-semibold text-foreground">Scale</span>
                    <span className="ml-2 px-2 py-0.5 bg-orange-500/10 text-orange-500 text-xs rounded-full font-medium">Best value</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-500">$99<span className="text-sm text-muted-foreground">/mo</span></span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">3,000 credits/month — Built for agencies</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Unlimited campaigns", "API access", "Bulk upload", "Priority support"].map((f) => <span key={f} className="px-2 py-1 text-xs rounded-lg bg-input-bg text-muted">{f}</span>)}
                </div>
              </button>
            </div>

            <button onClick={onClose} className="mt-5 w-full text-sm text-muted-foreground hover:text-orange-500 transition-colors">Maybe later</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
