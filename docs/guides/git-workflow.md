# Git Workflow - Poolift

## Branch Strategy

```
main (production)
  │
  └── develop (integration)
        │
        ├── feature/feature-name
        ├── fix/bug-description
        ├── docs/documentation-task
        └── refactor/refactor-description
```

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/auth-implementation` |
| Bug Fix | `fix/description` | `fix/modal-close-button` |
| Documentation | `docs/description` | `docs/sdd-structure` |
| Refactor | `refactor/description` | `refactor/api-routes` |
| Hotfix | `hotfix/description` | `hotfix/critical-bug` |

## Workflow

### 1. Start New Work
```bash
# Update develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/my-feature
```

### 2. Make Changes
```bash
# Stage specific files
git add path/to/file

# Commit with conventional message
git commit -m "feat: add user authentication"

# Push branch
git push origin feature/my-feature
```

### 3. Create Pull Request
- Base: `develop` ← Compare: `feature/my-feature`
- Fill PR template
- Request review

### 4. After Approval
- Squash and merge to develop
- Delete feature branch

### 5. Release to Production
```bash
# Merge develop to main
git checkout main
git merge develop
git push origin main
```

## Commit Conventions

Format: `type: description`

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance |

### Examples
```bash
feat: add birthday creation modal
fix: correct date validation in party form
docs: update API documentation
test: add tests for proposal voting
refactor: extract validation logic to utils
chore: update dependencies
```

### With Scope
```bash
feat(modals): add CreatePartyModal component
fix(api): handle null coordinator in parties endpoint
test(components): add Button component tests
```

## Pull Request Template

```markdown
## What
Brief description of changes

## Why
Reason for this change

## How
Technical approach

## Type
- [ ] Feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring

## Testing
- [ ] Unit tests added
- [ ] Manual testing done
- [ ] All tests passing

## Checklist
- [ ] Code follows style guidelines
- [ ] No console.logs in production
- [ ] TypeScript builds without errors
```

## Protected Branches

### main
- Requires PR
- Requires passing CI
- No force push

### develop
- Requires PR
- Requires passing CI

## Git Aliases (Recommended)

```bash
# Add to ~/.gitconfig
[alias]
  st = status
  co = checkout
  br = branch
  ci = commit
  lg = log --oneline --graph --all
  unstage = reset HEAD --
```

## Common Operations

### Sync with develop
```bash
git checkout develop
git pull origin develop
git checkout feature/my-feature
git merge develop
```

### Undo last commit (keep changes)
```bash
git reset --soft HEAD~1
```

### Stash changes
```bash
git stash
git stash pop
```

### Interactive rebase (clean up commits)
```bash
git rebase -i HEAD~3
```

## CI/CD Pipeline

### On Pull Request
1. Lint (`npm run lint`)
2. Type check (`npx tsc --noEmit`)
3. Tests (`npm run test:run`)
4. Build (`npm run build`)

### On Merge to main
1. All PR checks
2. Deploy to Vercel
3. Run smoke tests (planned)

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
