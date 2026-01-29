# Quality Gates Checklist - Poolift

## Before Committing

### Code Quality
- [ ] No console.log in production code
- [ ] No commented-out code
- [ ] No TODO without issue reference
- [ ] TypeScript strict mode passes
- [ ] ESLint passes (`npm run lint`)

### Performance
- [ ] No request waterfalls (Promise.all used)
- [ ] Icons imported individually
- [ ] Server Components where possible
- [ ] Modals lazy loaded

### Testing
- [ ] New code has tests
- [ ] All tests pass (`npm run test:run`)
- [ ] Edge cases covered

### Design System
- [ ] UI components from `@/components/ui` used
- [ ] Spacing follows scale (4, 8, 12, 16, 24, 32)
- [ ] Colors from palette
- [ ] `rounded-lg` for interactive elements

## Before Pull Request

### Documentation
- [ ] Complex logic commented
- [ ] README updated if needed
- [ ] API changes documented

### Git
- [ ] Commits follow conventional format
- [ ] Branch named correctly
- [ ] No merge commits (rebase if needed)

### Testing
- [ ] Manual testing completed
- [ ] Cross-browser tested (if UI)
- [ ] Mobile responsive (if UI)

## Before Merging

### CI/CD
- [ ] All checks pass
- [ ] Build succeeds
- [ ] No new warnings

### Review
- [ ] Code reviewed
- [ ] Feedback addressed
- [ ] Approved by reviewer

## Quick Commands

```bash
# Before commit
npm run lint
npm run test:run
npm run build

# Check TypeScript
npx tsc --noEmit
```
