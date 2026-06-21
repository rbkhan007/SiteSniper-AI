"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/Footer";

const plans = [
  { name: "Free", price: "$0", credits: "50 credits", features: ["AI Roasts", "Cold Emails", "No card required"], cta: "Get Started", href: "/login", popular: false },
  { name: "Growth", price: "$49", period: "/mo", credits: "1,000 credits/mo", features: ["Everything in Free", "Priority processing", "Email delivery"], cta: "Start Growth", href: "/login", popular: true },
  { name: "Scale", price: "$99", period: "/mo", credits: "3,000 credits/mo", features: ["Everything in Growth", "Bulk campaigns", "API access"], cta: "Start Scale", href: "/login", popular: false },
];

const faqs = [
  { q: "What counts as a credit?", a: "Each website analysis (scrape + AI generation) costs 1 credit. If an email is found and sent, that's still just 1 credit." },
  { q: "Can I get a refund?", a: "Yes, we offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact us for a full refund." },
  { q: "Do unused credits roll over?", a: "Free tier credits don't expire. Paid plan credits reset monthly — unused credits do not roll over." },
  { q: "Is there an API?", a: "Yes, API access is included in the Scale plan ($99/mo). Documentation is available in your dashboard after upgrading." },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Simple Pricing</h1>
          <p className="text-lg sm:text-xl text-muted-foreground">Start free. Scale when you&apos;re ready. No hidden fees.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={`p-6 sm:p-8 rounded-2xl ${plan.popular ? "ring-2 ring-primary/30" : ""} bg-card border border-card-border`}>
              {plan.popular && <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-4">Most Popular</span>}
              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-4 mb-2">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
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
              <Link href={plan.href} className={`block w-full py-3 text-center rounded-xl font-semibold transition-all ${plan.popular ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-500/25" : "bg-muted text-foreground hover:bg-muted/80"}`}>
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-20 sm:mt-24">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10 sm:mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {faqs.map((faq) => (
              <div key={faq.q} className="p-5 sm:p-6 rounded-xl bg-card border border-card-border">
                <h3 className="text-foreground font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      <Footer />
    </main>
  );
}
