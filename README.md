# SkillBridge

A production-quality full-stack service marketplace that connects people who need local or short-term services with skilled providers in their city.

Built as the House of Edtech Fullstack Developer Assignment (Sep 2026).

---

## Problem

Finding trustworthy, local, short-term service providers is fragmented and unreliable. People post on WhatsApp groups or rely on word-of-mouth. There is no structured marketplace for hyperlocal services across education, repairs, design, and more.

## Solution

SkillBridge is a platform where requesters post service needs in plain language, receive offers from providers, accept the best offer, and leave reviews after completion. AI extracts and improves request details, while a deterministic matching algorithm ranks providers by skill, location, budget compatibility, availability, and rating.

---

## Features

- **AI Request Assistant** — Describe your need in plain language; AI extracts title, category, location, budget, and urgency using Vercel AI SDK + Groq
- **AI Description Improver** — One-click AI improvement for vague descriptions, with accept/dismiss workflow
- **Provider Matching** — Weighted scoring algorithm (skill 40%, location 20%, budget 15%, availability 15%, rating 10%) with explainable output
- **Full Service Workflow** — Create Request → Offers Received → Provider Selected → In Progress → Completed → Review
- **Enforced Status Transitions** — Server-side validation of all state changes
- **Offers System** — Providers submit offers; requester accepts one (auto-rejects others) with atomic transactions
- **Messaging** — Conversation started automatically when an offer is accepted
- **Reviews** — Post-completion 1–5 star rating with comments
- **Notifications** — In-app notifications for all key workflow events
- **Dashboard** — Separate requester and provider views with stats
- **Authentication** — Auth.js v5 with JWT sessions, bcrypt password hashing, protected routes
- **Marketplace** — Full-text search, category/location/budget/urgency filters, pagination, shareable URLs

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 + Radix UI primitives |
| Database | MongoDB Atlas |
| ORM | Prisma v6 |
| Auth | Auth.js v5 (NextAuth) |
| AI | Vercel AI SDK + Groq (llama-3.3-70b-versatile) |
| Validation | Zod |
| Toast | Sonner |
| Icons | Lucide React |
| Testing | Vitest (unit) + Playwright (E2E) |
| CI/CD | GitHub Actions |
| Deployment | Vercel |

---

## Architecture

```
Browser
  ↓ (RSC / Client Components)
Next.js 16 — App Router (Vercel)
  ↓
Server Actions / Route Handlers
  ↓
Prisma ORM
  ↓
MongoDB Atlas

Next.js Server
  ↓
Vercel AI SDK
  ↓
Groq API (llama-3.3-70b-versatile)
```

### Next.js Patterns Used

- **Server Components** by default for all pages and data fetching
- **Client Components** only for interactive forms, filters, and dropdowns
- **Server Actions** for all mutations (create, update, delete)
- **Middleware** for route protection and auth redirects
- **SSR** for request detail and marketplace pages
- **Suspense + Skeleton** for streaming request list
- **next/image** for optimized images
- **generateMetadata** for per-page SEO

---

## Database Design

```
User
  ├── ServiceRequest (as requester)
  ├── Offer (as provider)
  ├── UserSkill → Skill
  ├── ConversationParticipant → Conversation → Message
  ├── Review (given and received)
  └── Notification

ServiceRequest
  ├── Offer[]
  ├── Review[]
  └── Conversation (one-to-one)
```

Key indexes: `email`, `status`, `category`, `location`, `createdAt`, `userId`, `requestId`

---

## AI Architecture

```
User types natural language
  ↓
extractRequestFromText() — lib/ai/request-extractor.ts
  ↓
generateObject() — Vercel AI SDK
  ↓
Groq (llama-3.3-70b-versatile)
  ↓
Zod schema validation (extractedRequestSchema)
  ↓
User reviews and edits extracted fields
  ↓
createRequest() Server Action
  ↓
Prisma → MongoDB Atlas
```

AI output is **never trusted blindly**. The user must confirm or edit all AI-extracted fields before saving. The Groq API key is a server-only environment variable — never exposed to the browser.

---

## Security

- Server-side ownership checks on every mutation
- JWT sessions via Auth.js (no database session lookup on every request)
- bcrypt password hashing (cost factor 12)
- Zod input validation on all server actions
- Prisma prevents SQL injection (MongoDB query builder)
- Environment variables for all secrets — none committed to git
- Middleware-based route protection
- Proper HTTP error codes (400/401/403/404/409/500)
- AI output validated against Zod schema before use

---

## Performance

- Server Components reduce JavaScript bundle size
- Paginated queries (default 12 per page, max 50)
- Parallel data fetching with `Promise.all`
- Skeleton loaders for streaming content
- MongoDB indexes on all frequently queried fields
- `next/image` for automatic image optimization
- Dynamic imports where appropriate

---

## Testing

### Unit Tests (Vitest)

```bash
npm run test:unit
```

Tests cover:
- Zod validation schemas (auth, request, offer)
- Provider matching algorithm (score calculation, breakdown, explanations)

### E2E Tests (Playwright)

```bash
npx playwright test
```

Main flow: Login → Create Request → Provider submits offer → Requester accepts → Complete → Review

---

## Environment Variables

```bash
# .env.local
MONGODB_URI=mongodb+srv://...
AUTH_SECRET=your-32-char-secret
GROQ_API_KEY=gsk_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See `.env.example` for the full template.

---

## Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/PrabhavRathi06/skill_bridge.git
cd skill_bridge

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
# Fill in MONGODB_URI, AUTH_SECRET, GROQ_API_KEY

# 4. Generate Prisma client
npm run db:generate

# 5. Push schema to MongoDB Atlas
npm run db:push

# 6. Seed with demo data
npm run db:seed

# 7. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo accounts (password: `Demo@1234`):
- `prabhav@demo.com`
- `ananya@demo.com`
- `rahul@demo.com`

---

## Deployment (Vercel)

1. Push to GitHub
2. Import repo in Vercel
3. Set environment variables:
   - `MONGODB_URI`
   - `AUTH_SECRET`
   - `GROQ_API_KEY`
4. Deploy — Vercel auto-detects Next.js

CI/CD runs on every push: lint → typecheck → unit tests → build.

---

## Project Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/    # Auth.js handler
│   ├── dashboard/                 # User dashboard
│   ├── login/                     # Login page
│   ├── register/                  # Registration page
│   ├── requests/
│   │   ├── [id]/                  # Request detail
│   │   └── new/                   # Create request
│   ├── layout.tsx
│   ├── page.tsx                   # Landing page
│   ├── not-found.tsx
│   └── error.tsx
├── actions/                       # Server Actions
│   ├── auth.ts
│   ├── requests.ts
│   ├── offers.ts
│   ├── reviews.ts
│   ├── messages.ts
│   └── notifications.ts
├── components/
│   ├── layout/                    # Navbar, Footer
│   ├── ui/                        # Base UI components
│   ├── requests/                  # Request-specific components
│   ├── offers/                    # Offer components
│   └── shared/                    # Pagination, etc.
├── lib/
│   ├── ai/                        # Groq AI integration
│   ├── auth.ts                    # Auth.js config
│   ├── matching/                  # Provider matching algorithm
│   ├── prisma.ts                  # Prisma singleton
│   └── validation/                # Zod schemas
├── types/                         # TypeScript types
├── middleware.ts                   # Route protection
└── __tests__/                     # Unit tests

prisma/
├── schema.prisma                  # Database schema
└── seed.ts                        # Demo data seeder
```

---

## Built by

**Prabhav Rathi**

- GitHub: [github.com/PrabhavRathi06](https://github.com/PrabhavRathi06)
- LinkedIn: [linkedin.com/in/prabhav-rathi](https://linkedin.com/in/prabhav-rathi)

House of Edtech — Fullstack Developer Assignment, September 2026
