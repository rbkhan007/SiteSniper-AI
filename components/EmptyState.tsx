"use client";

import { motion } from "framer-motion";

interface EmptyStateProps { icon?: React.ReactNode; title: string; description: string; action?: React.ReactNode; }

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-10 sm:p-12 rounded-2xl text-center bg-card border border-card-border">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-6">{description}</p>
      {action}
    </motion.div>
  );
}
