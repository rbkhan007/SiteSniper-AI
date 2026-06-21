import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 px-4 mt-auto border-t border-card-border">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                SiteSniper<span className="text-orange-500">AI</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered B2B growth engine for modern sales teams.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-orange-500 transition-colors">Pricing</Link></li>
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-orange-500 transition-colors">About</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-orange-500 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Account</h4>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-sm text-muted-foreground hover:text-orange-500 transition-colors">Sign In</Link></li>
              <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-orange-500 transition-colors">Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-card-border">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SiteSniper AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Built with AI</span>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">Powered by OpenRouter</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
