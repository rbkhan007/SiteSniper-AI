"use client";

import { motion } from "framer-motion";

interface StatsCardProps { label: string; value: string | number; change?: string; icon?: React.ReactNode; trend?: "up" | "down" | "neutral"; }

export default function StatsCard({ label, value, change, icon, trend }: StatsCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="p-5 rounded-2xl bg-card border border-card-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {change && <p className={`text-xs mt-1 ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>{change}</p>}
        </div>
        {icon && <div className="text-orange-500/50">{icon}</div>}
      </div>
    </motion.div>
  );
}
