# UX Design Rationale

## Executive Summary

This document explains the design decisions behind Poolift's multi-use architecture, supporting both permanent groups and direct gifts across diverse contexts (classes, friends, family, work, one-off occasions).

---

## Problem Statement

### Original Problem

Poolift was initially designed with a single use case in mind: coordinating birthday gifts for children in school classes. This led to:

1. **Copy Confusion**: Terms like "cumpleaños" and "niño/a" didn't make sense for adult gift coordination
2. **Flow Mismatch**: Creating a "group" for a one-time farewell gift felt overly complex
3. **Limited Adoption**: Users with non-class use cases found the app confusing or irrelevant

### User Feedback

```
"I wanted to organize my office's Secret Santa but the app kept asking
about 'children's birthdays'..."

"We're a group of friends, not a school class. The terminology feels wrong."

"I just needed to collect money for a farewell gift. Why do I need to
create a whole group?"
```

---

## Design Evolution

### Phase 1: Single-Use (Original)

```
Landing → Create Group → Add Children → Create Party → Gift Flow
         (assumed class)  (assumed kids)
```

**Problems:**
- Hard-coded assumptions about context
- No path for one-off gifts
- Confusing for non-class users

### Phase 2: Multi-Use (Current Design)

```
                    ┌──────────────────────────────┐
                    │     Initial Decision         │
                    │  "What do you want to do?"   │
                    └──────────────┬───────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              │                                        │
              ▼                                        ▼
    ┌─────────────────────┐              ┌─────────────────────┐
    │   Create Group      │              │   Direct Gift       │
    │   (4 steps)         │              │   (1 step)          │
    │                     │              │                     │
    │   - Select type     │              │   - Name recipient  │
    │   - Name group      │              │   - Select occasion │
    │   - Invite members  │              │   - Optional: gift  │
    │   - Add first person│              │   - Your name       │
    │                     │              │                     │
    │   Reusable          │              │   One-time          │
    └─────────────────────┘              └─────────────────────┘
```

**Benefits:**
- Clear mental model separation
- Appropriate flow for each use case
- Adaptive copy based on context

---

## Key Design Decisions

### 1. Initial Fork: Group vs Direct Gift

**Decision:**
Present two clear paths from the beginning: "Create Group" vs "Direct Gift"

**Rationale:**
- Users know their intent when they arrive
- Prevents "group" overhead for one-time needs
- Makes both paths feel purpose-built

**Alternatives Considered:**

| Alternative | Rejected Because |
|-------------|------------------|
| Single path with "make it one-time" option | Hidden complexity, users don't discover it |
| Default to group, suggest direct later | Forces wrong path, increases drop-off |
| Ask "recurring or one-time?" | Abstract question, harder to understand than examples |

**Implementation:**
```typescript
// Initial screen shows both options with clear examples
<DecisionCard
  title="Crear un Grupo"
  examples={["Clase del cole", "Grupo de amigos", "Familia"]}
  benefit="Reutilizable para todo el año"
/>
<DecisionCard
  title="Regalo Directo"
  examples={["Despedida", "Boda", "Colecta puntual"]}
  benefit="Rápido, sin crear grupo"
/>
```

---

### 2. Group Type Selection

**Decision:**
Ask users to select their group type (Class, Friends, Family, Work, Other) before naming the group.

**Rationale:**

1. **Personalized Copy**: Different contexts need different terminology
   ```
   Class: "Añade a los niños de la clase"
   Friends: "¿Quién cumple años próximamente?"
   ```

2. **Analytics Value**: Understanding user distribution informs product decisions
   ```
   If 60% are "Friends" → prioritize adult-focused features
   If 80% are "Class" → prioritize child-safety features
   ```

3. **Future Features**: Type-specific functionality
   ```
   Class: Integration with school calendar
   Work: Department hierarchy
   Friends: Social features
   ```

**Alternatives Considered:**

| Alternative | Rejected Because |
|-------------|------------------|
| No type selection | Can't personalize copy, poor experience |
| Optional type selection | Lower data capture, inconsistent experience |
| Infer from group name | Too unreliable, would need ML |
| Ask at end of flow | Already committed, less likely to change answers |

**Copy Mapping:**

```typescript
const copyMap = {
  clase: {
    personLabel: "Nombre del niño/a",
    addPersonCTA: "Añadir cumpleaños",
    emptyState: "Aún no hay cumpleaños",
  },
  amigos: {
    personLabel: "Nombre",
    addPersonCTA: "Añadir persona",
    emptyState: "Aún no hay personas",
  },
  // ... etc
}
```

---

### 3. Direct Gift: No Group Concept

**Decision:**
Direct gifts are standalone entities, not associated with any group.

**Rationale:**
- Mental model: "I'm organizing ONE gift, not joining a community"
- Fewer steps: Name → Occasion → Share (done)
- No overhead: No invite codes, no member management

**Implementation:**

```typescript
// Direct gift creates a standalone gift entity
interface DirectGift {
  id: string
  recipientName: string
  occasion: OccasionType
  proposedGift?: string
  estimatedPrice?: number
  organizerName: string
  shareCode: string
  // No groupId - standalone
}

// Internally, can be backed by a "hidden" single-use group
// but user never sees or interacts with group concept
```

**User Experience Comparison:**

| Aspect | Permanent Group | Direct Gift |
|--------|-----------------|-------------|
| Steps to start | 4 | 1 |
| Invite mechanism | Code + link | Share link only |
| Can add more people | Yes (as members) | N/A (single recipient) |
| Reusable | Yes | No |
| Complexity | Higher | Minimal |

---

### 4. Neutral & Inclusive Copy

**Decision:**
All copy should be neutral by default, with contextual specificity only when group type is known.

**Before (Original):**
```
"Añade el cumpleaños de tu hijo"
"Las familias de la clase pueden votar"
"Regalo para el niño"
```

**After (Multi-Use):**
```
Generic: "Añade la primera persona"
Class context: "Añade a un niño de la clase"
Friends context: "¿Quién cumple años próximamente?"
```

**Inclusive Examples Rule:**
Always show 3+ diverse examples to avoid assumption bias:
```
✓ "ej: Clase 2B / Grupo amigos / Familia García"
✗ "ej: Clase 2B de Primaria"
```

---

### 5. Comparison Helper

**Decision:**
Provide a clear "Help me choose" option linking to a comparison table.

**Rationale:**
- Some users genuinely don't know which option fits
- Reduces anxiety about making wrong choice
- Shows both options are valid and well-supported

**Implementation:**
```
[¿No sabes cuál elegir? Ver comparación]
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Grupo Permanente         vs        Regalo Directo      │
│                                                         │
│  ✓ Regalos recurrentes            ✓ Ocasión única      │
│  ✓ Múltiples miembros             ✓ Sin grupo          │
│  ✓ Votar propuestas               ✓ 1 paso             │
│  ✓ Historial de regalos           ✓ Solo recoger $     │
│                                                         │
│  Ideal para:                      Ideal para:           │
│  Clase, amigos, familia           Despedida, boda       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Validated Use Cases

### Use Case 1: School Class

**Persona:** María, mother of a 7-year-old
**Goal:** Coordinate birthday gifts for all 25 kids in the class
**Flow:** Create Group (type: Clase) → Invite families → Add birthdays → Coordinate gifts year-round

**Key Features Used:**
- Group creation with invite code
- Birthday calendar
- Proposal voting
- Coordinator rotation

---

### Use Case 2: Friend Group

**Persona:** Carlos, 28-year-old professional
**Goal:** Stop the chaos of deciding gifts among 8 close friends
**Flow:** Create Group (type: Amigos) → Add friends → Propose and vote on gifts

**Key Features Used:**
- Group creation
- Proposal system
- Voting
- Contribution tracking

---

### Use Case 3: One-Off Farewell

**Persona:** Laura, office manager
**Goal:** Collect money for a departing colleague's farewell gift
**Flow:** Direct Gift → Share link in WhatsApp → Collect confirmations → Buy gift

**Key Features Used:**
- Direct gift creation
- Share link
- Participant tracking
- Close collection

---

### Use Case 4: Extended Family

**Persona:** Ana, grandmother
**Goal:** Coordinate Christmas gifts among 4 adult children and 8 grandchildren
**Flow:** Create Group (type: Familia) → Add family members → Coordinate for holidays

**Key Features Used:**
- Group creation
- Multiple "occasions" beyond birthdays
- Proposal system

---

## Success Metrics

### Quantitative

```
┌────────────────────────────────────────────────────────┐
│  Metric                      │  Target   │  Baseline  │
├────────────────────────────────────────────────────────┤
│  Group/Direct split          │  60/40    │  N/A       │
│  Group type distribution     │  Diverse  │  100% class│
│  Onboarding completion rate  │  > 80%    │  ~65%      │
│  Time to first gift created  │  < 5 min  │  ~8 min    │
│  Drop-off at decision screen │  < 10%    │  N/A       │
└────────────────────────────────────────────────────────┘
```

### Qualitative

```
- Users correctly choose appropriate path (group vs direct)
- Copy feels natural regardless of context
- No confusion about "group" concept for direct gifts
- Users with different use cases feel "this app is for me"
```

---

## Technical Implementation Notes

### Group Type Storage

```typescript
// Store group type for analytics and copy personalization
interface Group {
  id: string
  name: string
  type: 'clase' | 'amigos' | 'familia' | 'trabajo' | 'otro'
  // ... other fields
}
```

### Direct Gift Internal Model

```typescript
// Direct gifts create a "virtual" single-use group internally
// This maintains data consistency while hiding complexity from user

async function createDirectGift(data: DirectGiftInput): Promise<Gift> {
  // 1. Create hidden single-member group
  const group = await createGroup({
    name: `Regalo: ${data.recipientName}`,
    type: 'directo', // Special type
    isVisible: false,
  })

  // 2. Create the gift
  const gift = await createGift({
    groupId: group.id,
    recipientName: data.recipientName,
    // ...
  })

  return gift
}
```

### Copy System

```typescript
// Centralized copy system with context awareness
const getCopy = (key: string, context: { groupType?: GroupType }) => {
  const copy = copyMap[key]

  if (typeof copy === 'string') return copy

  // Context-specific copy
  return copy[context.groupType] || copy.default
}

// Usage
getCopy('addPerson.title', { groupType: 'clase' })
// → "Añade el primer cumpleaños"

getCopy('addPerson.title', { groupType: 'amigos' })
// → "Añade la primera persona"
```

---

## Future Considerations

### Potential Enhancements

1. **Group Templates**: Pre-configured setups for common scenarios
2. **Smart Suggestions**: AI-powered gift suggestions based on group type
3. **Integration**: School calendars, work directories, social imports
4. **Multi-Occasion**: Support for non-birthday events (Christmas, graduations)

### What We're NOT Doing

1. **Payment Processing**: Too much regulatory complexity, keep it coordination-only
2. **Social Network Features**: Stay focused on gift coordination, not general social
3. **E-commerce Integration**: Affiliate links feel spammy, maintain neutrality

---

## Conclusion

The multi-use architecture transforms Poolift from a niche school-class tool into a versatile gift coordination platform. By clearly separating the "permanent group" and "direct gift" paths while providing adaptive copy, we serve diverse use cases without compromising the experience for any single segment.

**Key Principles Applied:**
1. Let users self-select their path
2. Personalize based on context
3. Keep it simple for simple needs
4. Make the common case easy, the complex case possible
