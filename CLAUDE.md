@AGENTS.md

# SiteSniper AI — AI Assistant Instructions

## Project Overview

SiteSniper AI is a B2B SaaS that scrapes websites, finds pain points using AI, and generates personalized cold outreach. Built with Next.js 16, PocketBase, OpenRouter (Gemini 2.5 Flash), and Stripe.

**Goal:** $1,500/mo revenue · **Budget:** $0 infrastructure

## Critical Architecture Decisions

### Database: PocketBase (NOT PostgreSQL/Prisma)

This project uses **PocketBase** (SQLite-based) as its database. There is NO Prisma, NO PostgreSQL.

- PocketBase runs on `http://127.0.0.1:8090`
- Admin dashboard at `http://127.0.0.1:8090/_/`
- Collections defined in `pb_hooks/schema.js`
- Custom API routes in `pb_hooks/api.js`

### AI: OpenRouter (NOT direct Gemini API)

The AI pipeline uses **OpenRouter** as a proxy to access Gemini models:

```
Endpoint: https://openrouter.ai/api/v1/chat/completions
Model: google/gemini-2.5-flash-lite-preview-09-2025
Header: Authorization: Bearer $OpenRouter_API_KEY
```

Do NOT use direct Gemini API endpoints. The `lib/gemini.ts` file handles OpenRouter integration.

### Embeddings: Local TF-IDF (NOT external API)

RAG embeddings use local TF-IDF vector generation. There is NO external embedding API dependency. See `lib/rag/embeddings.ts`.

### PocketBase Client: PBHttp

All API routes use `lib/pb-http.ts` (raw `http.request`) instead of the PocketBase SDK to bypass Next.js fetch wrapping issues.

## Key Files to Know

| File | Purpose |
|---|---|
| `lib/auth.ts` | `getAdminPB()`, `createPBClient()`, `requireAuth()`, `TIER_LIMITS`, `hasPermission()` |
| `lib/pb-http.ts` | Raw HTTP PocketBase client (use this for API routes) |
| `lib/gemini.ts` | OpenRouter API integration |
| `lib/rag/embeddings.ts` | Local TF-IDF vector generation |
| `lib/types.ts` | Shared TypeScript interfaces (Profile, Campaign, Lead, etc.) |
| `lib/constants.ts` | App-wide constants (poll intervals, batch sizes) |
| `lib/stripe.ts` | Stripe SDK with `requireStripe()` and `isStripeReady()` |
| `pb_hooks/schema.js` | PocketBase collection definitions (10 collections) |
| `pb_hooks/api.js` | Custom PocketBase API routes |

## PocketBase Quirks (IMPORTANT)

1. **No `sort` parameter**: PB 0.25.4 returns 400 on any `sort` query param. Do client-side sorting instead.
2. **`"false"` not accepted**: PB doesn't accept `"false"` as a valid filter expression. Use the `NEVER` constant for deny-all rules:
   ```javascript
   const NEVER = "@request.auth.id = '' && @request.auth.id != ''";
   ```
3. **`autoCancellation`**: PB SDK cancels duplicate concurrent requests by default. Use `pb.autoCancellation(false)` when making parallel requests.
4. **Cascade delete**: Must delete leads explicitly before campaign in some cases.
5. **Restricted collections**: leads, analytics_events, subscriptions, payments, credit_transactions, email_logs all have admin-only create/update/delete rules. API routes must use `getAdminPB()` for write operations.

## Two PB Clients

1. **User PB Client** (`createPBClient(token)`): For reading allowed data with user's JWT
2. **Admin PB Client** (`getAdminPB()`): For write operations on restricted collections

## Tier System

| Tier | Credits | Campaigns | Leads/Campaign | Bulk Upload |
|---|---|---|---|---|
| Free | 50 | 3 | 50 | No |
| Growth | 1,000 | 25 | 500 | Yes |
| Scale | 3,000 | Unlimited | Unlimited | Yes |

Feature gating uses `hasPermission()` from `lib/auth.ts`.

## Styling

- Tailwind CSS v4 with CSS variables for theming
- Dark/light mode via `ThemeProvider`
- All loading skeletons must use CSS variables (`var(--card)`, `var(--input-bg)`, `var(--card-border)`) — NOT hardcoded colors
- Glassmorphism effects for modals and cards

## Testing

Run the dev server and PocketBase, then test with:

```powershell
# Login
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body '{"email":"demo@sitesniper.ai"}' -ContentType "application/json" -SessionVariable sess

# Test endpoints
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/me" -WebSession $sess
Invoke-WebRequest -Uri "http://localhost:3000/api/campaigns" -WebSession $sess
Invoke-WebRequest -Uri "http://localhost:3000/api/stats" -WebSession $sess
```

## Build

```bash
npm run build  # Must pass with 0 TypeScript errors
```

34 routes (12 static + 22 dynamic), 0 errors expected.

## Common Pitfalls

- Using `sort` in PB API calls → 400 error
- Using `"false"` in PB filter expressions → error
- Using PocketBase SDK in Next.js API routes → fetch conflicts → use PBHttp
- Using direct Gemini API → use OpenRouter
- Using external embedding API → use local TF-IDF
- Hardcoded dark-only colors in components → use CSS variables
- Calling `fetchUser()` on pathname change in Navbar → redundant refetch
