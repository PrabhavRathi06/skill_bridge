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
  if (request.requesterId === session.user.id) {
    return { success: false, error: 'You cannot submit an offer on your own request.' }
  }
  if (!['OPEN', 'OFFERS_RECEIVED'].includes(request.status)) {
    return { success: false, error: 'This request is no longer accepting offers.' }
  }

  const existingOffer = await prisma.offer.findUnique({
    where: { requestId_providerId: { requestId: parsed.data.requestId, providerId: session.user.id } },
  })
  if (existingOffer) {
    return { success: false, error: 'You have already submitted an offer for this request.' }
  }

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
  if (offer.request.requesterId !== session.user.id) {
    return { success: false, error: 'You are not authorized to accept this offer.' }
  }
  if (offer.status !== 'PENDING') {
    return { success: false, error: 'This offer is no longer pending.' }
  }
  if (!isValidStatusTransition(offer.request.status, 'PROVIDER_SELECTED')) {
    return { success: false, error: 'Request is not in a valid state to accept offers.' }
  }

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

  const isProvider = acceptedOffer?.providerId === session.user.id
  const isRequester = request.requesterId === session.user.id

  if (!isProvider && !isRequester) {
    return { success: false, error: 'Not authorized.' }
  }
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
  if (request.requesterId !== session.user.id) {
    return { success: false, error: 'Only the requester can mark a service as completed.' }
  }
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
