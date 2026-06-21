"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import CampaignCard from "@/components/CampaignCard";
import UpgradeModal from "@/components/UpgradeModal";
import EmptyState from "@/components/EmptyState";
import type { Profile, Campaign } from "@/lib/types";
import { TIER_LABELS } from "@/lib/types";
import { DASHBOARD_POLL_INTERVAL } from "@/lib/constants";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [campaignLimits, setCampaignLimits] = useState({ maxCampaigns: 3, currentCount: 0 });
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      const [profileRes, campaignsRes] = await Promise.all([fetch("/api/profile"), fetch("/api/campaigns")]);
      const profileData = await profileRes.json();
      const campaignsData = await campaignsRes.json();
      if (!profileData.profile && !profileData.user) { router.push("/login"); return; }
      setProfile(profileData.profile);
      setCampaigns(campaignsData.campaigns || []);
      if (campaignsData.limits) setCampaignLimits(campaignsData.limits);
    } catch { router.push("/login"); }
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { const i = setInterval(loadData, DASHBOARD_POLL_INTERVAL); return () => clearInterval(i); }, [loadData]);

  const createCampaign = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newTitle.trim() }) });
      const data = await res.json();
      if (data.upgradeRequired) { setShowUpgrade(true); return; }
      if (data.campaign) {
        setCampaigns((prev) => [{ ...data.campaign, totalLeads: 0, completedLeads: 0, failedLeads: 0, pendingLeads: 0, processingLeads: 0 }, ...prev]);
        setNewTitle("");
      }
    } finally { setCreating(false); }
  };

  if (!profile) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-20 sm:pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Welcome, {profile.name || profile.email}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {profile.creditsRemaining} credits remaining
            <span className="ml-2 px-2 py-0.5 bg-orange-500/10 text-orange-500 text-xs rounded-full font-medium">{TIER_LABELS[profile.tier] || profile.tier}</span>
            {profile.role === "admin" && <span className="ml-2 px-2 py-0.5 bg-purple-500/10 text-purple-500 text-xs rounded-full font-medium">Admin</span>}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="p-5 sm:p-6 rounded-2xl mb-8" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(239,68,68,0.08))", border: "1px solid rgba(249,115,22,0.2)" }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Credits Available</p>
              <p className="text-3xl sm:text-4xl font-bold text-foreground">{profile.creditsRemaining}</p>
            </div>
            {profile.creditsRemaining < 10 && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowUpgrade(true)} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all">
                Upgrade Now
              </motion.button>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">Create Campaign</h2>
            <p className="text-sm text-muted-foreground">{campaignLimits.currentCount}/{campaignLimits.maxCampaigns === -1 ? "∞" : campaignLimits.maxCampaigns} campaigns</p>
          </div>
          <div className="flex gap-3">
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createCampaign()} placeholder="Campaign name (e.g., Q1 SaaS Outreach)" className="flex-1 px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all bg-input-bg border border-input-border" />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={createCampaign} disabled={creating || !newTitle.trim()} className="px-5 sm:px-6 py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 disabled:opacity-50 transition-all">
              {creating ? "Creating..." : "Create"}
            </motion.button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Your Campaigns</h2>
          {campaigns.length === 0 ? (
            <EmptyState
              title="No campaigns yet"
              description="Create one above to get started with AI-powered cold outreach."
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} onUpdated={loadData} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </main>
  );
}