"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Lead {
  id: string;
  domain: string;
  status: string;
  viralRoast: string | null;
  foundEmail: string | null;
  outreachSubject: string | null;
  outreachBody: string | null;
}

interface BulkProcessorProps {
  campaignId: string;
  hasBulkUpload?: boolean;
  onLeadProcessed?: (lead: Lead) => void;
  onUpgradeRequired?: () => void;
}

export default function BulkProcessor({
  campaignId,
  hasBulkUpload = false,
  onLeadProcessed,
  onUpgradeRequired,
}: BulkProcessorProps) {
  const [domains, setDomains] = useState("");
  const [singleDomain, setSingleDomain] = useState("");
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stopping, setStopping] = useState(false);
  const abortRef = useRef(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, failed: 0, pending: 0 });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleBulkUpload = async () => {
    const domainList = domains
      .split("\n")
      .map((d) => d.trim())
      .filter((d) => d.length > 0);
    if (domainList.length === 0) return;
    setUploading(true);
    setLastError(null);
    try {
      const res = await fetch("/api/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, domains: domainList }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.upgradeRequired) {
          onUpgradeRequired?.();
          return;
        }
        throw new Error(data.error);
      }
      setStats((prev) => ({
        ...prev,
        total: prev.total + data.inserted,
        pending: prev.pending + data.inserted,
      }));
      setDomains("");
    } catch (e: any) {
      setLastError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSingleDomain = async () => {
    const domain = singleDomain.trim();
    if (!domain) return;
    setLastError(null);
    setStats((prev) => ({ ...prev, total: prev.total + 1, pending: prev.pending + 1 }));

    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, campaignId, senderName: "SiteSniper User" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStats((prev) => ({ ...prev, pending: prev.pending - 1, completed: prev.completed + 1 }));
      setRecentLeads((prev) => [{ id: data.leadId, domain, status: "completed", viralRoast: data.roast, foundEmail: null, outreachSubject: null, outreachBody: null }, ...prev.slice(0, 9)]);
      onLeadProcessed?.({ id: data.leadId, domain, status: "completed", viralRoast: data.roast, foundEmail: null, outreachSubject: null, outreachBody: null });
      setSingleDomain("");
    } catch (e: any) {
      setStats((prev) => ({ ...prev, pending: prev.pending - 1, failed: prev.failed + 1 }));
      setLastError(e.message || "Processing failed");
    }
  };

  const processLead = useCallback(
    async (lead: Lead): Promise<boolean> => {
      if (abortRef.current) return false;
      try {
        const res = await fetch("/api/pipeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: lead.domain, campaignId, senderName: "SiteSniper User" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setStats((prev) => ({ ...prev, pending: prev.pending - 1, completed: prev.completed + 1 }));
        setRecentLeads((prev) => [{ ...lead, status: "completed", ...data }, ...prev.slice(0, 9)]);
        onLeadProcessed?.({ ...lead, status: "completed" });
        return true;
      } catch {
        setStats((prev) => ({ ...prev, pending: prev.pending - 1, failed: prev.failed + 1 }));
        onLeadProcessed?.({ ...lead, status: "failed" });
        return false;
      }
    },
    [campaignId, onLeadProcessed]
  );

  const startProcessing = useCallback(async () => {
    setProcessing(true);
    setStopping(false);
    abortRef.current = false;

    while (!abortRef.current) {
      try {
        const res = await fetch(`/api/get-pending-leads?campaignId=${campaignId}&limit=3`);
        const data = await res.json();
        if (!data.leads || data.leads.length === 0) break;
        await Promise.all(data.leads.map((lead: Lead) => processLead(lead)));
      } catch {
        break;
      }
    }

    setProcessing(false);
    setStopping(false);
    abortRef.current = false;
  }, [campaignId, processLead]);

  const stopProcessing = () => {
    setStopping(true);
    abortRef.current = true;
  };

  const resumeProcessing = () => {
    startProcessing();
  };

  const inputCls =
    "w-full px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-mono text-sm transition-all bg-input-bg border border-input-border";

  const processed = stats.completed + stats.failed;

  return (
    <div className="space-y-5">
      {/* Single Domain Input — always available */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Analyze a website
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={singleDomain}
            onChange={(e) => setSingleDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSingleDomain()}
            placeholder="example.com"
            className={inputCls}
            disabled={processing}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSingleDomain}
            disabled={processing || !singleDomain.trim()}
            className="px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl disabled:opacity-50 hover:shadow-lg hover:shadow-orange-500/25 transition-all text-sm whitespace-nowrap"
          >
            Roast It
          </motion.button>
        </div>
      </div>

      {/* Bulk Upload — only for Growth+ users */}
      {hasBulkUpload && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Bulk upload domains (one per line)
          </label>
          <textarea
            value={domains}
            onChange={(e) => setDomains(e.target.value)}
            placeholder={`example.com\nagency.io\nstartup.co`}
            rows={4}
            className={inputCls}
            disabled={uploading}
          />
          <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBulkUpload}
              disabled={uploading || !domains.trim()}
              className="px-5 py-2.5 bg-muted text-foreground rounded-xl hover:bg-muted/80 disabled:opacity-50 transition-all text-sm font-medium"
            >
              {uploading ? "Uploading..." : "Upload Domains"}
            </motion.button>

            {processing ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={stopProcessing}
                className="px-5 py-2.5 bg-red-500/10 text-red-500 font-semibold rounded-xl hover:bg-red-500/20 transition-all text-sm"
              >
                {stopping ? "Stopping..." : "Stop Processing"}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resumeProcessing}
                disabled={stats.pending === 0}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl disabled:opacity-50 hover:shadow-lg hover:shadow-orange-500/25 transition-all text-sm"
              >
                Start Processing Queue
              </motion.button>
            )}
          </div>
        </div>
      )}

      {/* Upgrade prompt for free users */}
      {!hasBulkUpload && (
        <div className="p-4 rounded-xl text-center bg-card border border-card-border">
          <p className="text-sm text-muted-foreground mb-2">
            Bulk upload and queue processing available on Growth plan.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onUpgradeRequired}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all text-sm"
          >
            Upgrade to Growth
          </motion.button>
        </div>
      )}

      {/* Error */}
      {lastError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-500">{lastError}</p>
        </div>
      )}

      {/* Progress Stats */}
      {(stats.total > 0 || processing) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Pending", value: stats.pending, color: "text-yellow-500" },
            { label: "Done", value: stats.completed, color: "text-green-500" },
            { label: "Failed", value: stats.failed, color: "text-red-500" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-3 rounded-xl text-center bg-card border border-card-border"
            >
              <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Processing indicator */}
      {processing && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-card-border">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-sm text-foreground">
            {stopping
              ? "Finishing current batch..."
              : `Processing... ${stats.completed + stats.failed}/${stats.total} done`}
          </span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-input-bg">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${processed > 0 ? (processed / stats.total) * 100 : 0}%` }}
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
            />
          </div>
        </div>
      )}

      {/* Recent Leads */}
      <AnimatePresence>
        {recentLeads.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Recently Processed</h4>
            {recentLeads.map((lead, i) => (
              <motion.div
                key={lead.id || i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-xl flex items-center justify-between bg-card border border-card-border"
              >
                <div className="min-w-0">
                  <p className="text-sm font-mono text-foreground truncate">{lead.domain}</p>
                  {lead.viralRoast && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{lead.viralRoast}</p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ml-3 shrink-0 ${
                    lead.status === "completed"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {lead.status}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
