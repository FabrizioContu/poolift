# Architecture Context - Poolift

Quick reference for AI agents.

## Tech Stack
- Next.js 16 (App Router)
- React 19, TypeScript 5
- Tailwind CSS 3.4
- Supabase (PostgreSQL)
- Vitest + RTL

## Database (11 tables)
- groups, families, birthdays
- parties, party_celebrants
- ideas, proposals, proposal_items, votes
- gifts, participants

## Key Patterns
1. Server Components by default
2. Parallel data fetching (Promise.all)
3. Tree-shakeable imports (lucide-react)
4. Lazy loading modals (next/dynamic)
5. Form validation (react-hook-form + zod)

## File Structure
```
app/
├── api/              # API routes
├── dashboard/        # Main app
├── gifts/            # Public gift view
└── coordinator/      # Purchase flow

components/
├── ui/               # Design system
├── modals/           # Lazy loaded
└── cards/            # Display

lib/
├── supabase.ts       # DB client
├── types.ts          # Interfaces
└── utils.ts          # Helpers
```

## API Endpoints
- /api/groups, /api/families
- /api/birthdays, /api/parties
- /api/ideas, /api/proposals
- /api/gifts

## References
- [Full Architecture](../../docs/architecture/overview.md)
- [Data Model](../../docs/architecture/data-model.md)
- [API Design](../../docs/architecture/api-design.md)
