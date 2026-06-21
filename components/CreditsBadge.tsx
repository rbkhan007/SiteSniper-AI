"use client";

import { motion } from "framer-motion";

interface CreditsBadgeProps {
  credits: number;
  tier?: string;
}

export default function CreditsBadge({ credits, tier }: CreditsBadgeProps) {
  const isPro = tier && tier !== "free";

  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-card-border">
      <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
      <span className="text-xs text-muted-foreground">Credits</span>
      <span className="text-sm font-semibold text-orange-500">{credits}</span>
      {isPro && <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-500 text-[10px] font-bold rounded uppercase">{tier}</span>}
    </motion.div>
  );
}
