"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import UpgradeModal from "@/components/UpgradeModal";
import type { Profile, Subscription, Payment } from "@/lib/types";
import { TIER_DETAILS } from "@/lib/types";

export default function BillingPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadProfile = useCallback(async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([fetch("/api/profile"), fetch("/api/stats")]);
      const profileData = await profileRes.json();
      if (!profileData.profile) { router.push("/login"); return; }
      setProfile(profileData.profile);
      const statsData = await statsRes.json();
      setSubscriptions(statsData.subscriptions || []);
      setPayments(statsData.payments || []);
    } catch { router.push("/login"); } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  if (loading || !profile) return <div className="min-h-screen pt-24 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" /></div>;

  const currentTier = profile.tier || "free";
  const currentTierDetails = TIER_DETAILS[currentTier] || TIER_DETAILS.free;

  return (
    <main className="min-h-screen pt-20 sm:pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">Billing</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="p-5 sm:p-6 rounded-2xl mb-5" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(239,68,68,0.08))", border: "1px solid rgba(249,115,22,0.2)" }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{currentTierDetails.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{profile.creditsRemaining} credits remaining</p>
              {subscriptions.length > 0 && subscriptions[0].currentPeriodEnd && <p className="text-xs text-muted-foreground mt-1">Renews {new Date(subscriptions[0].currentPeriodEnd).toLocaleDateString()}</p>}
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowUpgrade(true)} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all">
              {profile.tier !== "free" ? "Change Plan" : "Upgrade Plan"}
            </motion.button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-5">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Available Plans</h2>
          <div className="grid gap-4">
            {Object.entries(TIER_DETAILS).map(([key, plan]) => (
              <div key={key} className={`p-4 sm:p-5 rounded-xl ${currentTier === key ? "ring-1 ring-orange-500/30" : ""} bg-card border border-card-border`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-semibold text-foreground">{plan.name}</span>
                    {currentTier === key && <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-xs rounded-full font-medium">Current</span>}
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-foreground">{plan.price}</span>
                </div>
                <p className="text-sm text-orange-500 mb-2">{plan.credits}</p>
                <div className="flex flex-wrap gap-1.5">
                  {plan.features.map((f) => <span key={f} className="px-2 py-1 text-xs rounded-lg bg-input-bg text-muted">{f}</span>)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {payments.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mb-5">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Payment History</h2>
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="p-4 rounded-xl flex items-center justify-between bg-card border border-card-border">
                  <div>
                    <p className="text-foreground font-medium capitalize">{p.tier} Plan</p>
                    <p className="text-sm text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()} · {p.creditsAdded} credits</p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground font-semibold">${(p.amount / 100).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "succeeded" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {subscriptions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Subscriptions</h2>
            <div className="space-y-3">
              {subscriptions.map((s) => (
                <div key={s.id} className="p-4 rounded-xl flex items-center justify-between bg-card border border-card-border">
                  <div>
                    <p className="text-foreground font-medium capitalize">{s.tier} Plan</p>
                    <p className="text-sm text-muted-foreground">{s.creditsPerPeriod} credits/period{s.currentPeriodEnd && <> · Ends {new Date(s.currentPeriodEnd).toLocaleDateString()}</>}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "active" ? "bg-green-500/10 text-green-500" : s.status === "canceled" ? "bg-muted text-muted-foreground" : "bg-yellow-500/10 text-yellow-500"}`}>{s.status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </div>
    </main>
  );
}