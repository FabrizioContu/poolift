# Architecture Overview - Poolift

## Vision

Poolift is a collaborative gift coordination platform that helps groups of families organize joint birthday parties, propose gift ideas, vote on proposals, and coordinate purchases.

**Key Innovation:** Supports joint parties where multiple children celebrate together (e.g., "Juan y Gina's party on Oct 10").

## Tech Stack

| Layer     | Technology             | Version         |
| --------- | ---------------------- | --------------- |
| Frontend  | Next.js (App Router)   | 16              |
| UI        | React                  | 19              |
| Language  | TypeScript             | 5 (strict mode) |
| Styling   | Tailwind CSS           | 4               |
| Database  | Supabase (PostgreSQL)  | -               |
| Real-time | Supabase Subscriptions | -               |
| Forms     | react-hook-form + zod  | -               |
| Icons     | lucide-react           | -               |
| Testing   | Vitest + RTL           | -               |
| Hosting   | Vercel                 | -               |

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                        │
│              Next.js React Application                   │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP / WebSocket
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 Vercel Edge Network                      │
│            Next.js API Routes (Serverless)               │
└─────────────────────┬───────────────────────────────────┘
                      │ PostgreSQL Protocol
                      ▼
┌─────────────────────────────────────────────────────────┐
│                     Supabase                             │
│         PostgreSQL + Real-time + Storage                 │
└─────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### Party Model (v2.0)

- Parties are **separate entities** from Birthdays
- A party can celebrate **multiple children** (joint parties)
- Birthdays only store: `child_name`, `birth_date`
- Parties store: `party_date`, `coordinator_id`

### Coordinator Assignment

- Auto-assigned on rotation (family with fewest coordinations)
- Can be manually selected when creating party
- Tracked to ensure fair distribution

### Invite System

- Groups have unique `invite_code` (12 chars)
- Share via WhatsApp link: `/join/[inviteCode]`
- No authentication required (family-based trust model)

### Security Model

- API-layer validation (no Supabase RLS for MVP)
- Family-based trust model
- Planned: Hybrid auth approach (v1.1)

## Data Flow

```
1. Groups → contain → Families (via invite_code)
2. Families → create → Birthdays (children)
3. Birthdays → participate in → Parties (events)
4. Parties ← linked via → PartyCelebrants (M:N)
5. Ideas → suggested for → Birthdays
6. Proposals → created for → Parties
7. ProposalItems → belong to → Proposals
8. Votes → cast by Families → on Proposals
9. Gifts → created from → selected Proposals
10. Participants → join → Gifts
```

## Project Status

### Completed (100%)

- Database: 11 tables in Supabase
- Backend: 19+ API endpoints
- Frontend: All core screens
- Testing: 111+ tests passing
- Design System: 9 UI components

### Current Focus

- SDD documentation structure
- Git workflow implementation

### Planned

- Authentication (hybrid approach)
- Email notifications
- Analytics dashboard

## References

- [Data Model](./data-model.md)
- [API Design](./api-design.md)
- [Design System](../../.interface-design/system.md)
