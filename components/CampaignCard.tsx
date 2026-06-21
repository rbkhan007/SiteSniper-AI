"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  isArchived: boolean;
  createdAt: string;
  totalLeads: number;
  completedLeads: number;
  failedLeads: number;
  pendingLeads: number;
  processingLeads: number;
}

interface CampaignCardProps {
  campaign: Campaign;
  onUpdated?: () => void;
}

export default function CampaignCard({ campaign, onUpdated }: CampaignCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(campaign.title);
  const [editDesc, setEditDesc] = useState(campaign.description || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const progress = campaign.totalLeads > 0 ? (campaign.completedLeads / campaign.totalLeads) * 100 : 0;

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleSave = async () => {
    if (!editTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim(), description: editDesc.trim() }),
      });
      if (res.ok) {
        setEditing(false);
        setMenuOpen(false);
        onUpdated?.();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      });
      if (res.ok) {
        setMenuOpen(false);
        onUpdated?.();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, { method: "DELETE" });
      if (res.ok) {
        setMenuOpen(false);
        onUpdated?.();
      }
    } finally {
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-5 sm:p-6 rounded-2xl bg-card border border-card-border"
        style={{ boxShadow: "0 0 0 1px var(--orange)" }}
      >
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-input-bg border border-input-border"
            placeholder="Campaign name"
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
              onClick={handleSave}
              disabled={saving || !editTitle.trim()}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 transition-all"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => { setEditing(false); setEditTitle(campaign.title); setEditDesc(campaign.description || ""); }}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="p-5 sm:p-6 rounded-2xl hover-card relative bg-card border border-card-border"
    >
      <Link href={`/dashboard/campaigns/${campaign.id}`}>
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 pr-8">{campaign.title}</h3>
        {campaign.description && (
          <p className="text-sm text-muted-foreground mb-1 line-clamp-1">{campaign.description}</p>
        )}
        <p className="text-xs text-muted-foreground mb-4">{formatDate(campaign.createdAt)}</p>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {campaign.completedLeads} / {campaign.totalLeads} processed
            </span>
            <span className="text-orange-500 font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden bg-input-bg">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
            />
          </div>
          <div className="flex gap-3 text-xs">
            {campaign.pendingLeads > 0 && <span className="text-yellow-500">{campaign.pendingLeads} pending</span>}
            {campaign.processingLeads > 0 && <span className="text-blue-500">{campaign.processingLeads} processing</span>}
            {campaign.failedLeads > 0 && <span className="text-red-500">{campaign.failedLeads} failed</span>}
          </div>
        </div>
      </Link>

      {/* Kebab Menu */}
      <div className="absolute top-4 right-4" ref={menuRef}>
        <button
          onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); }}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Campaign actions"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              className="absolute right-0 top-full mt-1 w-44 rounded-xl overflow-hidden z-50 bg-card border border-card-border"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setEditing(true);
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleArchive();
                }}
                disabled={saving}
                className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Archive
              </button>

              <div className="border-t border-card-border" />

              {confirmDelete ? (
                <div className="px-4 py-2.5">
                  <p className="text-xs text-red-500 mb-2">Delete permanently?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.preventDefault(); handleDelete(); }}
                      disabled={deleting}
                      className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      {deleting ? "..." : "Yes, Delete"}
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); setConfirmDelete(false); }}
                      className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.preventDefault(); setConfirmDelete(true); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 flex items-center gap-2 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
