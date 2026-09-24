import { z } from 'zod'

export const REQUEST_CATEGORIES = [
  'Education',
  'Computer & IT',
  'Electronics',
  'Home Repair',
  'Design',
  'Photography',
  'Vehicle',
  'Fitness',
  'Writing',
  'Business',
  'Other',
] as const

export const URGENCY_OPTIONS = ['LOW', 'NORMAL', 'URGENT', 'TODAY'] as const

export const createRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description too long'),
  category: z.enum(REQUEST_CATEGORIES, { errorMap: () => ({ message: 'Invalid category' }) }),
  location: z.string().min(2, 'Location required').max(100),
  budget: z.number().min(1, 'Budget must be at least 1').max(1000000, 'Budget too high'),
  urgency: z.enum(URGENCY_OPTIONS).default('NORMAL'),
})

export const updateRequestSchema = createRequestSchema.partial().extend({
  id: z.string().min(1),
})

export const requestFiltersSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  minBudget: z.coerce.number().optional(),
  maxBudget: z.coerce.number().optional(),
  urgency: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(12),
  sort: z.enum(['newest', 'oldest', 'budget_asc', 'budget_desc']).default('newest'),
})

export type CreateRequestInput = z.infer<typeof createRequestSchema>
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>
export type RequestFilters = z.infer<typeof requestFiltersSchema>
