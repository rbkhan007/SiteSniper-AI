# SiteSniper AI

> AI-powered B2B growth engine that scrapes websites, finds pain points, and generates personalized cold outreach — all from a single domain input.

**Goal:** $1,500/mo revenue · **Budget:** $0 infrastructure

---

## What It Does

1. **Input a domain** → SiteSniper scrapes the website content
2. **AI analyzes** the page using Gemini 2.5 Flash via OpenRouter — finds pain points, weaknesses, opportunities
3. **Generates** a viral roast, personalized email subject, and cold outreach body
4. **Sends emails** automatically via Resend (Growth+ tiers)
5. **Bulk process** hundreds of domains at once with concurrent queue processing

### The Viral Hook

Anyone can roast any website for free on the landing page — no signup required. This drives viral sharing. After the roast, users see a CTA to sign up for 50 free lead credits.

---

## Features

- **AI Cold Email Engine** — Gemini 2.5 Flash (via OpenRouter) generates personalized outreach from raw website content
- **RAG Pipeline** — Retrieval-Augmented Generation with local TF-IDF embeddings improves output quality
- **Bulk Processing** — Upload 100+ domains, processed concurrently with queue management
- **Campaign Management** — Organize leads into campaigns with status tracking
- **Stripe Billing** — Three-tier subscription model (Free / Growth $49 / Scale $99)
- **RBAC & Tier Gating** — Role-based access with subscription-tier feature restrictions
- **Per-User API Keys** — Users can bring their own OpenRouter API key (encrypted AES-256-CBC)
- **API Key Auth** — Hash-based API keys for programmatic access (Scale tier)
- **Email Delivery** — Automated cold email sending via Resend with delivery logging
- **Credit Ledger** — Full audit trail of credit deductions, refunds, and purchases
- **Real-time Dashboard** — Live stats, campaign limits, credit balance, payment history
- **Multi-layer Cache** — LRU + TTL caching for profiles, campaigns, and analysis results
- **Rate Limiting** — Sliding window rate limiter per route
- **Structured Logging** — JSON logging in production, pretty-printed in development
- **Security Headers** — HSTS, CSP, XSS protection, clickjacking prevention
- **Light/Dark Theme** — Full theme support with CSS variables and system preference detection

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Database | PocketBase (SQLite) |
| Auth | PocketBase auth + jose (JWT) |
| AI | Google Gemini 2.5 Flash (via OpenRouter) |
| Embeddings | Local TF-IDF (no external API) |
| Email | Resend |
| Payments | Stripe |
| Validation | Zod |
| Web Scraping | Cheerio |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PocketBase binary (included in `pocketbase/` directory)
- OpenRouter API key (free tier available)
- Stripe account (free to start)
- Resend API key (free tier)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd site-sniper-ai
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
# PocketBase Admin (for server-side operations)
PB_ADMIN_EMAIL=your_admin_email@example.com
PB_ADMIN_PASS=your_admin_password

# OpenRouter (AI pipeline)
OpenRouter_API_KEY=your_openrouter_api_key

# Resend (email)
RESEND_API_KEY=your_resend_api_key

# Stripe (payments — optional for dev, returns 503 if unconfigured)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_signing_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start PocketBase

```bash
# Windows
cd pocketbase
./pocketbase.exe serve --http=127.0.0.1:8090

# macOS/Linux
cd pocketbase
./pocketbase serve --http=127.0.0.1:8090
```

Open [http://127.0.0.1:8090/_/](http://127.0.0.1:8090/_/) to access the PocketBase admin dashboard. Create your admin account on first run.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
site-sniper-ai/
├── app/
│   ├── page.tsx                     # Landing page (hero, features, pricing, CTA)
│   ├── login/page.tsx               # Email-based login
│   ├── about/page.tsx               # About page
│   ├── pricing/page.tsx             # Pricing page with FAQ
│   ├── privacy/page.tsx             # Privacy policy
│   ├── terms/page.tsx               # Terms of service
│   ├── dashboard/
│   │   ├── layout.tsx               # Dashboard layout
│   │   ├── page.tsx                 # Overview: credits, campaigns, stats
│   │   ├── campaigns/[id]/page.tsx  # Campaign detail + bulk processor
│   │   ├── leads/[id]/page.tsx      # Individual lead detail
│   │   ├── billing/page.tsx         # Billing, payments, subscriptions
│   │   └── settings/page.tsx        # Profile, API keys
│   └── api/                         # 18+ API routes (see API Reference)
│
├── components/
│   ├── Navbar.tsx                   # Auth nav, credits, tier badge, mobile menu
│   ├── Footer.tsx                   # Links, legal, branding
│   ├── ViralRoastEngine.tsx         # Landing page viral hook
│   ├── BulkProcessor.tsx            # Client-side queue processor
│   ├── CampaignCard.tsx             # Campaign list card
│   ├── LeadCard.tsx                 # Lead display card
│   ├── UpgradeModal.tsx             # Stripe upgrade modal (glassmorphism)
│   ├── StatusBadge.tsx              # Status indicator pill
│   ├── CreditsBadge.tsx             # Credits display with tier badge
│   ├── StatsCard.tsx                # Stats display card
│   ├── LoadingSpinner.tsx           # Loading state
│   ├── EmptyState.tsx               # Empty placeholder
│   ├── Toast.tsx                    # Toast notifications
│   ├── CopyButton.tsx               # Copy to clipboard
│   ├── ConfirmDialog.tsx            # Confirmation dialog
│   ├── SearchInput.tsx              # Search field
│   ├── Pagination.tsx               # Page navigation
│   ├── ErrorBoundary.tsx            # Class-based error boundary
│   └── ThemeProvider.tsx            # Dark/light theme wrapper
│
├── lib/
│   ├── auth.ts                      # PocketBase auth + RBAC + tier limits
│   ├── pb-http.ts                   # Raw HTTP PocketBase client (bypasses Next.js fetch)
│   ├── stripe.ts                    # Stripe SDK + plan config
│   ├── resend.ts                    # Resend email client
│   ├── gemini.ts                    # OpenRouter API (Gemini 2.5 Flash)
│   ├── scrape.ts                    # Cheerio scraper + email extractor
│   ├── utils.ts                     # cn(), formatCredits(), formatDate()
│   ├── constants.ts                 # App-wide constants
│   ├── types.ts                     # Shared TypeScript interfaces
│   ├── errors.ts                    # Custom error classes
│   ├── validators.ts                # Zod validation schemas
│   ├── cache.ts                     # Multi-layer caching (LRU + TTL)
│   ├── logger.ts                    # Structured JSON logging
│   ├── rate-limiter.ts              # Sliding window rate limiter
│   ├── security.ts                  # Input sanitization
│   ├── analytics.ts                 # DB-backed event tracking
│   ├── db-optimizations.ts          # Optimized queries + credit ledger
│   └── rag/
│       ├── embeddings.ts            # Local TF-IDF vector generation
│       ├── vector-store.ts          # In-memory vector store
│       └── rag-pipeline.ts          # RAG-enhanced analysis pipeline
│
├── pb_hooks/
│   ├── schema.js                    # PocketBase collection definitions (10 collections)
│   └── api.js                       # Custom API routes (pipeline, bulk upload, public roast)
│
├── pocketbase/
│   └── pb_data/                     # SQLite database directory
│
├── middleware.ts                     # Auth route protection + security headers
├── next.config.ts                   # Next.js config + security headers
├── ARCHITECTURE.md                  # Full architecture documentation
└── CLAUDE.md                        # AI assistant instructions
```

---

## Database Schema

10 PocketBase collections:

| Collection | Purpose |
|---|---|
| `users` | User account with role, tier, credits (extends PocketBase auth) |
| `campaigns` | Groups leads together |
| `leads` | Individual domain analysis result |
| `analytics_events` | Event tracking |
| `subscriptions` | Stripe subscription records |
| `payments` | Payment history |
| `credit_transactions` | Credit ledger (deductions, refunds, purchases) |
| `email_logs` | Email delivery tracking |
| `api_keys` | Hash-based API keys for programmatic access |
| `user_settings` | Per-user encrypted API key storage |

### Access Rules

- **leads**: create/update/delete → admin-only (API routes use `getAdminPB()`)
- **analytics_events**: create → admin-only
- **subscriptions**: create/update → admin-only
- **payments**: create → admin-only
- **credit_transactions**: create → admin-only
- **email_logs**: create → admin-only
- **user_settings**: user can read own, admin for all

---

## Pricing Tiers

| Feature | Free | Growth ($49/mo) | Scale ($99/mo) |
|---|---|---|---|
| Credits/month | 50 | 1,000 | 3,000 |
| Campaigns | 3 | 25 | Unlimited |
| Leads/campaign | 50 | 500 | Unlimited |
| Bulk upload | — | Yes | Yes |
| Email delivery | — | Yes | Yes |
| API access | — | — | Yes |
| RAG pipeline | — | Yes | Yes |
| Priority processing | — | Yes | Yes |
| Bring your own key | — | Yes | Yes |

---

## API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Email-based login, creates JWT |
| `POST` | `/api/auth/logout` | Clears session cookie |
| `GET` | `/api/auth/me` | Returns current user |

### Core Engine

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/public-roast` | No | Free viral roast (cached) |
| `POST` | `/api/pipeline` | Yes | Core analysis engine (RAG-enhanced) |
| `POST` | `/api/bulk-upload` | Yes | Batch insert domains (tier-gated) |
| `GET` | `/api/get-pending-leads` | Yes | Fetch pending leads for processing |

### Data

| Method | Endpoint | Description |
|---|---|---|
| `GET/PATCH` | `/api/profile` | Get/update profile |
| `GET` | `/api/stats` | Dashboard stats + payments + subscriptions |
| `GET/POST` | `/api/campaigns` | List/create campaigns |
| `GET/PATCH/DELETE` | `/api/campaigns/[id]` | Campaign CRUD |
| `GET` | `/api/leads?campaignId=...` | List leads by campaign |
| `GET` | `/api/leads/[id]` | Single lead detail |
| `GET/POST/DELETE` | `/api/api-keys` | API key management (Scale only) |
| `GET/POST` | `/api/user-settings` | Per-user encrypted API key storage |

### System

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Database health check |
| `GET` | `/api/metrics` | Performance metrics (dev only) |
| `GET` | `/api/og` | Dynamic OG image generation |
| `POST` | `/api/stripe/checkout` | Create Stripe checkout session (503 if unconfigured) |
| `POST` | `/api/stripe/webhook` | Stripe webhook handler |
| `POST` | `/api/stripe/test-upgrade` | Dev-only tier simulation (when Stripe unconfigured) |

---

## How It Works

### Pipeline Flow

```
Domain Input
    ↓
Rate Limit Check (sliding window, per IP)
    ↓
Auth + Credit Check (atomic deduction + ledger)
    ↓
Domain Validation (sanitize + regex)
    ↓
Cache Check (in-memory LRU, 1hr TTL)
    ├── HIT → Return cached results
    └── MISS ↓
Scrape Website (Cheerio, 8s timeout)
    ↓
Extract Emails (regex + filter generics)
    ↓
Search Vector Store (TF-IDF similarity)
    ↓
Build Enhanced Prompt (with RAG context)
    ↓
AI Generation (OpenRouter → Gemini 2.5 Flash)
    ↓
Cache Store (save for future requests)
    ↓
DB Update (lead status → completed)
    ↓
Email Send (Resend, if email found)
    ↓
Analytics Track (analytics_events table)
```

### Stripe Webhook Events

- `checkout.session.completed` → Add credits, log payment, create subscription, sync tier
- `subscription.updated` → Sync tier from subscription
- `subscription.deleted` → Downgrade to free tier
- `invoice.payment_failed` → Mark subscription as past_due

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy
5. Set Stripe webhook URL to `https://your-app.vercel.app/api/stripe/webhook`

### PocketBase Hosting

For production, run PocketBase on a VPS or use a managed hosting service:
- **Railway** — easy deployment, persistent storage
- **Fly.io** — global edge, persistent volumes
- **DigitalOcean** — $5/mo droplet

### Post-Deploy Checklist

- [ ] PocketBase running with admin account created
- [ ] Set `PB_ADMIN_EMAIL` and `PB_ADMIN_PASS` in production env
- [ ] Set `OpenRouter_API_KEY` in production env
- [ ] Configure Stripe webhook endpoint
- [ ] Verify webhook signature is working
- [ ] Test the full pipeline end-to-end

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## License

Private — All rights reserved.
