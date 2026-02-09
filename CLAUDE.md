# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Poolift** is a collaborative gift coordination platform built with Next.js 16, Supabase, and TypeScript. It helps groups of families organize joint birthday parties, create direct gifts, and coordinate purchases.

**Key Innovation:** Supports joint parties where multiple children celebrate together (e.g., "Juan y Gina's party on Oct 10").

**Stack:**

- Frontend: Next.js 16 (App Router, Turbopack)
- Database: Supabase (PostgreSQL + Real-time)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS
- Testing: Vitest + React Testing Library
- Forms: react-hook-form + zod
- Icons: lucide-react

---

## Spec-Driven Development

**Before writing any code, always consult the `.ai/` directory.** This is the single source of truth for architecture, coding standards, design system, and agent roles.

Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.

### `.ai/` Directory Structure

```
.ai/
├── agents/                    # Role-specific agent instructions
│   ├── architect.md           # System design & ADRs
│   ├── backend-dev.md         # API routes, Supabase patterns
│   ├── frontend-dev.md        # Components, React patterns
│   ├── reviewer.md            # Code review checklist
│   ├── tester.md              # Test patterns & coverage
│   └── devops.md              # CI/CD, deployment
│
├── context/                   # Quick-reference architecture docs
│   ├── architecture.md        # Tech stack, DB schema, file structure
│   └── patterns.md            # Code patterns (components, API, UI, tests)
│
├── specs/                     # Coding standards & quality gates
│   ├── coding-standards/
│   │   ├── react.md           # React/Next.js best practices (Vercel-based)
│   │   └── typescript.md      # TypeScript strict mode standards
│   └── quality-gates/
│       └── checklist.md       # Pre-commit, pre-PR, pre-merge checks
│
├── design/                    # Design system
│   └── system.md              # Tokens, components, patterns
│
└── prompts/                   # Reusable prompts
    └── component-creation.md  # Templates for new components
```

### Workflow

1. **Read `.ai/context/`** for architecture overview and existing patterns
2. **Read `.ai/specs/`** for coding standards before writing code
3. **Read `.ai/design/system.md`** before any UI work
4. **Read `.ai/agents/<role>.md`** for role-specific patterns (backend, frontend, testing)
5. **Check `.ai/specs/quality-gates/checklist.md`** before finishing

---

## Commands

```bash
# Development
npm run dev           # Start dev server with Turbopack
npm run build         # Production build
npm run start         # Start production server
npm run lint          # ESLint check

# Testing (Vitest)
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:ui       # Open Vitest UI (recommended)
npm run coverage      # Run tests with coverage report

# Database
# Access Supabase dashboard at https://supabase.com
```

---

## Architecture

### Data Model Flow

**Core entities follow this workflow:**

```
1. Groups → contain → Families (users joining via invite_code)
2. Families → create → Birthdays (children's records)
3. Birthdays → participate in → Parties (events)
4. Parties ← linked via → PartyCelebrants (many-to-many)
5. Proposals → created for → Parties (formal gift proposals)
6. ProposalItems → belong to → Proposals (items in proposal)
7. Votes → cast by Families → on Proposals
8. Gifts → created directly or from selected Proposals
9. Participants → join → Gifts (families contributing)
```

### Database Schema

**Core Tables:**

- `groups` - Top-level groups (e.g., "Clase 2B")
- `families` - Families belonging to groups
- `birthdays` - Child records (name + birth_date only)
- `parties` - Events celebrating one or more children
- `party_celebrants` - Many-to-many: parties ↔ birthdays

**Gift Flow Tables:**

- `proposals` - Formal gift proposals for parties
- `proposal_items` - Items within proposals
- `votes` - Family votes on proposals
- `gifts` - Created when proposal is selected or directly
- `participants` - Families participating in gift

### Key Design Decisions

**Party Model (v2.0):**

- Parties are **separate entities** from Birthdays
- A party can celebrate **multiple children** (joint parties)
- Birthdays only store: child_name, birth_date
- Parties store: party_date, coordinator_id
- Use `CreatePartyModal` to select celebrants

**Coordinator Assignment:**

- Auto-assigned on rotation (family with fewest coordinations)
- Can be manually selected when creating party
- Tracked to ensure fair distribution

**Invite System:**

- Groups have unique `invite_code` (12 chars)
- Share via WhatsApp link: `/groups/[inviteCode]`
- No authentication required (family-based)

---

## Key Patterns & Best Practices

### Server Components by Default

Only add `'use client'` when absolutely necessary:

- Using useState, useEffect, or other hooks
- Event handlers (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)
- Real-time subscriptions

### Parallel Data Fetching

Always use `Promise.all()` for independent requests:

```typescript
const [parties, families] = await Promise.all([
  fetch("/api/parties?groupId=X"),
  fetch("/api/families?groupId=X"),
]);
```

### Tree-Shakeable Imports

```typescript
// GOOD
import { Gift, Calendar, Users } from "lucide-react";

// BAD - Imports entire library
import * as Icons from "lucide-react";
```

### Lazy Load Modals

Use `next/dynamic` for modals to improve initial load:

```typescript
import dynamic from 'next/dynamic'

const CreatePartyModal = dynamic(() =>
  import('@/components/modals/CreatePartyModal')
)
```

### Next.js 16 Route Params

Route params are now a Promise:

```typescript
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
}
```

### Supabase Usage

**Direct Supabase in Server Components:**

```typescript
import { supabase } from "@/lib/supabase";

async function getParties(groupId: string) {
  const { data, error } = await supabase
    .from("parties")
    .select(`
      *,
      coordinator:families!parties_coordinator_id_fkey(id, name),
      party_celebrants(
        birthdays(child_name)
      )
    `)
    .eq("group_id", groupId);

  if (error) throw error;
  return data;
}
```

**API Routes for Client Components:**

```typescript
const response = await fetch("/api/parties?groupId=X");
const { parties } = await response.json();
```

---

## Directory Structure

```
poolift/
├── .ai/                          # Spec-driven development (see above)
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── create-group/             # Group creation flow
│   ├── groups/[inviteCode]/      # Join group flow
│   ├── dashboard/[groupId]/      # Main dashboard
│   │   ├── page.tsx              # Party list
│   │   └── parties/[partyId]/    # Party detail
│   │       └── page.tsx
│   └── api/                      # API routes
│
├── components/
│   ├── ui/                       # Base components (Button, Modal, Card, etc.)
│   ├── modals/                   # Lazy-loaded modals
│   ├── cards/                    # Display cards
│   ├── groups/                   # Group components
│   ├── parties/                  # Party components
│   ├── gifts/                    # Gift components
│   └── birthdays/                # Birthday components
│
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── types.ts                  # TypeScript interfaces
│   ├── utils.ts                  # Helper functions
│   ├── validators.ts             # Delete/business validations
│   ├── messages.ts               # WhatsApp messages
│   └── hooks/                    # Custom hooks
│
└── __tests__/
    ├── components/               # Component tests
    ├── lib/                      # Utility & validator tests
    └── api/                      # API tests
```

---

## API Routes

All routes in `app/api/`:

### Groups & Families

- `POST /api/groups` - Create group
  - Body: `{ name, familyName }`
  - Returns: `{ group, family, inviteCode }`
- `GET /api/families?groupId=X` - List families

### Birthdays

- `POST /api/birthdays` - Add birthday
  - Body: `{ groupId, childName, birthDate }`
- `GET /api/birthdays?groupId=X` - List birthdays

### Parties

- `POST /api/parties` - Create party
  - Body: `{ groupId, partyDate, celebrantIds[], coordinatorId? }`
- `GET /api/parties?groupId=X` - List parties with celebrants

### Proposals

- `POST /api/proposals` - Create proposal
  - Body: `{ partyId, name, totalPrice, items[] }`
- `GET /api/proposals?partyId=X` - List proposals with votes
- `POST /api/proposals/[id]/vote` - Vote on proposal
  - Body: `{ voterName }`
- `PUT /api/proposals/[id]/select` - Select winning proposal

### Direct Gifts

- `POST /api/direct-gifts` - Create gift directly
- `GET /api/direct-gifts?groupId=X` - List direct gifts

---

## Testing

### Running Tests

```bash
npm test              # Watch mode with hot reload
npm run test:ui       # Visual UI (recommended - opens browser)
npm run test:run      # Single run (for CI)
npm run coverage      # With coverage report
```

### Test Structure

```
__tests__/
├── components/
│   ├── AddBirthdayModal.test.tsx
│   ├── CreatePartyModal.test.tsx
│   ├── CreateDirectGiftModal.test.tsx
│   ├── DirectGiftOrganizerActions.test.tsx
│   ├── DirectGiftParticipation.test.tsx
│   ├── CreateGroupPage.test.tsx
│   ├── JoinGroupForm.test.tsx
│   ├── GroupHeader.test.tsx
│   ├── InviteCodeModal.test.tsx
│   ├── ConfirmDeleteModal.test.tsx
│   └── Button.test.tsx
├── lib/
│   ├── utils.test.ts
│   └── validators.test.ts
└── api/
    └── direct-gifts.test.ts
```

**Current Status:** 14 test files, **210 tests passing**

### Testing Patterns

See `.ai/agents/tester.md` for full patterns. Key approach:

- Test behavior, not implementation
- Use accessible queries (getByRole, getByLabelText)
- Mock fetch at the boundary
- Test error states and edge cases

---

## Form Handling

All forms use **react-hook-form** with **zod** validation:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  childName: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  birthDate: z.string().min(1, 'Fecha requerida')
})

type FormData = z.infer<typeof schema>
```

---

## Validation Rules

**Birthdays:**

- Name: min 2, max 50 characters
- Date: cannot be in the future (HTML max=today)

**Parties:**

- Date: cannot be in the past (HTML min=today)
- Celebrants: at least 1 required

**Proposals:**

- Name: required
- Items: at least 1 item
- Item prices: must be > 0
- Total: auto-calculated

---

## Important Notes

### API Field Naming

The `/api/groups` endpoint expects:

```typescript
// CORRECT
{ name: "Clase 2B", familyName: "Familia García" }

// INCORRECT (old names)
{ groupName: "...", creatorName: "..." }
```

### Coordinator Assignment

**Automatic rotation:**

```typescript
// System counts parties coordinated by each family
// Assigns to family with fewest coordinations
// If tie, picks first family
```

### Path Alias

Use `@/` for absolute imports from project root:

```typescript
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import type { Party } from "@/lib/types";
```

---

## Security Model

### RLS (Row Level Security)

Poolift uses **API-layer validation** instead of Supabase RLS.

**Why:**

- Family-based trust model (no authentication)
- Closed groups (not public internet)
- Validations in `lib/validators.ts`
- Simpler architecture

**RLS Status:** Disabled on all tables

**Future:** When implementing real auth (Supabase Auth, Clerk, etc.),
enable RLS with proper policies based on `auth.uid()`.

---

## Troubleshooting

### Port Already in Use (Windows)

```bash
taskkill /F /IM node.exe
# Or use different port
npm run dev -- -p 3001
```

### Build Errors

```bash
rmdir /s /q .next
npm run build
```

### TypeScript Errors

```bash
npx tsc --noEmit
```

### Supabase Connection

Verify environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

---

## Git Workflow

### Commit Conventions

```
feat: Add CreatePartyModal with celebrant selection
fix: Correct date validation in AddBirthdayModal
test: Add tests for ProposalCard voting
docs: Update CLAUDE.md with testing patterns
refactor: Extract price calculation to utils
```

---

## Deployment

### Environment Variables

**Required:**

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=https://poolift.com
```

### Vercel Deployment

```bash
vercel          # Preview
vercel --prod   # Production
```

---

## Quick Reference

### Most Common Tasks

**Add a new modal:**

1. Check `.ai/prompts/component-creation.md` for template
2. Create in `components/modals/`
3. Add `'use client'`, use react-hook-form + zod
4. Lazy load with `next/dynamic`
5. Add tests in `__tests__/components/`

**Add a new API route:**

1. Check `.ai/agents/backend-dev.md` for patterns
2. Create in `app/api/[resource]/route.ts`
3. Validate with Zod, use Supabase client
4. Return NextResponse.json()

**Add a new page:**

1. Create in `app/[route]/page.tsx`
2. Use Server Component by default
3. Parallel data fetching with Promise.all

**Add a new component:**

1. Check `.ai/design/system.md` for design tokens
2. Check `.ai/specs/coding-standards/react.md` for patterns
3. Create in appropriate `components/` subfolder
4. Add tests

---

**Last Updated:** February 2026
**Version:** 2.0
