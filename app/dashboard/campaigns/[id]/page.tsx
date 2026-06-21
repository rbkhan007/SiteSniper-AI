"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import BulkProcessor from "@/components/BulkProcessor";
import StatusBadge from "@/components/StatusBadge";
import UpgradeModal from "@/components/UpgradeModal";
import EmptyState from "@/components/EmptyState";
import type { CampaignDetail, Lead } from "@/lib/types";
import { CAMPAIGN_POLL_INTERVAL } from "@/lib/constants";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState("free");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadCampaign = useCallback(async () => {
    try {
      const res = await fetch(`/api/campaigns/${params.id}`);
      const data = await res.json();
      if (!data.campaign) {
        router.push("/dashboard");
        return;
      }
      setCampaign(data.campaign);
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.profile) setUserTier(data.profile.tier || "free");
    } catch {}
  }, []);

  useEffect(() => {
    loadCampaign();
    loadProfile();
  }, [loadCampaign, loadProfile]);
  useEffect(() => {
    if (!campaign) return;
    const i = setInterval(loadCampaign, CAMPAIGN_POLL_INTERVAL);
    return () => clearInterval(i);
  }, [campaign, loadCampaign]);

  const startEditing = () => {
    if (!campaign) return;
    setEditTitle(campaign.title);
    setEditDesc(campaign.description || "");
    setEditing(true);
    setMenuOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !campaign) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim(), description: editDesc.trim() }),
      });
      if (res.ok) {
        setEditing(false);
        loadCampaign();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!campaign) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      });
      if (res.ok) router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!campaign) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, { method: "DELETE" });
      if (res.ok) router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !campaign)
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );

  const completed = campaign.leads.filter((l) => l.status === "completed").length;
  const failed = campaign.leads.filter((l) => l.status === "failed").length;
  const pending = campaign.leads.filter((l) => l.status === "pending").length;

  return (
    <main className="min-h-screen pt-20 sm:pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-orange-500 mb-4 transition-colors inline-block"
          >
            &larr; Back to Dashboard
          </Link>

          {editing ? (
            <div className="space-y-3 p-4 rounded-xl bg-card border border-card-border">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-input-bg border border-input-border"
                autoFocus
              />
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-input-bg border border-input-border"
                placeholder="Description (optional)"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || !editTitle.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 transition-all"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {campaign.title}
                </h1>
                {campaign.description && (
                  <p className="text-sm text-muted-foreground mb-1">{campaign.description}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {campaign.leads.length} leads &middot; {completed} completed &middot; {failed} failed &middot; {pending}{" "}
                  pending
                </p>
              </div>

              {/* Actions Menu */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Campaign actions"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-full mt-1 w-48 rounded-xl overflow-hidden z-50 bg-card border border-card-border shadow-lg"
                      >
                        <button
                          onClick={startEditing}
                          className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit Campaign
                        </button>
                        <button
                          onClick={() => { handleArchive(); setMenuOpen(false); }}
                          disabled={saving}
                          className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                            />
                          </svg>
                          Archive
                        </button>
                        <div className="border-t border-card-border" />
                        {confirmDelete ? (
                          <div className="px-4 py-3">
                            <p className="text-xs text-red-500 mb-2">Delete permanently? This cannot be undone.</p>
                            <div className="flex gap-2">
                              <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                              >
                                {saving ? "..." : "Yes, Delete"}
                              </button>
                              <button
                                onClick={() => setConfirmDelete(false)}
                                className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setConfirmDelete(true); }}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 flex items-center gap-2 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete Campaign
                          </button>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>

        {/* Bulk Processor */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="p-5 sm:p-6 rounded-2xl mb-8 bg-card border border-card-border"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Process Domains</h2>
          <BulkProcessor
            campaignId={campaign.id}
            hasBulkUpload={userTier !== "free" && userTier !== ""}
            onUpgradeRequired={() => setShowUpgrade(true)}
          />
        </motion.div>

        {/* Leads */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Leads</h2>
          {campaign.leads.length === 0 ? (
            <EmptyState
              title="No leads yet"
              description="Enter a domain above to get started with AI-powered roasts."
            />
          ) : (
            <div className="space-y-3">
              {campaign.leads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/dashboard/leads/${lead.id}`}
                  className="block"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-xl hover:border-orange-500/20 transition-all cursor-pointer bg-card border border-card-border"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-sm text-foreground">{lead.domain}</span>
                      <StatusBadge status={lead.status} />
                    </div>
                    {lead.viralRoast && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{lead.viralRoast}</p>
                    )}
                    {lead.outreachSubject && (
                      <p className="text-xs text-muted-foreground truncate">
                        Subject: {lead.outreachSubject}
                      </p>
                    )}
                    {lead.foundEmail && <p className="text-xs text-orange-500 mt-1">{lead.foundEmail}</p>}
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </main>
  );
}