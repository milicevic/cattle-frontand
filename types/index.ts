// Shared types across the application

export type DashboardView = "requests" | "farms" | "profile" | "farm" | "animals" | "vets"

export interface VetRequest {
  id: number
  farm_id: number
  status: 'pending' | 'approved' | 'rejected'
  message?: string
  requested_at: string
  responded_at?: string
  farm?: {
    id: number
    name: string
    location?: string
    state?: string
  }
}

export interface Farm {
  id: number
  name: string
  location?: string
  state?: string
  is_assigned?: boolean
  has_pending_request?: boolean
  is_active?: boolean
  farmer?: {
    id: number
  }
  assigned_at?: string
}

export interface Animal {
  id: number
  tag_number: string
  name?: string
  species: string
  type: string
  gender: string
  date_of_birth?: string
  mother?: Animal
  father?: Animal
  animalable?: {
    milk_yield?: number
    last_calving_date?: string
    last_insemination_date?: string
    expected_calving_date?: string
    actual_calving_date?: string
    semen_quality?: string
    aggression_level?: string
  }
  is_active?: boolean
}

export type Species = "cattle" | "horse" | "sheep"

export interface PregnancyProgress {
  status: 'pregnant' | 'calved' | 'overdue' | 'due_soon'
  last_insemination_date: string
  expected_calving_date: string
  actual_calving_date?: string
  days_since_insemination: number
  days_until_calving: number
  progress_percentage: number
  total_gestation_days: number
}

export interface NextInseminationPeriod {
  last_calving_date: string
  days_since_calving: number
  ideal_start_days: number
  ideal_end_days: number
  days_until_ideal_start: number
  days_until_ideal_end: number
  is_in_window: boolean
  is_past_window: boolean
  is_before_window: boolean
  next_insemination_date: string
  status: 'ready' | 'overdue' | 'approaching'
}
