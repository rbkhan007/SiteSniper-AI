"use client";

import { motion } from "framer-motion";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: January 2026</p>
          <div className="space-y-8">
            {[
              { title: "1. Information We Collect", content: "When you create an account, we collect your email address. When you use our service, we process website URLs you submit for analysis. We do not collect personal information from the websites you analyze." },
              { title: "2. How We Use Your Information", content: "We use your email for authentication and service-related communications. Website analysis data is stored in your account for your reference and is not shared with third parties." },
              { title: "3. Data Security", content: "We use industry-standard encryption and security practices. All data is stored in encrypted databases and transmitted over HTTPS. We never store credit card information — payments are processed by Stripe." },
              { title: "4. Third-Party Services", content: "We use the following third-party services: PocketBase (database), OpenRouter/Gemini AI (content generation), Resend (email delivery), and Stripe (payment processing). Each service has its own privacy policy." },
              { title: "5. Data Retention", content: "Your account data is retained as long as your account is active. You can request data deletion by contacting us. Campaign and lead data is stored until you manually delete it." },
              { title: "6. Contact", content: "For privacy-related inquiries, contact us at privacy@sitesniper.ai" },
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
