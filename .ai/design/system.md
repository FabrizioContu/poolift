# Poolift Design System

> Design tokens, patterns, and component standards for consistent UI development.

---

## Spacing Scale

Base unit: **4px**

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `xs` | 4px | `p-1`, `gap-1` | Tight spacing, badge padding |
| `sm` | 8px | `p-2`, `gap-2` | Default element spacing |
| `md` | 12px | `p-3`, `gap-3` | Form inputs, alerts |
| `lg` | 16px | `p-4`, `gap-4` | Cards (default), sections |
| `xl` | 24px | `p-6`, `gap-6` | Modals, large cards |
| `2xl` | 32px | `p-8`, `gap-8` | Page containers |

### Usage Guidelines
- **gap-2**: Default spacing between inline elements
- **gap-3**: Button groups, form field spacing
- **gap-4**: Section spacing, card grids
- **space-y-4**: Vertical form fields

---

## Border Radius

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `sm` | 4px | `rounded` | Small elements |
| `default` | 8px | `rounded-lg` | **Primary** - cards, buttons, inputs, modals |
| `full` | 9999px | `rounded-full` | Badges, avatars, icon containers |

### Rules
- Use `rounded-lg` for all interactive elements
- Use `rounded-full` only for badges and circular elements
- Never use `rounded-md`, `rounded-xl`, or `rounded-2xl`

---

## Color Palette

### Primary Colors
| Color | Tailwind | Usage |
|-------|----------|-------|
| Blue 500 | `blue-500` | Primary actions, links, focus rings |
| Blue 600 | `blue-600` | Primary hover state |
| Blue 100 | `blue-100` | Info backgrounds |

### Secondary Colors
| Color | Tailwind | Usage |
|-------|----------|-------|
| Gray 200 | `gray-200` | Secondary buttons, borders |
| Gray 300 | `gray-300` | Secondary hover state |
| Gray 100 | `gray-100` | Subtle backgrounds |

### Semantic Colors
| Intent | Background | Border | Text |
|--------|------------|--------|------|
| Success | `green-50` | `green-200` | `green-700` |
| Error | `red-50` | `red-200` | `red-700` |
| Warning | `yellow-50` | `yellow-200` | `yellow-700` |
| Info | `blue-50` | `blue-200` | `blue-700` |

### Badge Colors
| Variant | Background | Text |
|---------|------------|------|
| Gray | `gray-100` | `gray-700` |
| Yellow | `yellow-100` | `yellow-800` |
| Green | `green-100` | `green-800` |
| Red | `red-100` | `red-800` |
| Blue | `blue-100` | `blue-800` |
| Purple | `purple-100` | `purple-800` |

### Text Colors
| Usage | Tailwind |
|-------|----------|
| Primary text | `gray-900` |
| Secondary text | `gray-700` |
| Muted text | `gray-600` |
| Subtle text | `gray-500` |
| Hint text | `gray-400` |

---

## Typography

| Element | Classes |
|---------|---------|
| Page title | `text-3xl font-bold text-gray-900` |
| Hero title | `text-5xl font-bold text-gray-900` |
| Section title | `text-2xl font-bold text-gray-900` |
| Card title | `text-xl font-bold` or `font-semibold text-lg` |
| Body | `text-gray-600` or `text-gray-700` |
| Small text | `text-sm text-gray-500` |
| Hint/caption | `text-xs text-gray-400` |
| Label | `text-sm font-medium text-gray-700` |

---

## Depth Strategy

**Border-first approach** - Use borders as primary depth indicator, shadows sparingly.

| Level | Implementation | Usage |
|-------|----------------|-------|
| Level 0 | No border | Inline elements |
| Level 1 | `border border-gray-200` | Cards, inputs |
| Level 2 | `border border-gray-200 shadow-lg` | Hover state, elevated cards |
| Level 3 | `bg-black bg-opacity-50` | Modal overlay |

### Rules
- Default cards use `border border-gray-200` (no shadow)
- Add `hover:shadow-lg hover:border-blue-300` for interactive cards
- Shadows reserved for: modals, dropdowns, hover states

---

## Components

### Button
```tsx
import { Button } from "@/components/ui";

<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
```

| Prop | Values | Default |
|------|--------|---------|
| `variant` | `primary`, `secondary`, `danger` | `primary` |

**Styles:**
- Base: `px-4 py-2 rounded-lg font-bold transition`
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`

---

### Input
```tsx
import { Input } from "@/components/ui";

<Input
  label="Email"
  required
  error={errors.email?.message}
  hint="We'll never share your email"
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `label` | string | Label text |
| `required` | boolean | Shows red asterisk |
| `error` | string | Error message |
| `hint` | string | Help text (hidden when error) |

**Styles:**
- Base: `w-full px-3 py-2 border border-gray-300 rounded-lg`
- Focus: `focus:ring-2 focus:ring-blue-500 focus:border-transparent`
- Error: `border-red-500`

---

### Card
```tsx
import { Card } from "@/components/ui";

<Card size="md" hover>Content</Card>
<Card size="lg" selected>Selected card</Card>
```

| Prop | Values | Default |
|------|--------|---------|
| `size` | `sm`, `md`, `lg` | `md` |
| `hover` | boolean | `false` |
| `selected` | boolean | `false` |

**Size mapping:**
- `sm`: `p-3` (ideas, list items)
- `md`: `p-4` (proposals, default)
- `lg`: `p-6` (party cards, featured)

---

### Badge
```tsx
import { Badge } from "@/components/ui";

<Badge variant="yellow">Ideas</Badge>
<Badge variant="green" size="sm">Active</Badge>
```

| Prop | Values | Default |
|------|--------|---------|
| `variant` | `gray`, `yellow`, `green`, `red`, `blue`, `purple` | `gray` |
| `size` | `sm`, `md` | `md` |

---

### Alert
```tsx
import { Alert } from "@/components/ui";

<Alert variant="success">Saved successfully!</Alert>
<Alert variant="error">{error}</Alert>
```

| Prop | Values | Default |
|------|--------|---------|
| `variant` | `success`, `error`, `warning`, `info` | `info` |

---

### EmptyState
```tsx
import { EmptyState } from "@/components/ui";
import { Gift } from "lucide-react";

<EmptyState
  icon={Gift}
  title="No items yet"
  description="Add your first item to get started"
  action={<Button>Add Item</Button>}
/>
```

---

### IconButton
```tsx
import { IconButton } from "@/components/ui";
import { Trash2 } from "lucide-react";

<IconButton
  icon={Trash2}
  variant="danger"
  label="Delete"
  onClick={handleDelete}
/>
```

| Prop | Values | Default |
|------|--------|---------|
| `variant` | `default`, `danger` | `default` |
| `size` | `sm`, `md` | `md` |
| `label` | string | Required (accessibility) |

---

### Modal
```tsx
import { Modal } from "@/components/ui";

<Modal isOpen={open} onClose={close} title="Modal Title">
  {children}
</Modal>
```

**Structure:**
- Overlay: `fixed inset-0 bg-black bg-opacity-50 z-50`
- Container: `bg-white rounded-lg max-w-md w-full p-6`
- Close button: X icon, `text-gray-400 hover:text-gray-600`

---

### Tabs
```tsx
import { Tabs } from "@/components/ui";

<Tabs
  tabs={[
    { id: "parties", label: "Fiestas" },
    { id: "birthdays", label: "Cumpleaños" },
  ]}
  defaultTab="parties"
>
  {(activeTab) => activeTab === "parties" ? <Parties /> : <Birthdays />}
</Tabs>
```

---

## Icon Sizes

| Context | Size | Usage |
|---------|------|-------|
| Inline text | 12-14px | `<Icon size={12} />` |
| List items | 16px | `<Icon size={16} />` |
| Buttons | 18-20px | `<Icon size={18} />` |
| Headers | 24px | `<Icon size={24} />` |
| Status icons | 32px | `<Icon size={32} />` |
| Empty states | 48px | `<Icon size={48} />` |

---

## Patterns

### Form Layout
```tsx
<form className="space-y-4">
  <Input label="Field 1" />
  <Input label="Field 2" />

  {error && <Alert variant="error">{error}</Alert>}
  {success && <Alert variant="success">{message}</Alert>}

  <div className="flex gap-3 pt-2">
    <Button variant="secondary" className="flex-1">Cancel</Button>
    <Button className="flex-1">Submit</Button>
  </div>
</form>
```

### Card with Actions
```tsx
<Card size="md" hover>
  <div className="flex items-start justify-between">
    <div className="flex-1">
      {/* Content */}
    </div>
    <div className="flex items-center gap-2">
      <Badge variant="yellow">Status</Badge>
      <IconButton icon={Trash2} variant="danger" label="Delete" />
    </div>
  </div>
</Card>
```

### Delete Confirmation
```tsx
<ConfirmDeleteModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onConfirm={handleDelete}
  title="Delete item?"
  message="This action cannot be undone."
  confirmText="Delete"
/>
```

---

## Imports

Use barrel imports for cleaner code:

```tsx
// Recommended
import { Button, Card, Badge, Alert, Input } from "@/components/ui";

// Also valid
import { Button } from "@/components/ui/Button";
```

---

## Checklist for New Components

- [ ] Uses design system colors (no custom hex values)
- [ ] Uses standard spacing scale (4, 8, 12, 16, 24, 32)
- [ ] Uses `rounded-lg` for interactive elements
- [ ] Uses `border border-gray-200` for depth (not shadows)
- [ ] Focus states use `focus:ring-2 focus:ring-blue-500`
- [ ] Hover states follow conventions (`hover:bg-*-600` for buttons)
- [ ] Uses existing UI components where applicable
- [ ] Icons sized appropriately for context

---

*Last updated: January 2026*
