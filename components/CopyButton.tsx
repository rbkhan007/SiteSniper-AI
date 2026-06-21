"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface CopyButtonProps { text: string; className?: string; }

export default function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCopy}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
        copied ? "bg-green-500/15 text-green-500" : "text-muted-foreground hover:text-orange-500"
      } ${className}`}>
      {copied ? "Copied!" : "Copy"}
    </motion.button>
  );
}
