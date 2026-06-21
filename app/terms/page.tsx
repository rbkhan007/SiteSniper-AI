"use client";

import { motion } from "framer-motion";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: January 2026</p>
          <div className="space-y-8">
            {[
              { title: "1. Acceptance of Terms", content: "By accessing or using SiteSniper AI, you agree to be bound by these Terms of Service. If you do not agree, do not use the service." },
              { title: "2. Service Description", content: "SiteSniper AI provides AI-powered website analysis and cold outreach generation. We scrape publicly available website content, analyze it with AI, and generate personalized outreach emails." },
              { title: "3. Acceptable Use", content: "You agree not to use the service for spam, harassment, or any illegal purpose. You are responsible for compliance with all applicable laws regarding cold outreach in your jurisdiction." },
              { title: "4. Credits and Billing", content: "Free accounts receive 50 credits. Paid plans provide monthly credit allocations. Credits are non-transferable. Unused paid credits do not roll over. Refunds are available within 14 days of purchase." },
              { title: "5. Intellectual Property", content: "AI-generated content is provided as-is. You own the rights to content generated through your account. We claim no ownership over your campaigns or outreach materials." },
              { title: "6. Limitation of Liability", content: "SiteSniper AI is provided &quot;as is&quot; without warranties. We are not liable for any damages arising from the use of our service, including but not limited to lost profits or business interruption." },
              { title: "7. Contact", content: "For questions about these Terms, contact us at legal@sitesniper.ai" },
            ].map((section, i) => (
              <motion.section key={section.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3">{section.title}</h2>
                <p className="text-foreground leading-relaxed">{section.content}</p>
              </motion.section>
            ))}
          </div>
        </motion.div>
      </div>
      <Footer />
    </main>
  );
}
