# Claude Code Instructions - Poolift

This file is automatically read by Claude Code when working on this project.

## 🎯 Project Overview

**Poolift** - Collaborative gift management platform for families.

**Status:** MVP Complete in Production (Vercel)
**URL:** https://poolift-[...].vercel.app
**Next:** Authentication implementation (hybrid approach)

## 📚 Documentation Structure

**Before starting any task, read:**

### Core Documentation

```
.ai/agents/          - Specialized agent instructions
.ai/context/         - Quick project reference
.ai/prompts/         - Reusable templates
.ai-specs/           - Coding standards & quality gates
docs/architecture/   - System design & data model
docs/guides/         - Development guides
```

### Agent System

**Activate based on task:**

- Architecture decisions → `.ai/agents/architect.md`
- Backend/API work → `.ai/agents/backend-dev.md`
- Frontend/UI → `.ai/agents/frontend-dev.md`
- Testing → `.ai/agents/tester.md`
- Code review → `.ai/agents/reviewer.md`
- Deployment → `.ai/agents/devops.md`

## 🔴 CRITICAL Rules

### 1. Server Components by Default

```typescript
// ✅ DEFAULT - Server Component
export default async function Page() {
  const data = await fetchData()
  return <Component data={data} />
}

// ❌ Only use 'use client' when necessary
'use client'
export function InteractiveComponent() {
  const [state, setState] = useState()
}
```

**Use 'use client' ONLY when:**

- useState, useEffect, useContext
- Event handlers (onClick, onChange)
- Browser APIs (window, localStorage)
- Real-time subscriptions

### 2. Tree-Shakeable Imports (CRITICAL)

```typescript
// ✅ CORRECT - 5KB
import { Gift, Calendar, Users } from "lucide-react";

// ❌ WRONG - 500KB+
import * as Icons from "lucide-react";
```

### 3. Eliminate Waterfalls (CRITICAL)

```typescript
// ❌ WRONG - Sequential (600ms)
const a = await fetch("/api/endpoint1");
const b = await fetch("/api/endpoint2");

// ✅ CORRECT - Parallel (200ms)
const [a, b] = await Promise.all([
  fetch("/api/endpoint1"),
  fetch("/api/endpoint2"),
]);
```

### 4. Lazy Load Modals

```typescript
import dynamic from "next/dynamic";

const Modal = dynamic(() => import("@/components/modals/Modal"));
```

## 🏗️ Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript 5
- **Backend:** Next.js API Routes, Supabase PostgreSQL
- **Styling:** Tailwind CSS 3.4
- **Testing:** Vitest, React Testing Library, Playwright (planned)
- **Hosting:** Vercel
- **Real-time:** Supabase Subscriptions

## 📁 Key Directories

```
app/                  - Next.js App Router pages
components/           - React components
  ui/                - Base components
  modals/            - Lazy loaded modals
  cards/             - Display cards
lib/                 - Utilities and helpers
.ai/                 - AI agent configurations
.ai-specs/           - Coding standards
docs/                - Documentation
```

## 🎨 Component Patterns

### Modal Pattern

```typescript
'use client'
import { Modal } from '@/components/ui/Modal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function CustomModal({ isOpen, onClose }) {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema)
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* fields */}
      </form>
    </Modal>
  )
}
```

### Page Pattern (Server Component)

```typescript
export default async function Page({ params }) {
  const { id } = await params

  const [data1, data2] = await Promise.all([
    fetch(`/api/endpoint1?id=${id}`).then(r => r.json()),
    fetch(`/api/endpoint2?id=${id}`).then(r => r.json())
  ])

  return <div>{/* render */}</div>
}
```

### API Route Pattern

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error message" }, { status: 500 });
  }
}
```

## ✅ Quality Checklist

Before any commit:

- [ ] TypeScript builds without errors
- [ ] No 'any' types
- [ ] Tests passing
- [ ] Linter passing
- [ ] Server Components used where possible
- [ ] Icons imported individually
- [ ] Parallel fetching with Promise.all()
- [ ] Loading states implemented
- [ ] Error handling in place

## 🚫 Anti-Patterns

❌ Client Component unnecessarily
❌ Import entire libraries (`import *`)
❌ Sequential fetching
❌ Fetch in useEffect (use Server Component)
❌ Index as key
❌ Silent errors
❌ Hardcoded values
❌ console.log in production

## 🔧 Git Workflow

**Branch naming:**

```
feature/[name]    - New features
fix/[name]        - Bug fixes
docs/[name]       - Documentation
refactor/[name]   - Refactoring
test/[name]       - Testing
```

**Commit convention:**

```bash
feat: add feature
fix: resolve bug
docs: update documentation
refactor: improve code
test: add tests
```

**See:** `docs/guides/git-workflow.md` for full details

## 📖 Standards & Documentation

**Coding Standards:**

- React: `.ai-specs/coding-standards/react.md`
- TypeScript: `.ai-specs/coding-standards/typescript.md`
- Next.js: `.ai-specs/coding-standards/nextjs.md`

**Architecture:**

- Overview: `docs/architecture/overview.md`
- Data Model: `docs/architecture/data-model.md`
- APIs: `docs/architecture/api-design.md`

**Development:**

- Git Workflow: `docs/guides/git-workflow.md`
- Testing: See `.ai/agents/tester.md`

## 🎯 Current Focus

**Completed:**
✅ MVP with full Gift Flow
✅ 77+ tests passing
✅ Production deployment

**Next:**
⏳ Authentication (hybrid approach)
⏳ Spoiler prevention
⏳ Security enhancements
⏳ Playwright E2E tests

## 🤝 Response Format

When completing a task:

1. Acknowledge task and activated agent
2. Reference relevant specs/docs
3. Provide solution with code
4. Include tests if applicable
5. Update documentation if needed
6. Follow quality gates

---

**Remember:**

- Read documentation BEFORE coding
- Follow standards in `.ai-specs/`
- Use appropriate agent guidance from `.ai/agents/`
- Write tests
- Be thorough

---

**For detailed instructions on any topic, open the relevant file:**

- Frontend: `.ai/agents/frontend-dev.md`
- Backend: `.ai/agents/backend-dev.md`
- Testing: `.ai/agents/tester.md`
- Architecture: `docs/architecture/overview.md`

```


```
