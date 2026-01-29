# Tester Agent - Poolift

## Role
Unit tests, integration tests, and test strategy.

## Tech Stack
- Vitest
- React Testing Library
- @testing-library/user-event
- MSW (planned for API mocking)

## Test Structure
```
__tests__/
├── components/       # Component tests
│   ├── Button.test.tsx
│   ├── AddBirthdayModal.test.tsx
│   └── ...
├── lib/              # Utility tests
│   ├── utils.test.ts
│   └── validators.test.ts
└── api/              # API tests (planned)
```

## Component Test Pattern

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentName } from '@/components/ComponentName'

describe('ComponentName', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    groupId: 'test-group-id'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly when open', () => {
    render(<ComponentName {...defaultProps} />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('calls onClose when cancel clicked', async () => {
    const user = userEvent.setup()
    render(<ComponentName {...defaultProps} />)

    await user.click(screen.getByText('Cancelar'))

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<ComponentName {...defaultProps} />)

    await user.click(screen.getByText('Submit'))

    expect(screen.getByText(/required/i)).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} })
    })

    render(<ComponentName {...defaultProps} />)

    await user.type(screen.getByLabelText(/name/i), 'Test Name')
    await user.click(screen.getByText('Submit'))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/endpoint', expect.any(Object))
    })
  })

  it('handles server errors', async () => {
    const user = userEvent.setup()
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Server error' })
    })

    render(<ComponentName {...defaultProps} />)

    await user.type(screen.getByLabelText(/name/i), 'Test')
    await user.click(screen.getByText('Submit'))

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument()
    })
  })
})
```

## Utility Test Pattern

```typescript
import { describe, it, expect } from 'vitest'
import { formatPrice, formatDate, formatCelebrants } from '@/lib/utils'

describe('formatPrice', () => {
  it('formats integer price', () => {
    expect(formatPrice(100)).toBe('100.00€')
  })

  it('formats decimal price', () => {
    expect(formatPrice(99.5)).toBe('99.50€')
  })

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('0.00€')
  })
})

describe('formatCelebrants', () => {
  it('formats single name', () => {
    expect(formatCelebrants(['Juan'])).toBe('Juan')
  })

  it('formats two names with "y"', () => {
    expect(formatCelebrants(['Juan', 'Ana'])).toBe('Juan y Ana')
  })

  it('formats multiple names', () => {
    expect(formatCelebrants(['Juan', 'Ana', 'Pedro'])).toBe('Juan, Ana y Pedro')
  })
})
```

## Test Categories

### 1. Rendering Tests
- Component renders correctly
- Conditional rendering works
- Props affect output

### 2. Interaction Tests
- Button clicks
- Form input
- Modal open/close
- Navigation

### 3. Validation Tests
- Required fields
- Min/max length
- Date validation
- Price validation

### 4. API Integration Tests
- Successful submission
- Error handling
- Loading states

### 5. Edge Cases
- Empty data
- Long text
- Special characters
- Boundary values

## Commands

```bash
npm test              # Watch mode
npm run test:run      # Single run (CI)
npm run test:ui       # Visual UI
npm run coverage      # Coverage report
```

## Current Coverage

| Category | Tests | Status |
|----------|-------|--------|
| AddBirthdayModal | 16 | ✅ |
| CreatePartyModal | 16 | ✅ |
| AddIdeaModal | 14 | ✅ |
| AddProposalModal | 8 | ✅ |
| Button | 4 | ✅ |
| Utilities | 7 | ✅ |
| Validators | 10 | ✅ |
| Other | 36+ | ✅ |
| **Total** | **111+** | ✅ |

## Best Practices

1. **Test behavior, not implementation**
2. **Use accessible queries** (getByRole, getByLabelText)
3. **Avoid testing library internals**
4. **Mock fetch at the boundary**
5. **Test error states**
6. **Keep tests focused and small**
