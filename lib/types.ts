// Group Types for multi-use support
export type GroupType = 'class' | 'friends' | 'family' | 'work' | 'other'

export const GROUP_TYPE_LABELS: Record<GroupType, string> = {
  class: 'Clase',
  friends: 'Amigos',
  family: 'Familia',
  work: 'Trabajo',
  other: 'Otro'
}

export const GROUP_TYPE_ICONS: Record<GroupType, string> = {
  class: '🎒',
  friends: '👥',
  family: '👨‍👩‍👧‍👦',
  work: '💼',
  other: '✨'
}

export const GROUP_TYPE_DESCRIPTIONS: Record<GroupType, string> = {
  class: 'Colegio, guardería, instituto',
  friends: 'Grupo de amigos, comunidad',
  family: 'Primos, tíos, abuelos...',
  work: 'Compañeros, departamento',
  other: 'Club, equipo, vecinos...'
}

export const GROUP_TYPE_EXAMPLES: Record<GroupType, string[]> = {
  class: ['2°B Primaria', 'Girasoles guardería', '5° Instituto'],
  friends: ['Los inseparables', 'Grupo running', 'Amigos uni'],
  family: ['Familia Martínez', 'Primos Madrid', 'Tíos paternos'],
  work: ['Equipo Marketing', 'Oficina Barcelona', 'Departamento IT'],
  other: ['Club de lectura', 'Vecinos bloque 5', 'Equipo fútbol']
}

// Direct Gift Types
export type OccasionType = 'birthday' | 'farewell' | 'wedding' | 'birth' | 'graduation' | 'other'

export const OCCASION_LABELS: Record<OccasionType, string> = {
  birthday: '🎂 Cumpleaños',
  farewell: '👋 Despedida',
  wedding: '💒 Boda',
  birth: '👶 Nacimiento',
  graduation: '🎓 Graduación',
  other: '✨ Otro'
}

export interface Group {
  id: string
  name: string
  type: GroupType
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
  user_id?: string | null
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