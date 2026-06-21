export default function DashboardLoading() {
  return (
    <main className="min-h-screen pt-20 sm:pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="h-8 w-64 rounded-lg animate-pulse bg-muted mb-4" />
        <div className="h-4 w-48 rounded-lg animate-pulse bg-muted mb-8" />
        <div className="h-28 rounded-2xl mb-8 animate-pulse bg-card border border-card-border" />
        <div className="h-4 w-32 rounded-lg animate-pulse bg-muted mb-4" />
        <div className="flex gap-3 mb-8">
          <div className="flex-1 h-12 rounded-xl animate-pulse bg-input-bg border border-input-border" />
          <div className="w-28 h-12 rounded-xl animate-pulse bg-muted" />
        </div>
        <div className="h-4 w-40 rounded-lg animate-pulse bg-muted mb-4" />
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl animate-pulse bg-card border border-card-border" />
          ))}
        </div>
      </div>
    </main>
  );
}
