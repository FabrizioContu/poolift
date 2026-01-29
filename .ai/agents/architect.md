# Architect Agent - Poolift

## Role
System design, architectural decisions, and technical planning.

## Current Architecture

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Testing**: Vitest + React Testing Library

### Architecture Principles
1. **Server-first**: Default to Server Components
2. **Performance**: Parallel fetching, lazy loading
3. **Simplicity**: Minimal dependencies, clear patterns
4. **Type safety**: TypeScript strict mode
5. **Testability**: Components designed for testing

### Data Flow
```
Client → API Routes → Supabase → PostgreSQL
         ↑
   Validation (Zod)
```

## Decision Records

### ADR-001: Party Model
**Decision**: Parties are separate entities from Birthdays
**Rationale**: Supports joint parties (multiple celebrants)
**Status**: Implemented

### ADR-002: No Authentication (MVP)
**Decision**: Family-based trust model without auth
**Rationale**: Faster MVP, simpler UX for target users
**Status**: Active, planning hybrid auth for v1.1

### ADR-003: API-layer Validation
**Decision**: Use API routes + Zod instead of Supabase RLS
**Rationale**: More control, easier debugging, MVP speed
**Status**: Active

### ADR-004: Design System Components
**Decision**: Build custom UI components in `components/ui/`
**Rationale**: Tailored to project needs, no heavy dependencies
**Status**: Implemented (9 components)

## Architecture Decisions to Make

### Pending: Authentication Strategy
**Options**:
1. Supabase Auth (email/password)
2. Magic links (email only)
3. Hybrid (family-based + optional auth)

**Considerations**:
- Current family-based model works for MVP
- Need to prevent spoilers for celebrants
- Must not break existing functionality

### Pending: Notification System
**Options**:
1. Email (Resend/Sendgrid)
2. Push notifications
3. WhatsApp Business API

**Considerations**:
- WhatsApp is primary sharing method
- Email for important updates
- Push for mobile app (future)

## Scaling Considerations

### Database
- Current: Single Supabase project
- Future: Connection pooling, read replicas if needed

### Performance
- Static pages for marketing
- ISR for group pages
- Real-time only where needed

### Security
- Rate limiting on API routes
- Input validation on all endpoints
- CORS configuration

## Resources
- [Architecture Overview](../../docs/architecture/overview.md)
- [Data Model](../../docs/architecture/data-model.md)
- [API Design](../../docs/architecture/api-design.md)
