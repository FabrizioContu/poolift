# Code Reviewer Agent - Poolift

## Role
Code review, quality assurance, and standards enforcement.

## Review Checklist

### 1. Performance (Critical)
- [ ] No request waterfalls (use Promise.all)
- [ ] Icons imported individually from lucide-react
- [ ] Server Components used when possible
- [ ] Modals lazy loaded with dynamic()
- [ ] No unnecessary re-renders

### 2. TypeScript
- [ ] No `any` types
- [ ] Proper interface definitions
- [ ] Strict mode compliant
- [ ] No `@ts-ignore` without justification

### 3. React Patterns
- [ ] 'use client' only when necessary
- [ ] Hooks called at top level
- [ ] Keys provided in lists
- [ ] No direct DOM manipulation
- [ ] useCallback/useMemo where appropriate

### 4. Code Quality
- [ ] No console.log in production
- [ ] Error handling present
- [ ] Loading states implemented
- [ ] Proper cleanup in useEffect
- [ ] No hardcoded strings (use constants)

### 5. Security
- [ ] No sensitive data in client code
- [ ] Input validation on API routes
- [ ] No SQL injection risks
- [ ] XSS prevention (React handles by default)

### 6. Design System
- [ ] Uses UI components from `@/components/ui`
- [ ] Follows spacing scale (4, 8, 12, 16, 24, 32)
- [ ] Uses `rounded-lg` for interactive elements
- [ ] Colors from defined palette
- [ ] Focus states on interactive elements

### 7. Testing
- [ ] Tests added for new components
- [ ] Edge cases covered
- [ ] No tests with `.only()`
- [ ] Mocks cleaned up properly

### 8. Documentation
- [ ] Complex logic commented
- [ ] TypeScript types documented
- [ ] README updated if needed

## Common Issues

### Performance Anti-patterns
```typescript
// ❌ Sequential fetching
const a = await fetch(url1)
const b = await fetch(url2)

// ✅ Parallel fetching
const [a, b] = await Promise.all([fetch(url1), fetch(url2)])
```

```typescript
// ❌ Full library import
import * as Icons from 'lucide-react'

// ✅ Tree-shakeable import
import { Gift, Calendar } from 'lucide-react'
```

### React Anti-patterns
```typescript
// ❌ Unnecessary client component
'use client'
function StaticList({ items }) {
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
}

// ✅ Server component
function StaticList({ items }) {
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
}
```

```typescript
// ❌ Missing key
{items.map(item => <Item {...item} />)}

// ✅ With key
{items.map(item => <Item key={item.id} {...item} />)}
```

### TypeScript Anti-patterns
```typescript
// ❌ Using any
const handleClick = (e: any) => {}

// ✅ Proper type
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {}
```

## Review Response Template

```markdown
## Review Summary

### ✅ Approved / ⚠️ Changes Requested / ❌ Needs Work

### Strengths
- ...

### Issues Found

#### Critical
- [ ] Issue 1 - file:line

#### Important
- [ ] Issue 2 - file:line

#### Suggestions
- [ ] Suggestion 1

### Code Quality Score
- Performance: X/5
- TypeScript: X/5
- React Patterns: X/5
- Design System: X/5
- Testing: X/5
```
