"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ViralRoastEngine from "@/components/ViralRoastEngine";
import Footer from "@/components/Footer";

const STATS = [
  { value: "10,000+", label: "Websites Analyzed" },
  { value: "847", label: "Deals Closed" },
  { value: "94%", label: "Open Rate" },
  { value: "10s", label: "Avg. Generation" },
];

const FEATURES = [
  { icon: " ", title: "AI-Powered Roasts", description: "Our AI analyzes every pixel of a website — design, copy, positioning, tech stack — and delivers a brutal, accurate roast that reveals their real pain points." },
  { icon: " ", title: "Pain Point Extraction", description: "Stop guessing what prospects need. Our AI identifies the exact problems they're facing based on their public-facing website." },
  { icon: "✉️", title: "Cold Emails That Convert", description: "Get a personalized, reply-optimized cold email ready to send — built from the roast, pain point, and your unique value proposition." },
  { icon: "⚡", title: "10-Second Generation", description: "From domain to done in under 10 seconds. Scrape, analyze, roast, and generate — all in one automated pipeline." },
  { icon: " ", title: "Bulk Processing", description: "Upload 100+ domains at once. Our queue system processes them concurrently with priority processing for Growth and Scale plans." },
  { icon: " ", title: "RAG-Enhanced Analysis", description: "Our Retrieval-Augmented Generation pipeline learns from thousands of past analyses to deliver increasingly accurate and specific insights." },
];

const TESTIMONIALS = [
  { quote: "I sent 50 cold emails using SiteSniper roasts. Got 12 replies and 3 meetings booked in the first week.", author: "Sarah Chen", role: "Head of Sales, TechScale", avatar: "SC" },
  { quote: "The roasts are scarily accurate. Prospect after prospect, it nails their exact pain point. My conversion rate tripled.", author: "Marcus Rivera", role: "Founder, GrowthLab", avatar: "MR" },
  { quote: "We replaced our entire research team with SiteSniper. Same quality, 100x faster, fraction of the cost.", author: "Emily Watson", role: "VP Marketing, DataDrive", avatar: "EW" },
];

const LOGOS = ["TechScale", "GrowthLab", "DataDrive", "Salesforce", "HubSpot", "Stripe"];

export default function LandingPage() {
  return (
    <main className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 bg-grid-dots opacity-50" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 md:py-32 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary font-medium mb-6">
              AI-Powered B2B Growth Engine
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Roast Any Website.
              <br />
              <span className="gradient-text">Close More Deals.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Paste any domain. Get a brutal AI roast, pain point analysis,
              and a cold email ready to send — in 10 seconds.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <ViralRoastEngine />
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-10 sm:py-12 px-4 border-y border-card-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-8">Trusted by growth teams at</p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 opacity-40">
            {LOGOS.map((logo) => (
              <span key={logo} className="text-lg sm:text-xl font-bold text-foreground">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28 md:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Three steps to better outreach</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: "01", title: "Paste a Domain", desc: "Enter any company website. Our AI scrapes their content, design, and positioning in real-time." },
              { step: "02", title: "Get the Roast", desc: "See a brutal AI analysis of their weaknesses, pain points, and missed opportunities." },
              { step: "03", title: "Send the Email", desc: "Get a personalized cold email built from the roast — ready to copy-paste and send." },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="p-6 sm:p-8 rounded-2xl hover-card bg-card border border-card-border">
                <span className="text-4xl sm:text-5xl font-bold text-primary/20">{item.step}</span>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-4 mb-2">{item.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 md:py-32 px-4 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Everything You Need to Cold Outreach Better</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">SiteSniper replaces your research team, email writer, and analytics dashboard — all in one AI-powered tool.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="p-5 sm:p-6 rounded-2xl hover-card bg-card border border-card-border">
                <span className="text-2xl sm:text-3xl">{feature.icon}</span>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mt-4 mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28 md:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground text-lg">Don&apos;t take our word for it — hear from the growth teams using SiteSniper daily.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.author} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="p-5 sm:p-6 rounded-2xl bg-card border border-card-border">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-sm sm:text-base text-foreground mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 sm:py-28 md:py-32 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground text-lg">Start free. Scale when ready. No hidden fees.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              { name: "Free", price: "$0", credits: "50 credits", features: ["AI Roasts", "Cold Emails", "3 campaigns", "No card required"] },
              { name: "Growth", price: "$49", credits: "1,000 credits/mo", features: ["Everything in Free", "25 campaigns", "Email delivery", "Priority processing"], popular: true },
              { name: "Scale", price: "$99", credits: "3,000 credits/mo", features: ["Everything in Growth", "Unlimited campaigns", "API access", "Bulk upload"] },
            ].map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className={`p-6 sm:p-8 rounded-2xl ${plan.popular ? "ring-2 ring-primary/30" : ""} bg-card border border-card-border`}>
                {plan.popular && <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4">Most Popular</span>}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.price !== "$0" && <span className="text-muted-foreground">/mo</span>}
                </div>
                <p className="text-sm text-primary mb-6">{plan.credits}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className={`block w-full py-3 text-center rounded-xl font-semibold transition-all ${plan.popular ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-500/25" : "bg-muted text-foreground hover:bg-muted/80"}`}>
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 md:py-32 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">Ready to Close More Deals?</h2>
            <p className="text-muted-foreground text-lg mb-8">Join 10,000+ sales professionals using AI to craft better cold outreach. Start free — no credit card required.</p>
            <Link href="/login" className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all text-lg">
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
