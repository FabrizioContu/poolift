export interface Group {
  id: string
  name: string
  description: string | null
  invite_code: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Family {
  id: string
  group_id: string
  name: string
  is_creator: boolean
  joined_at: string
}

export interface Birthday {
  id: string
  group_id: string
  child_name: string
  birth_date: string
  created_at: string
  updated_at: string
}

export interface Party {
  id: string
  group_id: string
  party_date: string
  coordinator_id: string | null
  created_at: string
  updated_at: string
}

export interface PartyCelebrant {
  id: string
  party_id: string
  birthday_id: string
}

export interface Idea {
  id: string
  birthday_id: string
  product_name: string
  product_link: string | null
  price: number | null
  comment: string | null
  suggested_by: string
  created_at: string
}

export interface Proposal {
  id: string
  party_id: string
  name: string
  total_price: number
  voting_deadline: string | null
  is_selected: boolean
  created_at: string
  updated_at: string
}

export interface ProposalItem {
  id: string
  proposal_id: string
  item_name: string
  item_price: number | null
  product_link: string | null
}

export interface Vote {
  id: string
  proposal_id: string
  voter_name: string
  created_at: string
}

export interface Gift {
  id: string
  party_id: string
  proposal_id: string | null
  share_code: string
  participation_open: boolean
  receipt_image_url: string | null
  final_price: number | null
  coordinator_comment: string | null
  purchased_at: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
}

export interface Participant {
  id: string
  gift_id: string
  family_name: string
  joined_at: string
}