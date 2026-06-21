"use client";

import { motion } from "framer-motion";
import StatusBadge from "./StatusBadge";
import CopyButton from "./CopyButton";
import type { Lead } from "@/lib/types";

interface LeadCardProps {
  lead: Lead;
  onClick?: () => void;
}

export default function LeadCard({ lead, onClick }: LeadCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="p-4 rounded-xl cursor-pointer hover:border-orange-500/20 transition-all bg-card border border-card-border"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-sm text-foreground">{lead.domain}</span>
        <StatusBadge status={lead.status} />
      </div>

      {lead.viralRoast && (
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{lead.viralRoast}</p>
      )}

      {lead.outreachSubject && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground truncate flex-1 mr-2">
            Subject: {lead.outreachSubject}
          </p>
          <CopyButton
            text={`Subject: ${lead.outreachSubject}\n\n${lead.outreachBody ?? ""}`}
          />
        </div>
      )}

      {lead.foundEmail && (
        <p className="text-xs text-orange-500 mt-2">{lead.foundEmail}</p>
      )}
    </motion.div>
  );
}
