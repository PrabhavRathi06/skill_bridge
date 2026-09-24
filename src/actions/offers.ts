'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createOfferSchema } from '@/lib/validation/offer'
import { isValidStatusTransition } from '@/lib/utils'
import type { ActionResult } from '@/types'

export async function submitOffer(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'You must be logged in.' }

  const raw = {
    requestId: formData.get('requestId'),
    amount: Number(formData.get('amount')),
    message: formData.get('message'),
    estimatedTime: formData.get('estimatedTime'),
  }

  const parsed = createOfferSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed' }
  }

  const request = await prisma.serviceRequest.findUnique({
    where: { id: parsed.data.requestId },
  })

  if (!request) return { success: false, error: 'Request not found.' }
  
  // It doesn't make sense for someone to offer services on their own request.
  if (request.requesterId === session.user.id) {
    return { success: false, error: 'You cannot submit an offer on your own request.' }
  }
  
  // We only accept offers if the request is still actively looking for providers.
  if (!['OPEN', 'OFFERS_RECEIVED'].includes(request.status)) {
    return { success: false, error: 'This request is no longer accepting offers.' }
  }

  // Prevent users from spamming the requester with multiple offers for the same job.
  const existingOffer = await prisma.offer.findUnique({
    where: { requestId_providerId: { requestId: parsed.data.requestId, providerId: session.user.id } },
  })
  if (existingOffer) {
    return { success: false, error: 'You have already submitted an offer for this request.' }
  }

  // Wrap the offer creation, request status update, and notification in a single transaction.
  // This guarantees we don't end up with an orphaned offer if the notification fails,
  // or a request stuck in 'OPEN' despite having offers.
  const [offer] = await prisma.$transaction([
    prisma.offer.create({
      data: { ...parsed.data, providerId: session.user.id },
    }),
    prisma.serviceRequest.update({
      where: { id: parsed.data.requestId },
      data: { status: 'OFFERS_RECEIVED' },
    }),
    prisma.notification.create({
      data: {
        userId: request.requesterId,
        type: 'NEW_OFFER',
        title: 'New offer received',
        message: `Someone submitted an offer on your request: ${request.title}`,
        link: `/requests/${request.id}`,
      },
    }),
  ])

  revalidatePath(`/requests/${parsed.data.requestId}`)
  revalidatePath('/dashboard')
  return { success: true, data: { id: offer.id } }
}

export async function acceptOffer(offerId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'You must be logged in.' }

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { request: true },
  })

  if (!offer) return { success: false, error: 'Offer not found.' }
  
  // Strict ownership check: only the person who created the request can accept an offer for it.
  if (offer.request.requesterId !== session.user.id) {
    return { success: false, error: 'You are not authorized to accept this offer.' }
  }
  
  // We don't want to accept an offer that was already rejected or accepted previously.
  if (offer.status !== 'PENDING') {
    return { success: false, error: 'This offer is no longer pending.' }
  }
  
  // Validate the state transition to prevent accepting offers on a request that's already in progress.
  if (!isValidStatusTransition(offer.request.status, 'PROVIDER_SELECTED')) {
    return { success: false, error: 'Request is not in a valid state to accept offers.' }
  }

  // Using a database transaction is absolutely critical here.
  // We need to atomicly accept this offer, reject all competing offers, update the parent request state,
  // initialize a chat room, and notify the winner. If any of these fail, we must roll back everything.
  await prisma.$transaction([
    prisma.offer.update({ where: { id: offerId }, data: { status: 'ACCEPTED' } }),
    prisma.offer.updateMany({
      where: { requestId: offer.requestId, id: { not: offerId }, status: 'PENDING' },
      data: { status: 'REJECTED' },
    }),
    prisma.serviceRequest.update({
      where: { id: offer.requestId },
      data: { status: 'PROVIDER_SELECTED' },
    }),
    prisma.conversation.upsert({
      where: { requestId: offer.requestId },
      create: {
        requestId: offer.requestId,
        participants: {
          create: [
            { userId: session.user.id },
            { userId: offer.providerId },
          ],
        },
      },
      update: {},
    }),
    prisma.notification.create({
      data: {
        userId: offer.providerId,
        type: 'OFFER_ACCEPTED',
        title: 'Your offer was accepted!',
        message: `Your offer on "${offer.request.title}" was accepted. You can now start the service.`,
        link: `/requests/${offer.requestId}`,
      },
    }),
  ])

  revalidatePath(`/requests/${offer.requestId}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function rejectOffer(offerId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'You must be logged in.' }

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { request: true },
  })

  if (!offer) return { success: false, error: 'Offer not found.' }
  if (offer.request.requesterId !== session.user.id) {
    return { success: false, error: 'You are not authorized to reject this offer.' }
  }
  if (offer.status !== 'PENDING') {
    return { success: false, error: 'This offer is no longer pending.' }
  }

  await prisma.$transaction([
    prisma.offer.update({ where: { id: offerId }, data: { status: 'REJECTED' } }),
    prisma.notification.create({
      data: {
        userId: offer.providerId,
        type: 'OFFER_REJECTED',
        title: 'Your offer was rejected',
        message: `Your offer on "${offer.request.title}" was not selected.`,
        link: `/requests/${offer.requestId}`,
      },
    }),
  ])

  revalidatePath(`/requests/${offer.requestId}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function markServiceInProgress(requestId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'You must be logged in.' }

  const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } })
  if (!request) return { success: false, error: 'Request not found.' }

  const acceptedOffer = await prisma.offer.findFirst({
    where: { requestId, status: 'ACCEPTED' },
  })

  // We allow either the provider (who is actually doing the work) or the requester to mark it as started.
  const isProvider = acceptedOffer?.providerId === session.user.id
  const isRequester = request.requesterId === session.user.id

  if (!isProvider && !isRequester) {
    return { success: false, error: 'Not authorized.' }
  }
  
  // Making sure we don't accidentally mark a cancelled or already completed service as in progress.
  if (!isValidStatusTransition(request.status, 'IN_PROGRESS')) {
    return { success: false, error: 'Request cannot be moved to In Progress from its current state.' }
  }

  await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { status: 'IN_PROGRESS' },
  })

  revalidatePath(`/requests/${requestId}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function markServiceCompleted(requestId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'You must be logged in.' }

  const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } })
  if (!request) return { success: false, error: 'Request not found.' }
  
  // For completion, we are stricter: only the requester can sign off and say the job is truly done.
  // This prevents providers from prematurely marking work as finished to get paid/reviewed.
  if (request.requesterId !== session.user.id) {
    return { success: false, error: 'Only the requester can mark a service as completed.' }
  }
  
  // Ensure the service was actually in progress before completing it.
  if (!isValidStatusTransition(request.status, 'COMPLETED')) {
    return { success: false, error: 'Request cannot be marked completed from its current state.' }
  }

  const acceptedOffer = await prisma.offer.findFirst({
    where: { requestId, status: 'ACCEPTED' },
  })

  await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { status: 'COMPLETED' },
  })

  if (acceptedOffer) {
    await prisma.notification.create({
      data: {
        userId: acceptedOffer.providerId,
        type: 'SERVICE_COMPLETED',
        title: 'Service marked as completed',
        message: `The requester marked "${request.title}" as completed.`,
        link: `/requests/${requestId}`,
      },
    })
  }

  revalidatePath(`/requests/${requestId}`)
  revalidatePath('/dashboard')
  return { success: true }
}
