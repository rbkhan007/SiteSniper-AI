# SiteSniper AI — Complete Architecture & Working Blueprint

> **Goal:** $1,500/mo B2B SaaS
> **Budget:** $0
> **Stack:** Next.js 16 · PocketBase (SQLite) · OpenRouter (Gemini 2.5 Flash) · Resend · Stripe · Framer Motion
> **Optimizations:** RAG Pipeline · Multi-Layer Cache · Rate Limiting · Structured Logging · Security Headers

---

## Table of Contents

1. [Project Directory Structure](#1-project-directory-structure)
2. [Environment Variables](#2-environment-variables)
3. [Database Schema (PocketBase)](#3-database-schema-pocketbase)
4. [Core AI Prompt (OpenRouter → Gemini 2.5 Flash)](#4-core-ai-prompt-openrouter--gemini-25-flash)
5. [How the System Works (End-to-End Pipeline)](#5-how-the-system-works-end-to-end-pipeline)
6. [RAG & Optimization Layer](#6-rag--optimization-layer)
7. [Security & Performance](#7-security--performance)
8. [Component Reference](#8-component-reference)
9. [API Reference](#9-api-reference)
10. [Deployment Sequence](#10-deployment-sequence)
11. [Unit Economics & Target](#11-unit-economics--target)

---

## 1. Project Directory Structure

```
site-sniper-ai/
├── middleware.ts                         # Auth route protection (PocketBase JWT)
├── next.config.ts                       # Security headers, compression, images
│
├── app/
│   ├── layout.tsx                       # Root layout (ToastProvider, Navbar, Theme)
│   ├── globals.css                      # Tailwind v4 + utility animations
│   ├── page.tsx                         # Landing Page (ViralRoastEngine + pricing)
│   ├── not-found.tsx                    # Custom 404 page
│   ├── error.tsx                        # Route-level error boundary
│   ├── global-error.tsx                 # Global error boundary
│   ├── sitemap.ts                       # Dynamic sitemap generation
│   ├── robots.ts                        # Robots.txt generation
│   ├── loading.tsx                      # Root loading state
│   │
│   ├── login/
│   │   ├── page.tsx                     # Email-based login (PocketBase auth)
│   │   └── loading.tsx                  # Login loading skeleton
│   ├── about/
│   │   └── page.tsx                     # About page
│   ├── pricing/
│   │   └── page.tsx                     # Standalone pricing page + FAQ
│   ├── privacy/
│   │   └── page.tsx                     # Privacy policy
│   ├── terms/
│   │   └── page.tsx                     # Terms of service
│   │
│   ├── dashboard/
│   │   ├── layout.tsx                   # Dashboard layout
│   │   ├── page.tsx                     # Overview: credits, campaigns, stats
│   │   ├── loading.tsx                  # Dashboard skeleton
│   │   ├── campaigns/[id]/page.tsx      # Campaign detail + BulkProcessor
│   │   ├── campaigns/[id]/loading.tsx   # Campaign detail skeleton
│   │   ├── leads/[id]/page.tsx          # Individual lead detail view
│   │   ├── leads/[id]/loading.tsx       # Lead detail skeleton
│   │   ├── billing/page.tsx             # Billing, payments, subscriptions
│   │   ├── billing/loading.tsx          # Billing skeleton
│   │   ├── settings/page.tsx            # Profile, name, API keys
│   │   └── settings/loading.tsx         # Settings skeleton
│   │
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts           # POST: email login, creates JWT
│       │   ├── logout/route.ts          # POST: clears session cookie
│       │   └── me/route.ts             # GET: returns current user
│       ├── profile/route.ts            # GET: profile / PATCH: update name
│       ├── stats/route.ts             # GET: stats + payments + subscriptions
│       ├── health/route.ts            # GET: DB health check
│       ├── metrics/route.ts           # GET: performance metrics (admin only)
│       ├── og/route.tsx               # GET: Dynamic OG image generation
│       ├── public-roast/route.ts      # POST: ungated viral roast (cached)
│       ├── pipeline/route.ts          # POST: core engine (RAG + cached)
│       ├── bulk-upload/route.ts       # POST: batch insert domains
│       ├── get-pending-leads/route.ts # GET: fetch pending leads
│       ├── api-keys/route.ts          # GET/POST/DELETE: API key management
│       ├── user-settings/route.ts     # GET/POST: per-user encrypted API keys
│       ├── campaigns/
│       │   ├── route.ts              # GET: list / POST: create
│       │   └── [id]/route.ts         # GET / DELETE / PATCH
│       ├── leads/
│       │   ├── route.ts              # GET: list by campaign
│       │   └── [id]/route.ts         # GET: single lead
│       └── stripe/
│           ├── checkout/route.ts     # POST: create checkout session
│           ├── test-upgrade/route.ts # POST: dev-only tier simulation
│           └── webhook/route.ts      # POST: handle webhooks
│
├── components/
│   ├── Navbar.tsx                        # Nav with auth, credits, mobile menu
│   ├── ModeToggle.tsx                    # Light/dark/system theme switcher
│   ├── Footer.tsx                        # Shared footer (links, legal)
│   ├── ViralRoastEngine.tsx              # Landing page viral hook
│   ├── BulkProcessor.tsx                 # Client-side queue processor
│   ├── CampaignCard.tsx                  # Campaign list card (with kebab menu)
│   ├── UpgradeModal.tsx                  # Stripe upgrade modal (glassmorphism)
│   ├── LeadCard.tsx                      # Reusable lead display card
│   ├── StatusBadge.tsx                   # Status indicator pill
│   ├── CreditsBadge.tsx                  # Credits display with PRO badge
│   ├── StatsCard.tsx                     # Stats display card
│   ├── LoadingSpinner.tsx                # Reusable loading spinner
│   ├── EmptyState.tsx                    # Empty state placeholder
│   ├── Toast.tsx                         # Toast notification provider
│   ├── CopyButton.tsx                    # Copy to clipboard button
│   ├── ConfirmDialog.tsx                 # Confirmation dialog
│   ├── SearchInput.tsx                   # Search input field
│   ├── Pagination.tsx                    # Pagination controls
│   └── ErrorBoundary.tsx                 # Class-based error boundary
│
├── lib/
│   ├── auth.ts                           # PocketBase auth + RBAC + tier limits
│   ├── pb-http.ts                        # Raw HTTP PocketBase client (bypasses Next.js fetch)
│   ├── stripe.ts                         # Stripe SDK + plan config
│   ├── resend.ts                         # Resend email client
│   ├── gemini.ts                         # OpenRouter API (Gemini 2.5 Flash)
│   ├── scrape.ts                         # Cheerio scraper + email extractor
│   ├── utils.ts                          # cn(), formatCredits(), formatDate()
│   ├── constants.ts                      # App-wide constants
│   ├── types.ts                          # Shared TypeScript interfaces
│   ├── errors.ts                         # Custom error classes
│   ├── validators.ts                     # Zod validation schemas
│   ├── cache.ts                          # Multi-layer caching (LRU + TTL)
│   ├── logger.ts                         # Structured JSON logging
│   ├── rate-limiter.ts                   # Sliding window rate limiter
│   ├── security.ts                       # Input sanitization
│   ├── analytics.ts                      # DB-backed event tracking
│   ├── db-optimizations.ts               # Optimized queries + credit ledger
│   │
│   └── rag/
│       ├── embeddings.ts                 # Local TF-IDF vector generation
│       ├── vector-store.ts               # In-memory vector store
│       └── rag-pipeline.ts               # RAG-enhanced analysis pipeline
│
├── pb_hooks/
│   ├── schema.js                         # PocketBase collection definitions (10 collections)
│   └── api.js                            # Custom PocketBase API routes
│
├── pocketbase/
│   └── pb_data/                          # SQLite database directory
│
├── .env                                  # Environment variables
├── package.json                          # Scripts + dependencies
├── tsconfig.json
├── postcss.config.mjs
├── ARCHITECTURE.md                       # This file
├── README.md
└── CLAUDE.md                             # AI assistant instructions
```

### File Count Summary

| Directory | Files | Description |
|---|---|---|
| `app/` | 38 | Pages, layouts, API routes, loading skeletons |
| `components/` | 18 | Reusable UI components |
| `lib/` | 18 | Business logic, cache, logging, RAG, security |
| `pb_hooks/` | 2 | PocketBase schema + API routes |
| Root | 8 | Config files |
| **Total** | **84** | |

---

## 2. Environment Variables

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

---

## 3. Database Schema (PocketBase)

10 collections with role-based access rules:

### Collections

| Collection | Purpose | Access Rules |
|---|---|---|
| `users` | User account (extends PocketBase auth) | user: CRUD own; admin: all |
| `campaigns` | Groups leads together | user: CRUD own; admin: all |
| `leads` | Domain analysis result | list/view: authenticated; create/update/delete: **admin only** |
| `analytics_events` | Event tracking | list/view: admin; create: **admin only** |
| `subscriptions` | Stripe subscription records | list/view: own; create: **admin only**; update: admin |
| `payments` | Payment history | list/view: own; create/update/delete: **admin only** |
| `credit_transactions` | Credit ledger | list/view: own; create/update/delete: **admin only** |
| `email_logs` | Email delivery tracking | list/view: own; create/update/delete: **admin only** |
| `api_keys` | Hash-based API keys | user: CRUD own |
| `user_settings` | Per-user encrypted API keys | user: CRUD own |

### Collection Fields

#### users (extends PocketBase auth)

| Field | Type | Description |
|---|---|---|
| `role` | select | `user`, `admin` |
| `tier` | select | `free`, `growth`, `scale` |
| `creditsRemaining` | number | Default: 50 |
| `stripeCustomerId` | text | Optional |

#### campaigns

| Field | Type | Description |
|---|---|---|
| `user` | relation | → users (cascade delete) |
| `title` | text | Required |
| `description` | text | Optional |
| `isArchived` | bool | Default: false |

#### leads

| Field | Type | Description |
|---|---|---|
| `campaign` | relation | → campaigns (cascade delete) |
| `domain` | text | Required |
| `foundEmail` | text | Optional |
| `viralRoast` | text | Optional |
| `outreachSubject` | text | Optional |
| `outreachBody` | text | Optional |
| `status` | select | `pending`, `processing`, `completed`, `failed` |

#### subscriptions

| Field | Type | Description |
|---|---|---|
| `user` | relation | → users (cascade delete) |
| `stripeSubscriptionId` | text | Unique, optional |
| `stripePriceId` | text | Optional |
| `tier` | select | `free`, `growth`, `scale` |
| `status` | select | `active`, `canceled`, `past_due`, `incomplete` |
| `creditsPerPeriod` | number | Default: 0 |
| `currentPeriodStart` | date | Optional |
| `currentPeriodEnd` | date | Optional |

#### payments

| Field | Type | Description |
|---|---|---|
| `user` | relation | → users (SET NULL on delete) |
| `stripeSessionId` | text | Unique, optional |
| `stripeInvoiceId` | text | Optional |
| `amount` | number | Required |
| `currency` | text | Default: "usd" |
| `tier` | select | `free`, `growth`, `scale` |
| `creditsAdded` | number | Default: 0 |
| `status` | select | `succeeded`, `failed`, `pending`, `refunded` |

#### credit_transactions

| Field | Type | Description |
|---|---|---|
| `user` | relation | → users (SET NULL on delete) |
| `amount` | number | Required |
| `type` | select | `deduction`, `refund`, `purchase`, `signup_bonus`, `promotion` |
| `referenceId` | text | Optional |
| `description` | text | Optional |

#### email_logs

| Field | Type | Description |
|---|---|---|
| `lead` | relation | → leads (cascade delete) |
| `user` | relation | → users (SET NULL on delete) |
| `toEmail` | text | Required |
| `subject` | text | Required |
| `status` | select | `sent`, `delivered`, `bounced`, `failed` |
| `resendId` | text | Optional |

#### api_keys

| Field | Type | Description |
|---|---|---|
| `user` | relation | → users (cascade delete) |
| `keyHash` | text | Unique, required |
| `name` | text | Optional |
| `lastUsedAt` | date | Optional |
| `expiresAt` | date | Optional |
| `isActive` | bool | Default: true |

#### user_settings

| Field | Type | Description |
|---|---|---|
| `user` | relation | → users (cascade delete) |
| `service` | text | e.g., "openrouter" |
| `encryptedKey` | text | AES-256-CBC encrypted |
| `keyPreview` | text | e.g., "sk-or-1...abc" |

### Access Rule Pattern

The `NEVER` constant is used for admin-only create/update/delete operations:

```javascript
const NEVER = "@request.auth.id = '' && @request.auth.id != ''";
// This always evaluates to false, denying all direct client operations
```

All API routes that need to write to restricted collections use `getAdminPB()` instead of the user's token.

### Entity Relationship

```
users (PocketBase auth)
  │
  ├── campaigns (1:N)
  │     └── leads (1:N)
  │           └── email_logs (1:N)
  │
  ├── subscriptions (1:N)
  ├── payments (1:N)
  ├── credit_transactions (1:N)
  ├── analytics_events (1:N)
  ├── api_keys (1:N)
  └── user_settings (1:N)
```

---

## 4. Core AI Prompt (OpenRouter → Gemini 2.5 Flash)

The AI pipeline uses OpenRouter as a proxy to access Google's Gemini 2.5 Flash model:

```
Endpoint: https://openrouter.ai/api/v1/chat/completions
Model: google/gemini-2.5-flash-lite-preview-09-2025
```

### System Prompt

```
You are an elite B2B Growth Hacker and Conversational Copywriter.
Analyze this raw company data:
###
${scrapedWebpageText}
###

Output strictly a JSON object:
{
  "company_pain_point": "...",
  "brutal_viral_roast": "...",
  "email_subject": "...",
  "email_body": "..."
}
```

### RAG-Enhanced Prompt (when similar analyses exist)

```
Based on similar past analyses:
${ragContext}

Analyze this raw company data:
###
${scrapedWebpageText}
###

Output strictly a JSON object:
{
  "company_pain_point": "...",
  "brutal_viral_roast": "...",
  "email_subject": "...",
  "email_body": "..."
}
```

---

## 5. How the System Works (End-to-End Pipeline)

### 5A. The Viral Hook

```
Visitor → ViralRoastEngine → /api/public-roast → OpenRouter → Display Roast → Signup → 50 Credits
```

### 5B. Monetization

```
User → /api/stripe/checkout → Stripe → Webhook → /api/stripe/webhook → PocketBase → Credits Added
                                                                ├── payments table logged
                                                                ├── subscriptions table created
                                                                └── credit_transactions table logged
```

### 5C. Bulk Processing

```
User → /api/bulk-upload (domains as pending) → BulkProcessor (3 concurrent) → /api/pipeline
```

Free tier: single domain via "Roast It" button (no bulk upload).
Growth+: full bulk upload with Stop/Resume via AbortController.

### 5D. Core Pipeline (with RAG + Cache)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        /api/pipeline                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. RATE LIMIT CHECK (sliding window, per IP)                       │
│  2. AUTH + CREDIT CHECK (atomic deduction + ledger)                 │
│  3. DOMAIN VALIDATION (sanitize + regex)                            │
│  4. CACHE CHECK (in-memory LRU, 1hr TTL)                           │
│     ├── HIT → Use cached results, skip scraping/AI                  │
│     └── MISS → Continue to step 5                                   │
│  5. RAG-ENHANCED PIPELINE                                           │
│     ├── Scrape website (cheerio, 8s timeout)                        │
│     ├── Extract emails (regex + filter generics)                    │
│     ├── Search vector store (TF-IDF similarity)                     │
│     ├── Build enhanced prompt with RAG context                      │
│     └── AI GENERATION (OpenRouter → Gemini 2.5 Flash)               │
│  6. CACHE STORE (save results for future requests)                  │
│  7. DB UPDATE (lead status → completed, via admin PB client)        │
│  8. EMAIL SEND (Resend, if email found + email_logs table)          │
│  9. ANALYTICS TRACK (analytics_events table)                        │
│                                                                     │
│  ERROR: Refund credit (+ ledger), mark lead failed, log error       │
└─────────────────────────────────────────────────────────────────────┘
```

### 5E. PocketBase Client Architecture

The app uses two distinct PocketBase clients:

1. **User PB Client** (`lib/auth.ts` → `createPBClient()`): Uses the user's JWT token for reading allowed data (campaigns, leads list, profile, etc.)

2. **Admin PB Client** (`lib/auth.ts` → `getAdminPB()`): Uses admin credentials for write operations on restricted collections (leads create/update, subscriptions create, payments create, etc.)

3. **PBHttp Client** (`lib/pb-http.ts`): Raw `http.request` based client that bypasses Next.js fetch wrapping. Used in API routes for reliable PocketBase API calls.

### 5F. Known PocketBase Quirks

- **No `sort` parameter**: PB 0.25.4 returns 400 on any `sort` query param. All sorting is done client-side.
- **`"false"` not accepted**: PB doesn't accept `"false"` as a valid filter expression. Use `NEVER` constant for deny-all rules.
- **`autoCancellation`**: PB SDK cancels duplicate concurrent requests by default. Disabled via `pb.autoCancellation(false)` to prevent `Promise.all` failures.
- **Cascade delete edge case**: Must delete leads explicitly before campaign in some cases.

---

## 6. RAG & Optimization Layer

### 6A. RAG (Retrieval-Augmented Generation)

| Component | File | Purpose |
|---|---|---|
| Embeddings | `lib/rag/embeddings.ts` | Local TF-IDF vector generation (no external API) |
| Vector Store | `lib/rag/vector-store.ts` | In-memory vector DB with TTL eviction |
| RAG Pipeline | `lib/rag/rag-pipeline.ts` | Enhanced generation with similar domain context |

**How RAG improves results:**
1. Scrapes website content
2. Generates TF-IDF embeddings for the content
3. Searches vector store for similar past analyses
4. Injects relevant context into the AI prompt
5. Gemini generates more informed, specific output

### 6B. Multi-Layer Cache

| Layer | Type | TTL | Max Size | Purpose |
|---|---|---|---|---|
| L1 | In-memory LRU | 10 min | 2000 entries | Hot data (profiles, campaigns) |
| L2 | Vector Store | 24 hrs | 10000 entries | Domain analysis results |

**Cache keys:**
- `profile:{userId}` → 5 min
- `campaign:{id}` → 1 min
- `campaign:{id}:leads` → 30 sec
- `roast:{domain}` → 1 hour
- `stats:{userId}` → 2 min

### 6C. Rate Limiting

| Route | Window | Max Requests | Block Duration |
|---|---|---|---|
| `/api/public-roast` | 1 min | 10 | — |
| `/api/pipeline` | 1 min | 20 | 1 min |
| `/api/auth/login` | 15 min | 5 | 30 min |
| `/api/bulk-upload` | 1 min | 5 | — |

### 6D. Structured Logging

```typescript
// JSON in production, pretty-printed in development
logger.info("Pipeline completed", { domain, durationMs, emailSent });

// Child loggers with prefix
const log = logger.child("pipeline");
log.info("Started", { domain });
```

---

## 7. Security & Performance

### 7A. Security Headers (middleware.ts)

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-XSS-Protection` | `1; mode=block` | XSS protection |
| `Referrer-Policy` | `origin-when-cross-origin` | Control referrer |
| `Permissions-Policy` | `camera=(), microphone=()` | Disable features |

### 7B. Input Security

```typescript
// Domain sanitization
sanitizeDomain("https://www.Example.COM/page") → "example.com"

// XSS prevention
sanitizeInput('<script>alert("xss")</script>') → "&lt;script&gt;..."

// Validation
isValidDomain("example.com") → true
isValidDomain("not a domain") → false
```

### 7C. Authentication Flow

1. User submits email at `/login`
2. `POST /api/auth/login` calls PocketBase `authWithPassword` using admin client
3. Creates session with random per-user password (`crypto.randomBytes(24).toString("base64url")`)
4. Sets `pb_auth` cookie with PB token
5. Middleware validates token via `auth-refresh` on each request
6. `getFullProfile()` fetches fresh profile from PB

### 7D. Per-User API Keys

- Users can bring their own OpenRouter API key
- Keys are encrypted with AES-256-CBC using `crypto.scryptSync`
- Stored in `user_settings` collection with service name "openrouter"
- Pipeline checks for user key first, falls back to app `.env` key
- Preview shown in settings (e.g., "sk-or-1...abc")

### 7E. Error Handling

| Level | Handler | Purpose |
|---|---|---|
| Route | `app/error.tsx` | Per-page error boundary |
| Global | `app/global-error.tsx` | Catch-all errors |
| Class | `ErrorBoundary.tsx` | Component-level |
| Custom | `lib/errors.ts` | Typed error classes |

### 7F. Performance Features

| Feature | Implementation |
|---|---|
| Compression | `next.config.ts: compress: true` |
| Image optimization | AVIF/WebP formats, lazy loading |
| Package optimization | `optimizePackageImports` for framer-motion |
| Static pages | 12 pages pre-rendered at build |
| Sitemap | Auto-generated from routes |
| Robots.txt | Blocks `/api/` and `/dashboard/` |

---

## 8. Component Reference

| Component | Purpose | Used In |
|---|---|---|
| `Navbar` | Auth nav, credits, mobile menu | All pages |
| `Footer` | Links, legal, branding | Landing |
| `ThemeProvider` | Dark/light theme wrapper | Root layout |
| `Toast` | Toast notifications | Root layout |
| `ErrorBoundary` | Class error boundary | Critical sections |
| `ViralRoastEngine` | Viral roast hook | Landing |
| `BulkProcessor` | Queue manager | Campaign detail |
| `CampaignCard` | Campaign card (with kebab menu) | Dashboard |
| `LeadCard` | Lead card | Campaign detail |
| `UpgradeModal` | Stripe modal | Dashboard/billing |
| `StatusBadge` | Status pill | LeadCard |
| `CreditsBadge` | Credits display | Navbar |
| `StatsCard` | Stats card | Dashboard |
| `LoadingSpinner` | Loading state | All loading |
| `EmptyState` | Empty placeholder | Lists |
| `CopyButton` | Copy to clipboard | Lead detail |
| `ConfirmDialog` | Confirm modal | Delete actions |
| `SearchInput` | Search field | Lists |
| `Pagination` | Page navigation | Lists |

---

## 9. API Reference

### Auth

| Method | Endpoint | Auth | Rate Limit |
|---|---|---|---|
| `POST` | `/api/auth/login` | No | 5/15min |
| `POST` | `/api/auth/logout` | No | — |
| `GET` | `/api/auth/me` | No | — |

### Core

| Method | Endpoint | Auth | Rate Limit | Tier |
|---|---|---|---|---|
| `POST` | `/api/public-roast` | No | 10/min | — |
| `POST` | `/api/pipeline` | Yes | 20/min | All |
| `POST` | `/api/bulk-upload` | Yes | 5/min | Growth+ |
| `GET` | `/api/get-pending-leads` | Yes | — | All |

### Data

| Method | Endpoint | Auth |
|---|---|---|
| `GET/PATCH` | `/api/profile` | Yes |
| `GET` | `/api/stats` | Yes |
| `GET/POST` | `/api/campaigns` | Yes |
| `GET/PATCH/DELETE` | `/api/campaigns/[id]` | Yes |
| `GET` | `/api/leads?campaignId=...` | Yes |
| `GET` | `/api/leads/[id]` | Yes |
| `GET/POST/DELETE` | `/api/api-keys` | Yes |
| `GET/POST` | `/api/user-settings` | Yes |

### System

| Method | Endpoint | Auth |
|---|---|---|
| `GET` | `/api/health` | No |
| `GET` | `/api/metrics` | Admin only |
| `GET` | `/api/og` | No |
| `POST` | `/api/stripe/checkout` | Yes (503 if unconfigured) |
| `POST` | `/api/stripe/test-upgrade` | Yes (dev only) |
| `POST` | `/api/stripe/webhook` | No |

### PocketBase Custom Routes (pb_hooks/api.js)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/pipeline` | Yes | PocketBase-side pipeline (fallback) |
| `POST` | `/api/bulk-upload` | Yes | PocketBase-side bulk upload |
| `POST` | `/api/public-roast` | No | Public roast endpoint |
| `GET` | `/api/get-pending-leads` | Yes | Fetch pending leads |
| `POST` | `/api/stripe/checkout` | Yes | Stripe checkout (fallback) |

---

## 10. Deployment Sequence

### Step 1: Setup
```bash
npx create-next-app@latest site-sniper-ai --typescript --tailwind --eslint --app
cd site-sniper-ai
npm install framer-motion resend cheerio stripe jose cookie zod clsx
npm install -D dotenv tsx
```

### Step 2: PocketBase
```bash
# Download PocketBase for your platform
cd pocketbase
# Start server
./pocketbase.exe serve --http=127.0.0.1:8090
# Open admin dashboard at http://127.0.0.1:8090/_/
# Create admin account
# Run collection migration from schema.js
```

### Step 3: Configure Services
1. **OpenRouter** → Get API key from openrouter.ai
2. **Stripe** → Products, keys, webhook secret
3. **Resend** → API key, verify domain

### Step 4: Deploy
```bash
git init && git add . && git commit -m "Initial commit"
gh repo create site-sniper-ai --private --push
# Import in Vercel, add env vars, deploy
# Set Stripe webhook URL
```

### Step 5: Verify
```bash
curl -X POST https://your-app.vercel.app/api/public-roast \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}'
```

### Post-Deploy Checklist

- [ ] PocketBase running with admin account created
- [ ] Set `PB_ADMIN_EMAIL` and `PB_ADMIN_PASS` in production env
- [ ] Set `OpenRouter_API_KEY` in production env
- [ ] Configure Stripe webhook endpoint
- [ ] Verify webhook signature is working
- [ ] Test the full pipeline end-to-end

---

## 11. Unit Economics & Target

### Cost Structure ($0/mo)

| Service | Cost |
|---|---|
| Vercel Hobby | $0 |
| PocketBase (self-hosted) | $0 |
| OpenRouter (Gemini 2.5 Flash) | Pay-per-use (very cheap) |
| Resend Free | $0 |
| Stripe | 2.9% + 30¢/tx |

### Revenue Target

```
Goal: $1,500/mo

Path A: 15 Scale × $99 = $1,485/mo
Path B: 10 Growth × $49 + 10 Scale × $99 = $1,480/mo
Path C: 5 Growth × $49 + 20 Scale × $99 = $2,225/mo
```

### Conversion Funnel

```
LinkedIn DMs: 200/mo → Click: 80 → Try: 64 → Signup: 16 → Convert: 4-5
Time to $1,500/mo: ~3-4 months
```

---

## Appendix: Complete Tech Stack

| Category | Technology | Why |
|---|---|---|
| Framework | Next.js 16 | App Router, React Server Components |
| Language | TypeScript | Full type safety |
| Database | PocketBase (SQLite) | Zero-config, embedded, real-time |
| Auth | PocketBase auth + jose | Built-in user management |
| AI | OpenRouter → Gemini 2.5 Flash | Cheap, fast, no vendor lock-in |
| Embeddings | Local TF-IDF | Zero external API dependency |
| Email | Resend | Simple API, free tier |
| Payments | Stripe | Industry standard |
| Animations | Framer Motion | Declarative, SSR-safe |
| Styling | Tailwind CSS v4 | Utility-first |
| Validation | Zod | Runtime type checking |

---

*Last updated: June 2026. This is a living document — update it as the architecture evolves.*
