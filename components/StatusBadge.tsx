"use client";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-500/20 text-yellow-400" },
  processing: { label: "Processing", className: "bg-blue-500/20 text-blue-400" },
  completed: { label: "Completed", className: "bg-green-500/20 text-green-400" },
  failed: { label: "Failed", className: "bg-red-500/20 text-red-400" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${config.className}`}>
      {status === "processing" && (
        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse mr-1.5" />
      )}
      {config.label}
    </span>
  );
}
