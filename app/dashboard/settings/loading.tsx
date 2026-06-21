export default function SettingsLoading() {
  return (
    <main className="min-h-screen pt-20 sm:pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="h-8 w-48 rounded-lg animate-pulse bg-muted mb-8" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 sm:p-6 rounded-2xl mb-5 bg-card border border-card-border">
            <div className="h-5 w-32 rounded-lg animate-pulse bg-muted mb-4" />
            <div className="space-y-3">
              <div className="h-10 rounded-xl animate-pulse bg-input-bg border border-input-border" />
              <div className="h-10 rounded-xl animate-pulse bg-input-bg border border-input-border" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
