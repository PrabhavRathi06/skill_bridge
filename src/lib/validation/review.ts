import { z } from 'zod'

export const createReviewSchema = z.object({
  requestId: z.string().min(1, 'Request ID required'),
  revieweeId: z.string().min(1, 'Reviewee ID required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating max is 5'),
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment too long'),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
