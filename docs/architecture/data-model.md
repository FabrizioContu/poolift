# Data Model - Poolift

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   groups    │────<│  families   │────<│  birthdays  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                           │                    │
                           │              ┌─────┴─────┐
                           │              │   ideas   │
                           │              └───────────┘
                           │
┌─────────────┐     ┌──────┴──────┐     ┌─────────────┐
│   parties   │────<│party_celebr.│>────│  birthdays  │
└──────┬──────┘     └─────────────┘     └─────────────┘
       │
       ├────────────────────────────────────────┐
       │                                        │
┌──────┴──────┐     ┌─────────────┐     ┌──────┴──────┐
│  proposals  │────<│prop._items  │     │    gifts    │
└──────┬──────┘     └─────────────┘     └──────┬──────┘
       │                                        │
┌──────┴──────┐                         ┌──────┴──────┐
│    votes    │                         │participants │
└─────────────┘                         └─────────────┘
```

## Tables

### Core Tables

#### groups
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Group name (e.g., "Clase 3A") |
| invite_code | text | Unique 12-char code for invitations |
| created_at | timestamp | Creation timestamp |

#### families
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| group_id | uuid | FK to groups |
| name | text | Family name |
| created_at | timestamp | Creation timestamp |

#### birthdays
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| group_id | uuid | FK to groups |
| child_name | text | Child's name |
| birth_date | date | Birth date |
| created_at | timestamp | Creation timestamp |

### Party Tables

#### parties
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| group_id | uuid | FK to groups |
| party_date | date | Party date |
| coordinator_id | uuid | FK to families (auto-assigned or manual) |
| created_at | timestamp | Creation timestamp |

#### party_celebrants
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| party_id | uuid | FK to parties |
| birthday_id | uuid | FK to birthdays |

### Gift Flow Tables

#### ideas
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| birthday_id | uuid | FK to birthdays |
| product_name | text | Gift suggestion name |
| price | decimal | Estimated price (optional) |
| product_link | text | URL to product (optional) |
| comment | text | Additional notes (optional) |
| suggested_by | text | Name of suggester |
| created_at | timestamp | Creation timestamp |

#### proposals
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| party_id | uuid | FK to parties |
| name | text | Proposal name |
| total_price | decimal | Calculated total |
| is_selected | boolean | Winner flag |
| created_at | timestamp | Creation timestamp |

#### proposal_items
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| proposal_id | uuid | FK to proposals |
| item_name | text | Item name |
| item_price | decimal | Item price |
| product_link | text | URL (optional) |

#### votes
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| proposal_id | uuid | FK to proposals |
| voter_name | text | Name of voter |
| created_at | timestamp | Creation timestamp |

#### gifts
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| party_id | uuid | FK to parties |
| proposal_id | uuid | FK to proposals |
| share_code | text | Unique 12-char public code |
| participation_open | boolean | Can families join |
| final_price | decimal | Actual purchase price |
| purchased_at | timestamp | Purchase timestamp |
| receipt_url | text | Receipt image URL |
| created_at | timestamp | Creation timestamp |

#### participants
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| gift_id | uuid | FK to gifts |
| family_name | text | Participating family name |
| created_at | timestamp | Creation timestamp |

## Indexes

```sql
CREATE INDEX idx_families_group ON families(group_id);
CREATE INDEX idx_birthdays_group ON birthdays(group_id);
CREATE INDEX idx_parties_group ON parties(group_id);
CREATE INDEX idx_ideas_birthday ON ideas(birthday_id);
CREATE INDEX idx_proposals_party ON proposals(party_id);
CREATE INDEX idx_votes_proposal ON votes(proposal_id);
CREATE INDEX idx_gifts_party ON gifts(party_id);
CREATE INDEX idx_participants_gift ON participants(gift_id);
CREATE INDEX idx_gifts_share_code ON gifts(share_code);
```

## Constraints

- `families.group_id` must exist in `groups.id`
- `birthdays.group_id` must exist in `groups.id`
- `parties.coordinator_id` must exist in `families.id`
- `party_celebrants` enforces unique (party_id, birthday_id)
- `gifts.share_code` must be unique
