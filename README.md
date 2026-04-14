# Poolift

> Platform for coordinating group gifts among families — fast, transparent, and without registration.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-372%2B%20passing-brightgreen)](https://vitest.dev/)

---

## What it does

Poolift solves the WhatsApp chaos of organizing group gifts. Families can coordinate shared birthday gifts, propose ideas, vote, and track contributions — all without mandatory registration.

**Two gift flows:**
- **Direct gift** — one person organizes a single gift, shares a link, participants join
- **Group gift** — families in a group coordinate gifts across multiple parties and birthdays

---

## Main Features

- Anonymous-first: use the app fully without creating an account
- Anonymous → Auth migration: data is preserved when a user registers later
- Group management with invite codes (12-char shareable URL)
- Birthday and party tracking (individual and joint parties)
- Proposal system with family voting
- Direct gifts with share-code-based participation
- Participant status tracking (joined / declined)
- Expense calculator for split cost scenarios
- Dark mode support

---

## Tech Stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)              |
| Language   | TypeScript (strict)                             |
| Database   | Supabase (PostgreSQL + Auth + RLS)              |
| Styling    | Tailwind CSS v4                                 |
| Forms      | react-hook-form + Zod                           |
| Testing    | Vitest + React Testing Library (372+ tests)     |
| Icons      | lucide-react                                    |
| Date UI    | react-day-picker v9                             |

---

## Project Structure

```
poolift/
├── app/
│   ├── api/                        # 27 API routes
│   │   ├── groups/
│   │   ├── families/
│   │   ├── birthdays/
│   │   ├── parties/
│   │   ├── proposals/
│   │   ├── gifts/
│   │   │   └── direct/             # Direct gift endpoints
│   │   └── ideas/
│   ├── dashboard/[groupId]/        # Group dashboard + party detail
│   ├── gifts/[shareCode]/          # Public direct gift view
│   ├── coordinator/[giftId]/       # Group gift purchase flow
│   ├── organizer/[giftId]/         # Direct gift organizer flow
│   ├── create-group/               # Group onboarding
│   ├── create-direct-gift/         # Direct gift creation
│   ├── calculadora/                # Expense calculator
│   ├── start/                      # Entry point chooser
│   ├── join/                       # Join via invite code
│   └── auth/                       # Auth callbacks + password reset
├── components/
│   ├── modals/                     # All lazy-loaded modals
│   ├── cards/                      # PartyCard, ProposalCard, etc.
│   ├── ui/                         # Base components (Modal, Tabs, DatePickerInput…)
│   ├── auth/                       # UserMenu, auth guards
│   ├── nav/                        # Navigation components
│   └── [domain]/                   # gifts/, groups/, birthdays/, parties/…
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   └── server.ts               # Server / API routes client
│   ├── auth.ts                     # useUser, signIn, signUp, signOut, magic link
│   ├── migrate.ts                  # Anonymous → Auth data migration
│   ├── storage.ts                  # localStorage session helpers
│   ├── validators.ts               # Zod schemas
│   └── types.ts                    # TypeScript interfaces
└── __tests__/                      # 19 test files, 372+ cases
```

---

## Database (13 tables)

```
groups ──── families ──── birthdays
                │               └── [via party_celebrants]
                │
              parties ──── party_celebrants
                │
                ├── proposals ──── proposal_items
                │         └── votes
                │
                └── gifts ──── participants

direct_gifts ──── direct_gift_participants
```

**Security:** RLS enabled on all tables. Current policies are permissive (market validation phase). The migration to restrictive policies is documented in `supabase/migrations/`.

---

## API Reference

### Groups & Families
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/groups` | Create group |
| GET | `/api/families?groupId=` | List families |
| PUT | `/api/families/link` | Link families to auth user |

### Birthdays & Parties
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/birthdays` | Add birthday |
| GET | `/api/birthdays?groupId=` | List birthdays |
| POST | `/api/parties` | Create party |
| GET | `/api/parties?groupId=` | List parties |

### Proposals & Voting
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/proposals` | Create proposal |
| GET | `/api/proposals?partyId=` | List proposals |
| POST | `/api/proposals/[id]/vote` | Vote on proposal |
| PUT | `/api/proposals/[id]/select` | Select winning proposal |

### Direct Gifts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/gifts/direct` | Create direct gift |
| GET | `/api/gifts/direct?shareCode=` | Get by share code |
| POST | `/api/gifts/direct/[id]/participate` | Join or decline |
| PUT | `/api/gifts/direct/[id]/close` | Close participation |
| PUT | `/api/gifts/direct/[id]/finalize` | Finalize with price |
| PUT | `/api/gifts/direct/[id]/cancel` | Cancel gift |
| PUT | `/api/gifts/direct/link` | Link gifts to auth user |

### Group Gifts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/gifts/[id]/participate` | Join or decline group gift |

---

## Setup

### Prerequisites

```
Node.js 18+
Supabase project
```

### Install

```bash
git clone <repository-url>
cd poolift
npm install
```

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=https://poolift.vercel.app
```

### Run

```bash
npm run dev       # Dev server (Turbopack) → http://localhost:3000
npm run build     # Production build
npm run lint      # ESLint
```

---

## Testing

```bash
npm test                              # Watch mode
npm run test:run                      # Single run (CI)
npm run test:ui                       # Browser UI
npm run coverage                      # Coverage report

# Run a specific file or test
npm run test:run -- AddBirthdayModal
npm run test:run -- --grep "envía formulario"
```

372+ tests across components, API routes, and utilities.

---

## Deployment

Recommended: [Vercel](https://vercel.com)

```bash
vercel --prod
```

Set the three environment variables listed above in the Vercel dashboard.

---

## License

MIT
