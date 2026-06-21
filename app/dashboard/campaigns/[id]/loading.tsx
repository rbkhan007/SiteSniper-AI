export default function CampaignDetailLoading() {
  return (
    <main className="min-h-screen pt-20 sm:pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="h-4 w-32 rounded-lg animate-pulse bg-muted mb-4" />
        <div className="h-8 w-64 rounded-lg animate-pulse bg-muted mb-2" />
        <div className="h-4 w-48 rounded-lg animate-pulse bg-muted mb-8" />
        <div className="p-5 sm:p-6 rounded-2xl mb-8 bg-card border border-card-border">
          <div className="h-5 w-40 rounded-lg animate-pulse bg-muted mb-4" />
          <div className="h-10 rounded-xl animate-pulse bg-input-bg border border-input-border" />
        </div>
        <div className="h-5 w-24 rounded-lg animate-pulse bg-muted mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl mb-3 animate-pulse bg-card border border-card-border" />
        ))}
      </div>
    </main>
  );
}
