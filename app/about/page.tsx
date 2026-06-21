"use client";

import { motion } from "framer-motion";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">About SiteSniper AI</h1>
          <p className="text-lg sm:text-xl text-muted-foreground">AI-powered B2B growth engine for modern sales teams</p>
        </motion.div>
        <div className="space-y-6">
          {[
            { title: "Our Mission", content: "We believe cold outreach should be personalized, relevant, and respectful of the recipient&apos;s time. SiteSniper AI uses artificial intelligence to analyze websites, identify genuine pain points, and craft outreach messages that actually resonate — not generic spam that gets ignored." },
            { title: "How It Works", steps: [
              { label: "Analyze", text: "Our AI scrapes any website and extracts key business information, pain points, and positioning." },
              { label: "Generate", text: "Using Gemini 2.5 Flash via OpenRouter, we generate a personalized roast, pain point analysis, and a cold email that feels human." },
              { label: "Send", text: "If we find a contact email, we deliver the outreach automatically. Otherwise, you get the content to send yourself." },
            ]},
            { title: "Technology", content: "Built with Next.js, PocketBase (SQLite), and Google&apos;s Gemini 2.5 Flash AI via OpenRouter. Emails delivered via Resend. Payments processed securely through Stripe. Local TF-IDF embeddings for RAG. The entire platform runs on a $0 infrastructure budget using free tiers." },
          ].map((section, i) => (
            <motion.div key={section.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-6 sm:p-8 rounded-2xl bg-card border border-card-border">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">{section.title}</h2>
              {section.content && <p className="text-foreground leading-relaxed">{section.content}</p>}
              {section.steps && (
                <div className="space-y-4">
                  {section.steps.map((step) => (
                    <p key={step.label} className="text-foreground">
                      <span className="text-primary font-semibold">{step.label}:</span> {step.text}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
