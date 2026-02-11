# Poolift - Collaborative Gift Management

> Web platform for organizing shared birthday gifts among families in a simple and transparent way.

## 📖 For AI Assistants (Claude Code)

**Working on this project? Start here:**

- 📄 **`CLAUDE.md`** - Core instructions & quick reference
- 🤖 **`.ai/agents/`** - Specialized agent configurations
- 📐 **`.ai/specs/`** - Coding standards and quality gates

**Quick Start for Development:**

1. Read `CLAUDE.md` for project overview
2. Check `.ai/agents/frontend-dev.md` or `.ai/agents/backend-dev.md` based on your task
3. Follow standards in `.ai/specs/coding-standards/`

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-77%2B%20passing-brightgreen)](https://vitest.dev/)

---

## Description

Poolift facilitates the organization of shared gifts for children's birthdays in groups such as school classes. It allows families to:

- Register group birthdays
- Create parties (individual or joint)
- Propose and vote on gift ideas
- Participate in shared gifts
- Split costs transparently
- Share via WhatsApp

---

## Main Features

### Group Management

- Create groups for classes/teams
- Invitation system by code
- Multiple families per group
- No complex authentication needed

### Birthdays and Parties

- Register children's birthdays
- Create parties (one or multiple celebrants)
- Automatic rotating coordinator assignment
- Upcoming parties visualization

### Ideas and Proposals

- Add gift ideas for each child
- Create formal proposals with items and prices
- Family voting system
- Winning proposal selection

### Complete Gift Flow

1. **Create Gift**: Generates shareable code
2. **Participation**: Families sign up for the gift
3. **Close**: Calculates price per family
4. **Finalize**: Purchase record with receipt
5. **Share**: Notification to participants

### Transparency

- Automatically calculated price per family
- Coordinator comments
- Visible purchase receipts
- Real-time gift status

---

## Tech Stack

### Frontend

| Technology      | Version | Purpose                |
| --------------- | ------- | ---------------------- |
| Next.js         | 16      | Framework (App Router) |
| TypeScript      | 5.0     | Language               |
| Tailwind CSS    | 3.4     | Styling                |
| Lucide React    | -       | Icons                  |
| React Hook Form | -       | Form handling          |
| Zod             | -       | Validation             |

### Backend

| Technology             | Purpose               |
| ---------------------- | --------------------- |
| Supabase               | Database (PostgreSQL) |
| Next.js API Routes     | REST API              |
| Supabase Subscriptions | Real-time (optional)  |
| Supabase Storage       | Receipt storage       |

### Testing

| Technology             | Purpose        |
| ---------------------- | -------------- |
| Vitest                 | Test framework |
| @testing-library/react | UI testing     |
| 77+ tests              | Coverage       |

---

## Installation and Setup

### Prerequisites

```bash
Node.js 18+
npm or yarn
Supabase account
```

### 1. Clone Repository

```bash
git clone <repository-url>
cd poolift
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

Run the SQL schema in Supabase. Required tables:

- `groups`
- `families`
- `birthdays`
- `parties`
- `party_celebrants`
- `ideas`
- `proposals`
- `proposal_items`
- `votes`
- `gifts`
- `participants`

### 5. Run in Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
poolift/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── groups/              # CRUD groups
│   │   ├── families/            # CRUD families
│   │   ├── birthdays/           # CRUD birthdays
│   │   ├── parties/             # CRUD parties
│   │   ├── ideas/               # CRUD ideas
│   │   ├── proposals/           # CRUD proposals + voting
│   │   └── gifts/               # Gift flow APIs
│   ├── dashboard/               # Main dashboard
│   │   └── [groupId]/
│   │       ├── page.tsx         # Tabs: Parties | Birthdays
│   │       └── parties/
│   │           └── [partyId]/   # Party detail
│   ├── gifts/                   # Public gift view
│   │   └── [shareCode]/
│   ├── coordinator/             # Purchase flow
│   ├── create-group/            # Onboarding: create
│   └── join/                    # Onboarding: join
├── components/
│   ├── cards/                   # PartyCard, ProposalCard, IdeasByChild
│   ├── modals/                  # All modals (7+)
│   ├── ui/                      # Base components (Modal, Button, Tabs)
│   ├── parties/                 # Party-specific components
│   ├── proposals/               # Proposal components
│   ├── gifts/                   # Gift components
│   ├── groups/                  # Group components
│   └── birthdays/               # Birthday components
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── types.ts                # TypeScript interfaces
│   ├── utils.ts                # Utility functions
│   ├── validators.ts           # Zod schemas
│   ├── messages.ts             # WhatsApp messages
│   └── hooks/                  # Custom hooks
│       ├── useParties.ts
│       └── useRealtime.ts
├── __tests__/                   # Vitest tests
│   ├── components/             # Component tests
│   └── lib/                    # Utility tests
└── public/                      # Static assets
```

---

## Available Scripts

```bash
# Development
npm run dev           # Start dev server with Turbopack
npm run build         # Production build
npm run start         # Start production server
npm run lint          # ESLint check

# Testing
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:ui       # Open Vitest UI
npm run coverage      # Run with coverage report
```

---

## API Endpoints

### Groups & Families

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| POST   | `/api/groups`      | Create group      |
| GET    | `/api/groups/[id]` | Get group details |
| GET    | `/api/families`    | List families     |

### Birthdays

| Method | Endpoint              | Description     |
| ------ | --------------------- | --------------- |
| POST   | `/api/birthdays`      | Add birthday    |
| GET    | `/api/birthdays`      | List birthdays  |
| DELETE | `/api/birthdays/[id]` | Delete birthday |

### Parties

| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| POST   | `/api/parties`            | Create party             |
| GET    | `/api/parties`            | List parties             |
| GET    | `/api/parties/[id]`       | Get party details        |
| GET    | `/api/parties/celebrants` | Get available celebrants |

### Ideas

| Method | Endpoint          | Description   |
| ------ | ----------------- | ------------- |
| POST   | `/api/ideas`      | Add gift idea |
| GET    | `/api/ideas`      | List ideas    |
| DELETE | `/api/ideas/[id]` | Delete idea   |

### Proposals

| Method | Endpoint                     | Description             |
| ------ | ---------------------------- | ----------------------- |
| POST   | `/api/proposals`             | Create proposal         |
| GET    | `/api/proposals`             | List proposals          |
| GET    | `/api/proposals/[id]`        | Get proposal details    |
| POST   | `/api/proposals/[id]/vote`   | Vote on proposal        |
| PUT    | `/api/proposals/[id]/select` | Select winning proposal |

### Gifts

| Method | Endpoint                      | Description            |
| ------ | ----------------------------- | ---------------------- |
| POST   | `/api/gifts`                  | Create gift            |
| GET    | `/api/gifts/[id]`             | Get gift by share code |
| POST   | `/api/gifts/[id]/participate` | Join gift              |
| PUT    | `/api/gifts/[id]/close`       | Close participation    |
| PUT    | `/api/gifts/[id]/finalize`    | Finalize with receipt  |

---

## Data Model

```
Groups
  └── Families (joined via invite_code)
        └── Birthdays (children)
              └── Ideas (gift suggestions)

Parties (events with party_date)
  └── PartyCelebrants (many-to-many with Birthdays)
  └── Proposals (formal gift proposals)
        └── ProposalItems (items in proposal)
        └── Votes (family votes)
  └── Gifts (created from selected proposal)
        └── Participants (families contributing)
```

---

## Key Concepts

### Party Model

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
- Family-based access (no authentication required)

---

## Testing

### Running Tests

```bash
npm test              # Watch mode with hot reload
npm run test:ui       # Visual UI (recommended)
npm run test:run      # Single run (for CI)
npm run coverage      # With coverage report
```

### Test Coverage

| Category         | Tests   | Status      |
| ---------------- | ------- | ----------- |
| AddBirthdayModal | 16      | Passing     |
| CreatePartyModal | 16      | Passing     |
| AddIdeaModal     | 14      | Passing     |
| AddProposalModal | 8       | Passing     |
| Utilities        | 6+      | Passing     |
| Other components | 17+     | Passing     |
| **Total**        | **77+** | **Passing** |

---

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
vercel --prod
```

### Environment Variables (Production)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Conventions

```
feat: Add new feature
fix: Bug fix
test: Add or update tests
docs: Documentation changes
refactor: Code refactoring
chore: Maintenance tasks
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

For questions or issues:

- Open an issue on GitHub
- Check the [CLAUDE.md](CLAUDE.md) for detailed development documentation

---

**Built with Next.js 16, Supabase, and TypeScript**
