'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createReviewSchema } from '@/lib/validation/review'
import type { ActionResult } from '@/types'

export async function createReview(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'You must be logged in.' }

  const raw = {
    requestId: formData.get('requestId'),
    revieweeId: formData.get('revieweeId'),
    rating: Number(formData.get('rating')),
    comment: formData.get('comment'),
  }

  const parsed = createReviewSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed' }
  }

  const request = await prisma.serviceRequest.findUnique({
    where: { id: parsed.data.requestId },
  })

  if (!request) return { success: false, error: 'Request not found.' }
  if (request.status !== 'COMPLETED') {
    return { success: false, error: 'Reviews can only be submitted for completed services.' }
  }
  if (request.requesterId !== session.user.id) {
    return { success: false, error: 'Only the requester can leave a review.' }
  }

  const existing = await prisma.review.findUnique({
    where: { requestId_reviewerId: { requestId: parsed.data.requestId, reviewerId: session.user.id } },
  })
  if (existing) {
    return { success: false, error: 'You have already reviewed this service.' }
  }

  await prisma.$transaction([
    prisma.review.create({
      data: { ...parsed.data, reviewerId: session.user.id },
    }),
    prisma.notification.create({
      data: {
        userId: parsed.data.revieweeId,
        type: 'NEW_REVIEW',
        title: 'You received a new review',
        message: `You received a ${parsed.data.rating}-star review for "${request.title}".`,
        link: `/profile/${parsed.data.revieweeId}`,
      },
    }),
  ])

  revalidatePath(`/requests/${parsed.data.requestId}`)
  revalidatePath(`/profile/${parsed.data.revieweeId}`)
  return { success: true }
}
