export default function LeadDetailLoading() {
  return (
    <main className="min-h-screen pt-20 sm:pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="h-4 w-32 rounded-lg animate-pulse bg-muted mb-4" />
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-48 rounded-lg animate-pulse bg-muted mb-2" />
            <div className="h-4 w-32 rounded-lg animate-pulse bg-muted" />
          </div>
          <div className="h-6 w-20 rounded-full animate-pulse bg-muted" />
        </div>
        <div className="p-5 sm:p-6 rounded-2xl mb-5 bg-card border border-card-border">
          <div className="h-4 w-24 rounded-lg animate-pulse bg-primary/20 mb-3" />
          <div className="h-5 w-full rounded-lg animate-pulse bg-muted mb-2" />
          <div className="h-5 w-3/4 rounded-lg animate-pulse bg-muted" />
        </div>
        <div className="p-5 sm:p-6 rounded-2xl bg-card border border-card-border">
          <div className="h-4 w-32 rounded-lg animate-pulse bg-primary/20 mb-3" />
          <div className="h-4 w-24 rounded-lg animate-pulse bg-muted mb-2" />
          <div className="h-20 w-full rounded-lg animate-pulse bg-muted" />
        </div>
      </div>
    </main>
  );
}
