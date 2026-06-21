export default function HomeLoading() {
  return (
    <main className="min-h-screen pt-16">
      <section className="relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 py-32 text-center">
          <div className="h-6 w-48 bg-muted rounded-full mx-auto mb-6 animate-pulse" />
          <div className="h-16 w-96 bg-muted rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-16 w-72 bg-muted rounded-lg mx-auto mb-6 animate-pulse" />
          <div className="h-6 w-80 bg-muted rounded-lg mx-auto mb-12 animate-pulse" />
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-muted rounded-xl animate-pulse" />
              <div className="w-36 h-12 bg-muted rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
