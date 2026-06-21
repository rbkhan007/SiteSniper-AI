"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import CopyButton from "@/components/CopyButton";
import StatusBadge from "@/components/StatusBadge";
import type { Lead } from "@/lib/types";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLead = useCallback(async () => {
    try {
      const res = await fetch(`/api/leads/${params.id}`);
      const data = await res.json();
      if (!data.lead) { router.push("/dashboard"); return; }
      setLead(data.lead);
    } catch { router.push("/dashboard"); } finally { setLoading(false); }
  }, [params.id, router]);

  useEffect(() => { loadLead(); }, [loadLead]);
  useEffect(() => {
    if (!lead || lead.status === "completed" || lead.status === "failed") return;
    const i = setInterval(loadLead, 3000);
    return () => clearInterval(i);
  }, [lead, loadLead]);

  if (loading || !lead) return <div className="min-h-screen pt-24 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" /></div>;

  return (
    <main className="min-h-screen pt-20 sm:pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-orange-500 mb-4 transition-colors inline-block">&larr; Back to Dashboard</Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{lead.domain}</h1>
              <p className="text-sm text-muted-foreground mt-1">{lead.createdAt ? new Date(lead.createdAt).toLocaleString() : ""}</p>
            </div>
            <StatusBadge status={lead.status} />
          </div>
        </motion.div>

        {lead.viralRoast && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="p-5 sm:p-6 rounded-2xl mb-5 bg-card border border-card-border">
            <h2 className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-3">AI Roast</h2>
            <p className="text-base sm:text-lg text-foreground leading-relaxed">{lead.viralRoast}</p>
          </motion.div>
        )}

        {lead.outreachSubject && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="p-5 sm:p-6 rounded-2xl mb-5 bg-card border border-card-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-orange-500 uppercase tracking-wider">Outreach Email</h2>
              <CopyButton text={`Subject: ${lead.outreachSubject}\n\n${lead.outreachBody ?? ""}`} />
            </div>
            <div className="p-4 rounded-xl bg-input-bg">
              <p className="text-sm text-muted-foreground mb-2"><span className="text-muted-foreground">Subject:</span> {lead.outreachSubject}</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{lead.outreachBody || "No email body generated"}</p>
            </div>
          </motion.div>
        )}

        {lead.foundEmail && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="p-5 sm:p-6 rounded-2xl bg-card border border-card-border">
            <h2 className="text-sm font-semibold text-orange-500 uppercase tracking-wider mb-3">Contact Found</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-foreground">{lead.foundEmail}</span>
              <CopyButton text={lead.foundEmail ?? ""} />
            </div>
          </motion.div>
        )}

        {(lead.status === "pending" || lead.status === "processing") && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 sm:p-12 rounded-2xl text-center bg-card border border-card-border">
            <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">{lead.status === "pending" ? "Waiting to process..." : "Analyzing website..."}</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}