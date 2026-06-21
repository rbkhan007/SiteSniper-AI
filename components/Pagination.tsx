"use client";

import { motion } from "framer-motion";

interface PaginationProps { currentPage: number; totalPages: number; onPageChange: (page: number) => void; }

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-6">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-orange-500 disabled:opacity-30 transition-colors">Previous</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <motion.button key={page} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onPageChange(page)}
          className={`w-8 h-8 text-sm rounded-lg transition-all font-medium ${
            page === currentPage ? "bg-orange-500 text-white" : "text-muted-foreground hover:bg-muted"
          }`}>
          {page}
        </motion.button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-orange-500 disabled:opacity-30 transition-colors">Next</button>
    </div>
  );
}
