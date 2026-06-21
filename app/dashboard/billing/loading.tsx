export default function BillingLoading() {
  return (
    <main className="min-h-screen pt-20 sm:pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="h-8 w-48 rounded-lg animate-pulse bg-muted mb-8" />
        <div className="h-32 rounded-2xl mb-5 animate-pulse bg-card border border-card-border" />
        <div className="h-5 w-40 rounded-lg animate-pulse bg-muted mb-4" />
        {[1, 2].map((i) => (
          <div key={i} className="h-24 rounded-xl mb-4 animate-pulse bg-card border border-card-border" />
        ))}
      </div>
    </main>
  );
}
