import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://sitesniper.ai"),
  title: {
    default: "SiteSniper AI - Roast Any Website, Generate Cold Emails",
    template: "%s | SiteSniper AI",
  },
  description:
    "AI-powered B2B growth engine that scrapes websites, finds pain points, and generates personalized cold outreach. Get roasted.",
  keywords: [
    "B2B", "cold email", "AI", "website analysis", "lead generation",
    "outreach", "sales automation", "website scraping", "pain point extraction",
  ],
  authors: [{ name: "SiteSniper AI" }],
  creator: "SiteSniper AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sitesniper.ai",
    siteName: "SiteSniper AI",
    title: "SiteSniper AI - Roast Any Website, Generate Cold Emails",
    description:
      "AI-powered B2B growth engine that scrapes websites, finds pain points, and generates personalized cold outreach.",
    images: [{ url: "/og", width: 1200, height: 630, alt: "SiteSniper AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SiteSniper AI - Roast Any Website, Generate Cold Emails",
    description:
      "AI-powered B2B growth engine that scrapes websites, finds pain points, and generates personalized cold outreach.",
    images: ["/og"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml", sizes: "180x180" }],
    other: [{ rel: "mask-icon", url: "/favicon.svg", color: "#ff5a1f" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.svg" />
        <link rel="mask-icon" href="/favicon.svg" color="#ff5a1f" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ToastProvider>
            <Navbar />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
