"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ModeToggle from "./ModeToggle";

interface User {
  id: string;
  email: string;
  name: string | null;
  creditsRemaining: number;
  tier: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) { setUser(null); return; }
      const data = await res.json();
      setUser(data.user);
    } catch { setUser(null); }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMobileOpen(false);
    window.location.href = "/";
  };

  const isActive = (path: string) => pathname === path;

  const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <Link
      href={href}
      onClick={onClick}
      className={`px-3 py-2 text-[15px] font-medium rounded-lg transition-colors ${
        isActive(href)
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </Link>
  );

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "var(--nav-bg)",
        borderBottom: "1px solid var(--nav-border)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <span className="text-white font-bold text-base">S</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              SiteSniper<span className="text-primary">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <NavLink href="/">Home</NavLink>
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/dashboard/billing">Billing</NavLink>
                <NavLink href="/dashboard/settings">Settings</NavLink>

                <div className="flex items-center gap-2 px-4 py-2 ml-3 rounded-xl bg-card border border-card-border">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-muted-foreground">Credits</span>
                  <span className="text-sm font-bold text-primary">{user.creditsRemaining}</span>
                  {user.tier !== "free" && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded-md uppercase tracking-wide">
                      {user.tier}
                    </span>
                  )}
                </div>

                <ModeToggle />

                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink href="/about">About</NavLink>
                <NavLink href="/pricing">Pricing</NavLink>

                <ModeToggle />

                <Link
                  href="/login"
                  className="ml-3 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Buttons */}
          <div className="flex items-center gap-1 md:hidden">
            <ModeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: "1px solid var(--nav-border)", background: "var(--nav-bg)", backdropFilter: "blur(16px)" }}
          >
            <div className="px-4 py-4 space-y-1">
              {user ? (
                <>
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-2 bg-card border border-card-border">
                    <span className="text-sm text-muted-foreground truncate max-w-[160px]">{user.email}</span>
                    <span className="text-sm font-bold text-primary">{user.creditsRemaining} credits</span>
                  </div>
                  <Link href="/" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[15px] text-foreground hover:bg-muted rounded-xl">Home</Link>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[15px] text-foreground hover:bg-muted rounded-xl">Dashboard</Link>
                  <Link href="/dashboard/billing" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[15px] text-foreground hover:bg-muted rounded-xl">Billing</Link>
                  <Link href="/dashboard/settings" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[15px] text-foreground hover:bg-muted rounded-xl">Settings</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-[15px] text-red-500 hover:text-red-600 rounded-xl hover:bg-red-500/5">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/about" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[15px] text-foreground hover:bg-muted rounded-xl">About</Link>
                  <Link href="/pricing" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[15px] text-foreground hover:bg-muted rounded-xl">Pricing</Link>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[15px] text-primary font-semibold rounded-xl hover:bg-primary/5">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
