export type { User, ServiceRequest, Offer, Review, Notification, Skill, UserSkill, Message, Conversation } from '@prisma/client'

export type RequestCategory =
  | 'Education'
  | 'Computer & IT'
  | 'Electronics'
  | 'Home Repair'
  | 'Design'
  | 'Photography'
  | 'Vehicle'
  | 'Fitness'
  | 'Writing'
  | 'Business'
  | 'Other'

export type UrgencyLabel = 'LOW' | 'NORMAL' | 'URGENT' | 'TODAY'

export interface MatchScore {
  total: number
  breakdown: {
    skillMatch: number
    locationMatch: number
    budgetMatch: number
    availabilityMatch: number
    ratingMatch: number
  }
  explanation: string[]
}

export interface AIExtractedRequest {
  title: string
  category: RequestCategory
  location: string
  budget: number
  urgency: UrgencyLabel
  description: string
}

export interface RequestWithDetails {
  id: string
  requesterId: string
  title: string
  description: string
  category: string
  location: string
  budget: number
  urgency: string
  status: string
  createdAt: Date
  updatedAt: Date
  requester: {
    id: string
    name: string
    profileImage: string | null
    location: string | null
  }
  _count: {
    offers: number
  }
}

export interface OfferWithProvider {
  id: string
  requestId: string
  providerId: string
  amount: number
  message: string
  estimatedTime: string
  status: string
  createdAt: Date
  provider: {
    id: string
    name: string
    profileImage: string | null
    location: string | null
    bio: string | null
  }
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}
