# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Poolift** is a collaborative gift coordination platform built with Next.js 16, Supabase, and TypeScript. It helps groups of families organize joint birthday parties, propose gift ideas, vote on proposals, and coordinate purchases.

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

Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.

**Core entities follow this workflow:**

```
1. Groups → contain → Families (users joining via invite_code)
2. Families → create → Birthdays (children's records)
3. Birthdays → participate in → Parties (events)
4. Parties ← linked via → PartyCelebrants (many-to-many)
5. Ideas → suggested for → Birthdays (gift suggestions)
6. Proposals → created for → Parties (formal gift proposals)
7. ProposalItems → belong to → Proposals (items in proposal)
8. Votes → cast by Families → on Proposals
9. Gifts → created from → selected Proposals
10. Participants → join → Gifts (families contributing)
```

### Database Schema (11 tables)

**Core Tables:**

- `groups` - Top-level groups (e.g., "Clase 2B")
- `families` - Families belonging to groups
- `birthdays` - Child records (name + birth_date only)
- `parties` - Events celebrating one or more children
- `party_celebrants` - Many-to-many: parties ↔ birthdays

**Gift Flow Tables:**

- `ideas` - Gift suggestions for birthdays
- `proposals` - Formal gift proposals for parties
- `proposal_items` - Items within proposals
- `votes` - Family votes on proposals
- `gifts` - Created when proposal is selected
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

- ✅ Using useState, useEffect, or other hooks
- ✅ Event handlers (onClick, onChange, etc.)
- ✅ Browser APIs (localStorage, window, etc.)
- ✅ Real-time subscriptions

**Example:**

```typescript
// ✓ Server Component (default)
export default async function DashboardPage({ params }) {
  const { groupId } = await params
  const parties = await getParties(groupId)
  return <PartyList parties={parties} />
}

// ✓ Client Component (only when needed)
'use client'
export function CreatePartyButton() {
  const [showModal, setShowModal] = useState(false)
  return <button onClick={() => setShowModal(true)}>Create</button>
}
```

### Parallel Data Fetching

Always use `Promise.all()` for independent requests:

```typescript
// ✓ GOOD - Parallel
const [parties, ideas, families] = await Promise.all([
  fetch("/api/parties?groupId=X"),
  fetch("/api/ideas?partyId=Y"),
  fetch("/api/families?groupId=X"),
]);

// ✗ BAD - Sequential (slow)
const parties = await fetch("/api/parties");
const ideas = await fetch("/api/ideas");
const families = await fetch("/api/families");
```

### Tree-Shakeable Imports

Import icons individually to reduce bundle size:

```typescript
// ✓ GOOD
import { Gift, Calendar, Users } from "lucide-react";

// ✗ BAD - Imports entire library
import * as Icons from "lucide-react";
```

### Lazy Load Modals

Use `next/dynamic` for modals to improve initial load:

```typescript
import dynamic from 'next/dynamic'

const CreatePartyModal = dynamic(() =>
  import('@/components/modals/CreatePartyModal')
)

function PartyList() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button onClick={() => setShowModal(true)}>Create Party</button>
      {showModal && (
        <CreatePartyModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
```

### Next.js 16 Route Params

Route params are now a Promise:

```typescript
// ✓ CORRECT for Next.js 16
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // use id...
}

// ✗ OLD (Next.js 15)
export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;
}
```

### Supabase Usage

**Direct Supabase in Server Components:**

```typescript
import { supabase } from "@/lib/supabase";

async function getParties(groupId: string) {
  const { data, error } = await supabase
    .from("parties")
    .select(
      `
      *,
      coordinator:families!parties_coordinator_id_fkey(id, name),
      party_celebrants(
        birthdays(child_name)
      )
    `,
    )
    .eq("group_id", groupId);

  if (error) throw error;
  return data;
}
```

**API Routes for Client Components:**

```typescript
// Use when client component needs data
const response = await fetch("/api/parties?groupId=X");
const { parties } = await response.json();
```

---

## Directory Structure

```
poolift/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── create-group/             # Group creation flow
│   ├── groups/[inviteCode]/      # Join group flow
│   ├── dashboard/[groupId]/      # Main dashboard
│   │   ├── page.tsx              # Party list
│   │   └── parties/[partyId]/    # Party detail
│   │       └── page.tsx
│   └── api/                      # API routes (see below)
│
├── components/
│   ├── ui/                       # Base components
│   │   ├── Modal.tsx             # Reusable modal
│   │   ├── Button.tsx            # Button variants
│   │   └── Tabs.tsx              # Tab system
│   ├── modals/                   # Lazy-loaded modals
│   │   ├── CreatePartyModal.tsx
│   │   ├── AddBirthdayModal.tsx
│   │   ├── AddIdeaModal.tsx
│   │   └── AddProposalModal.tsx
│   ├── cards/                    # Display cards
│   │   ├── PartyCard.tsx
│   │   ├── ProposalCard.tsx
│   │   └── IdeasByChild.tsx
│   └── parties/                  # Party-specific
│       ├── AddIdeaButton.tsx
│       └── AddProposalButton.tsx
│
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── types.ts                  # TypeScript interfaces
│   ├── utils.ts                  # Helper functions
│   ├── messages.ts               # WhatsApp messages
│   └── hooks/                    # Custom hooks
│       ├── useParties.ts
│       ├── useBirthdays.ts
│       └── useRealtime.ts
│
└── __tests__/
    ├── components/               # Component tests
    ├── lib/                      # Utility tests
    └── api/                      # API tests (planned)
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

### Ideas

- `POST /api/ideas` - Add idea
  - Body: `{ birthdayId, productName, price?, link?, comment?, suggestedBy }`
- `GET /api/ideas?partyId=X` - Get ideas for all party celebrants
- `GET /api/ideas?birthdayId=X` - Get ideas for specific child

### Proposals

- `POST /api/proposals` - Create proposal
  - Body: `{ partyId, name, totalPrice, items[] }`
- `GET /api/proposals?partyId=X` - List proposals with votes
- `POST /api/proposals/[id]/vote` - Vote on proposal
  - Body: `{ voterName }`
- `PUT /api/proposals/[id]/select` - Select winning proposal

### Gifts (Pending Implementation)

- `POST /api/gifts` - Create gift from selected proposal
- `GET /api/gifts?shareCode=X` - Get gift details
- `POST /api/gifts/[id]/participate` - Join gift
- `DELETE /api/gifts/[id]/participate` - Leave gift
- `PUT /api/gifts/[id]/close` - Close participation
- `PUT /api/gifts/[id]/finalize` - Finalize with receipt

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
│   ├── AddBirthdayModal.test.tsx    # 16 tests
│   ├── AddIdeaModal.test.tsx        # 14 tests
│   ├── CreatePartyModal.test.tsx    # 16 tests
│   ├── Button.test.tsx              # 4+ tests
│   └── PartyCard.test.tsx           # Planned
├── lib/
│   └── utils.test.ts                # 6+ tests
└── api/                              # Planned
    ├── parties.test.ts
    └── proposals.test.ts
```

**Current Status:** 57+ tests passing

### Testing Patterns

**Modal Component Tests:**

```typescript
describe("CreatePartyModal", () => {
  it("renders correctly when open");
  it("loads celebrants dynamically");
  it("validates required fields");
  it("disables submit without celebrants");
  it("handles successful submission");
  it("displays errors from server");
  it("closes after success with delay");
});
```

**Card Component Tests:**

```typescript
describe("PartyCard", () => {
  it("displays party date formatted");
  it("shows single celebrant name");
  it('shows multiple celebrants with "y"');
  it("shows coordinator name");
  it("is clickable/navigates to detail");
});
```

**Validation Tests:**

```typescript
it("validates minimum length", async () => {
  await user.type(nameInput, "J");
  expect(submitButton).toBeDisabled();
});
```

---

## Real-time Updates

Use the `useRealtime` hook for Supabase real-time subscriptions:

```typescript
'use client'
import { useRealtime } from '@/lib/hooks/useRealtime'

export function ParticipantsList({ giftId }: { giftId: string }) {
  const [participants, setParticipants] = useState([])

  useRealtime(
    'participants',
    { column: 'gift_id', value: giftId },
    (newParticipant) => {
      setParticipants(prev => [...prev, newParticipant])
    },
    (updatedParticipant) => {
      setParticipants(prev =>
        prev.map(p => p.id === updatedParticipant.id ? updatedParticipant : p)
      )
    },
    (deletedParticipant) => {
      setParticipants(prev =>
        prev.filter(p => p.id !== deletedParticipant.id)
      )
    }
  )

  return (
    <ul>
      {participants.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  )
}
```

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

export function AddBirthdayModal() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FormData) => {
    const response = await fetch('/api/birthdays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    // handle response...
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('childName')} />
      {errors.childName && <span>{errors.childName.message}</span>}
      {/* ... */}
    </form>
  )
}
```

---

## TypeScript Types

All types are in `lib/types.ts`. Use them for type safety:

```typescript
import type {
  Party,
  Birthday,
  Proposal,
  PartyWithRelations,
} from "@/lib/types";

// For API responses with relations
interface PartyWithRelations {
  id: string;
  party_date: string;
  coordinator: { name: string } | null;
  party_celebrants: Array<{
    birthdays: { child_name: string };
  }>;
}
```

---

## Utilities

### Common Helpers (`lib/utils.ts`)

```typescript
// Calculate price per family
calculatePricePerFamily(100, 4); // "25.00"

// Format celebrant names
formatCelebrants(["Juan", "Gina", "Pedro"]); // "Juan, Gina y Pedro"

// Format date in Spanish
formatDate("2025-10-10"); // "10 de octubre de 2025"

// Format price
formatPrice(25.5); // "25.50€"
```

### WhatsApp Messages (`lib/messages.ts`)

```typescript
// Generate invite message
generateInviteMessage("Clase 2B", "ABC123");

// Generate participation message
generateParticipationMessage(
  ["Juan", "Gina"],
  "10 de octubre",
  "Set LEGO",
  75.98,
  "SHARE123",
);
```

---

## Project Status

### ✅ Completed (80%)

**Infrastructure:**

- ✅ Database schema (11 tables in Supabase)
- ✅ Backend APIs (15+ endpoints)
- ✅ Frontend setup with Vitest
- ✅ TypeScript configuration

**CRUD Modals (100%):**

- ✅ CreatePartyModal (16 tests) - Select multiple celebrants
- ✅ AddBirthdayModal (16 tests) - Simple child record
- ✅ AddIdeaModal (14 tests) - Gift suggestions
- ✅ AddProposalModal - Formal proposals with items

**Screens:**

- ✅ Landing page (basic)
- ✅ Dashboard/Calendar - Shows party cards
- ✅ Party Detail - Tabs for Proposals/Ideas

**Components:**

- ✅ PartyCard (clickable, shows celebrants)
- ✅ ProposalCard (with voting)
- ✅ IdeasByChild (grouped display)
- ✅ Tabs system
- ✅ Modal, Button (base UI)

**Features:**

- ✅ Create birthdays
- ✅ Create parties (individual & joint)
- ✅ Add ideas (grouped by child)
- ✅ Create proposals (dynamic items)
- ✅ Vote on proposals
- ✅ Real-time participant lists

**Tests:**

- ✅ 57+ tests passing
- ✅ Coverage >80% on core components

### ⏳ In Progress (15%)

**Onboarding Flow:**

- ⏳ Create Group page
- ⏳ Join Group flow (/groups/[inviteCode])
- ⏳ Landing page improvements

### 📅 Pending (5%)

**Gift Flow (6 features):**

- Select winning proposal
- Create gift + share code
- Public participant view (/gifts/[shareCode])
- Join/leave participation
- Close participation (coordinator)
- Purchase flow + receipt upload

---

## Important Notes

### Party Model Architecture

**Key Difference from Wireframes:**

- Original: Each birthday had its own party_date
- Current: Parties are separate entities that reference birthdays

**Why:**

- Supports joint parties (Juan + Gina = 1 party)
- Flexible date selection (party date ≠ birthday date)
- Single coordinator per party
- Simpler gift coordination

**Usage:**

1. Add birthdays (just name + birth_date)
2. Create party and select celebrants
3. System auto-assigns coordinator

### API Field Naming

⚠️ **Important:** The `/api/groups` endpoint expects:

```typescript
// ✓ CORRECT
{ name: "Clase 2B", familyName: "Familia García" }

// ✗ INCORRECT (old names)
{ groupName: "...", creatorName: "..." }
```

### Validation Rules

**Birthdays:**

- Name: min 2, max 50 characters
- Date: cannot be in the future (HTML max=today)

**Parties:**

- Date: cannot be in the past (HTML min=today)
- Celebrants: at least 1 required

**Ideas:**

- Product name: min 3 characters
- Price: must be > 0 if provided

**Proposals:**

- Name: required
- Items: at least 1 item
- Item prices: must be > 0
- Total: auto-calculated

### Coordinator Assignment

**Automatic rotation:**

```typescript
// System counts parties coordinated by each family
// Assigns to family with fewest coordinations
// If tie, picks first family
```

**Manual override:**

- Can select specific coordinator in CreatePartyModal
- Optional dropdown

### Path Alias

Use `@/` for absolute imports from project root:

```typescript
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import type { Party } from "@/lib/types";
```

---

## Troubleshooting

### Port Already in Use

**Windows:**

```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Or kill specific process
taskkill /PID [PID] /F

# Or use different port
npm run dev -- -p 3001
```

### Build Errors

**Clear .next cache:**

```bash
# Windows
rmdir /s /q .next
npm run dev

# Or
npm run build
```

### TypeScript Errors

**Check for type issues:**

```bash
npm run build  # Runs TypeScript compiler
npx tsc --noEmit  # Type check only
```

### Supabase Connection

**Verify environment variables in `.env.local`:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # Optional for admin operations
```

**Test connection:**

```typescript
import { supabase } from "@/lib/supabase";

const { data, error } = await supabase.from("groups").select("*").limit(1);

console.log({ data, error });
```

### Test Failures

**Clear test cache:**

```bash
npm test -- --clearCache
```

**Update snapshots:**

```bash
npm test -- -u
```

---

## Git Workflow

### Recommended Branches

```bash
main          # Production-ready code
develop       # Integration branch
feature/*     # Feature development
bugfix/*      # Bug fixes
```

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

**Required for production:**

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=https://poolift.com
```

**Optional:**

```env
SUPABASE_SERVICE_ROLE_KEY=  # For admin operations
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Configure in Vercel Dashboard:**

- Add environment variables
- Set Node version to 18+
- Enable Turbopack (automatic in Next.js 16)

---

## Additional Resources

**Documentation:**

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vitest Docs](https://vitest.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

**Project Files:**

- `REACT_BEST_PRACTICES_POOLIFT.md` - Vercel standards
- `CLAUDE_CODE_INSTRUCTIONS.md` - Development guide
- `CAMBIO_MODELO_PARTY.md` - Party model explanation

---

## Quick Reference

### Most Common Tasks

**Add a new modal:**

1. Create in `components/modals/`
2. Add `'use client'`
3. Use react-hook-form + zod
4. Lazy load with `next/dynamic`
5. Add tests in `__tests__/components/`

**Add a new API route:**

1. Create in `app/api/[resource]/route.ts`
2. Export GET/POST/PUT/DELETE functions
3. Use Supabase client
4. Return NextResponse.json()
5. Add error handling

**Add a new page:**

1. Create in `app/[route]/page.tsx`
2. Use Server Component by default
3. Fetch data with Supabase or API
4. Add types from `lib/types.ts`
5. Test with real data

**Add a new component:**

1. Create in appropriate `components/` subfolder
2. Extract types to `lib/types.ts` if reusable
3. Add tests
4. Document props with TypeScript

---

wn## Security Model

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

```

**Last Updated:** January 2026
**Version:** 1.0
**Status:** 80% Complete - Ready for Onboarding & Gift Flow
```
