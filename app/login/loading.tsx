export default function LoginLoading() {
  return (
    <main className="min-h-screen pt-16 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="p-8 bg-card border border-card-border rounded-3xl">
          <div className="text-center mb-8 space-y-3">
            <div className="w-12 h-12 bg-muted rounded-xl mx-auto animate-pulse" />
            <div className="h-6 w-36 bg-muted rounded-lg mx-auto animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded-lg mx-auto animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-4 w-24 bg-muted rounded-lg animate-pulse" />
            <div className="h-12 bg-muted rounded-xl animate-pulse" />
            <div className="h-12 bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
