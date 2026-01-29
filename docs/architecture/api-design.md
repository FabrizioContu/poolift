# API Design - Poolift

## Overview

All API routes follow RESTful conventions and return JSON.

### Base URL
- Development: `http://localhost:3000/api`
- Production: `https://poolift.vercel.app/api`

### Response Format

**Success:**
```json
{
  "data": { /* response data */ },
  "message": "Success message"
}
```

**Error:**
```json
{
  "error": "Error message",
  "details": { /* optional */ }
}
```

## Endpoints

### Groups

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/groups` | Create group |
| GET | `/api/groups/[id]` | Get group details |

#### POST /api/groups
```json
// Request
{
  "name": "Clase 3A",
  "familyName": "Familia García"
}

// Response
{
  "group": { "id": "uuid", "name": "Clase 3A", "invite_code": "ABC123DEF456" },
  "family": { "id": "uuid", "name": "Familia García" }
}
```

### Families

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/families?groupId={id}` | List families in group |
| POST | `/api/families` | Join group (create family) |

### Birthdays

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/birthdays?groupId={id}` | List birthdays in group |
| POST | `/api/birthdays` | Create birthday |
| DELETE | `/api/birthdays/[id]` | Delete birthday |

#### POST /api/birthdays
```json
// Request
{
  "groupId": "uuid",
  "childName": "Juan García",
  "birthDate": "2018-05-15"
}
```

**Validation:**
- Cannot delete if birthday is celebrant in active party
- Cannot delete if birthday has ideas

### Parties

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/parties?groupId={id}` | List parties in group |
| GET | `/api/parties/[id]` | Get party details |
| GET | `/api/parties/celebrants?groupId={id}` | Get available celebrants |
| POST | `/api/parties` | Create party |
| DELETE | `/api/parties/[id]` | Delete party |

#### POST /api/parties
```json
// Request
{
  "groupId": "uuid",
  "partyDate": "2025-06-15",
  "celebrantIds": ["birthday_uuid_1", "birthday_uuid_2"],
  "coordinatorId": "family_uuid" // optional - auto-assigns if omitted
}
```

**Logic:**
- If no coordinator, assigns family with fewest coordinations
- Creates party_celebrants records
- Returns complete party with relations

### Ideas

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ideas?birthdayId={id}` | Get ideas for birthday |
| GET | `/api/ideas?partyId={id}` | Get ideas for all party celebrants |
| POST | `/api/ideas` | Create idea |
| DELETE | `/api/ideas/[id]` | Delete idea |

#### POST /api/ideas
```json
// Request
{
  "birthdayId": "uuid",
  "productName": "Set LEGO Star Wars",
  "price": 89.99,
  "productLink": "https://...",
  "suggestedBy": "María"
}
```

### Proposals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/proposals?partyId={id}` | List proposals for party |
| GET | `/api/proposals/[id]` | Get proposal details |
| POST | `/api/proposals` | Create proposal |
| DELETE | `/api/proposals/[id]` | Delete proposal |
| POST | `/api/proposals/[id]/vote` | Vote on proposal |
| PUT | `/api/proposals/[id]/select` | Select winning proposal |

#### POST /api/proposals
```json
// Request
{
  "partyId": "uuid",
  "name": "Set LEGO Completo",
  "items": [
    { "itemName": "LEGO Star Wars", "itemPrice": 89.99, "productLink": "..." },
    { "itemName": "Bolsa regalo", "itemPrice": 5.00 }
  ]
}
```

#### POST /api/proposals/[id]/vote
```json
// Request
{ "voterName": "Familia López" }
```

### Gifts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gifts/[id]` | Get gift by share code |
| POST | `/api/gifts` | Create gift from proposal |
| POST | `/api/gifts/[id]/participate` | Join gift |
| PUT | `/api/gifts/[id]/close` | Close participation |
| PUT | `/api/gifts/[id]/finalize` | Finalize with receipt |

#### POST /api/gifts
```json
// Request
{
  "partyId": "uuid",
  "proposalId": "uuid"
}

// Response
{
  "gift": {
    "id": "uuid",
    "share_code": "GIFT123ABC45",
    "participation_open": true
  }
}
```

#### POST /api/gifts/[id]/participate
```json
// Request
{ "familyName": "Familia Pérez" }
```

#### PUT /api/gifts/[id]/finalize
```json
// Request (multipart/form-data)
{
  "actualPrice": 85.50,
  "purchaseComment": "Comprado en Amazon",
  "receipt": File // optional
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation error |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate or constraint violation |
| 500 | Server Error |

## Validation Rules

### Birthdays
- Name: 2-50 characters
- Date: Cannot be in the future

### Parties
- Date: Cannot be in the past
- Celebrants: At least 1 required

### Ideas
- Product name: Min 3 characters
- Price: Must be > 0 if provided

### Proposals
- Name: Required
- Items: At least 1 required
- Item prices: Must be > 0

## Rate Limiting

Currently no rate limiting (MVP).
Planned: 100 requests/minute per IP.
