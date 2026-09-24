'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createRequestSchema, updateRequestSchema, requestFiltersSchema } from '@/lib/validation/request'
import { isValidStatusTransition } from '@/lib/utils'
import type { ActionResult, PaginatedResult, RequestWithDetails } from '@/types'

export async function createRequest(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'You must be logged in.' }

  const raw = {
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    location: formData.get('location'),
    budget: Number(formData.get('budget')),
    urgency: formData.get('urgency') || 'NORMAL',
  }

  const parsed = createRequestSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed' }
  }

  const request = await prisma.serviceRequest.create({
    data: {
      ...parsed.data,
      requesterId: session.user.id,
    },
  })

  revalidatePath('/requests')
  revalidatePath('/dashboard')
  return { success: true, data: { id: request.id } }
}

export async function updateRequest(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'You must be logged in.' }

  const raw = {
    id: formData.get('id'),
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    location: formData.get('location'),
    budget: Number(formData.get('budget')),
    urgency: formData.get('urgency'),
  }

  const parsed = updateRequestSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed' }
  }

  const { id, ...data } = parsed.data

  const existing = await prisma.serviceRequest.findUnique({ where: { id } })
  if (!existing) return { success: false, error: 'Request not found.' }
  if (existing.requesterId !== session.user.id) {
    return { success: false, error: 'You are not authorized to edit this request.' }
  }
  if (existing.status !== 'OPEN' && existing.status !== 'OFFERS_RECEIVED') {
    return { success: false, error: 'This request can no longer be edited.' }
  }

  await prisma.serviceRequest.update({
    where: { id },
    data,
  })

  revalidatePath(`/requests/${id}`)
  revalidatePath('/requests')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function cancelRequest(requestId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'You must be logged in.' }

  const existing = await prisma.serviceRequest.findUnique({ where: { id: requestId } })
  if (!existing) return { success: false, error: 'Request not found.' }
  if (existing.requesterId !== session.user.id) {
    return { success: false, error: 'You are not authorized to cancel this request.' }
  }
  if (!isValidStatusTransition(existing.status, 'CANCELLED')) {
    return { success: false, error: 'This request cannot be cancelled in its current state.' }
  }

  await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { status: 'CANCELLED' },
  })

  revalidatePath(`/requests/${requestId}`)
  revalidatePath('/requests')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getRequests(
  rawFilters: Record<string, string | undefined>
): Promise<PaginatedResult<RequestWithDetails>> {
  const parsed = requestFiltersSchema.safeParse(rawFilters)
  const filters = parsed.success ? parsed.data : requestFiltersSchema.parse({})

  const where: Record<string, unknown> = { status: { not: 'CANCELLED' } }

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: 'insensitive' } },
      { description: { contains: filters.q, mode: 'insensitive' } },
    ]
  }
  if (filters.category) where.category = filters.category
  if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' }
  if (filters.urgency) where.urgency = filters.urgency
  if (filters.status) where.status = filters.status
  if (filters.minBudget || filters.maxBudget) {
    where.budget = {
      ...(filters.minBudget ? { gte: filters.minBudget } : {}),
      ...(filters.maxBudget ? { lte: filters.maxBudget } : {}),
    }
  }

  const orderBy = {
    newest: { createdAt: 'desc' as const },
    oldest: { createdAt: 'asc' as const },
    budget_asc: { budget: 'asc' as const },
    budget_desc: { budget: 'desc' as const },
  }[filters.sort] ?? { createdAt: 'desc' as const }

  const [data, total] = await Promise.all([
    prisma.serviceRequest.findMany({
      where,
      orderBy,
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      include: {
        requester: { select: { id: true, name: true, profileImage: true, location: true } },
        _count: { select: { offers: true } },
      },
    }),
    prisma.serviceRequest.count({ where }),
  ])

  return {
    data: data as RequestWithDetails[],
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.ceil(total / filters.pageSize),
  }
}

export async function getRequestById(id: string) {
  return prisma.serviceRequest.findUnique({
    where: { id },
    include: {
      requester: {
        select: {
          id: true, name: true, profileImage: true, location: true, bio: true, createdAt: true,
        },
      },
      offers: {
        include: {
          provider: {
            select: {
              id: true, name: true, profileImage: true, location: true, bio: true,
              reviewsReceived: { select: { rating: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      reviews: {
        include: {
          reviewer: { select: { id: true, name: true, profileImage: true } },
        },
      },
      _count: { select: { offers: true } },
    },
  })
}
