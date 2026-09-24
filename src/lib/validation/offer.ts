import { z } from 'zod'

export const createOfferSchema = z.object({
  requestId: z.string().min(1, 'Request ID required'),
  amount: z
    .number()
    .min(1, 'Amount must be at least 1')
    .max(1000000, 'Amount too high'),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(1000, 'Message too long'),
  estimatedTime: z
    .string()
    .min(2, 'Estimated time required')
    .max(100, 'Estimated time too long'),
})

export const updateOfferStatusSchema = z.object({
  offerId: z.string().min(1),
  status: z.enum(['ACCEPTED', 'REJECTED']),
})

export type CreateOfferInput = z.infer<typeof createOfferSchema>
export type UpdateOfferStatusInput = z.infer<typeof updateOfferStatusSchema>
