'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendMessageSchema } from '@/lib/validation/message'
import type { ActionResult } from '@/types'

export async function sendMessage(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'You must be logged in.' }

  const raw = {
    conversationId: formData.get('conversationId'),
    content: formData.get('content'),
  }

  const parsed = sendMessageSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed' }
  }

  // Authorization: verify user is a participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: parsed.data.conversationId,
        userId: session.user.id,
      },
    },
  })

  if (!participant) {
    return { success: false, error: 'You are not a participant in this conversation.' }
  }

  await prisma.message.create({
    data: {
      conversationId: parsed.data.conversationId,
      senderId: session.user.id,
      content: parsed.data.content,
    },
  })

  revalidatePath(`/messages/${parsed.data.conversationId}`)
  return { success: true }
}

export async function getConversation(requestId: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  const conversation = await prisma.conversation.findUnique({
    where: { requestId },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, profileImage: true } } },
      },
      messages: {
        include: { sender: { select: { id: true, name: true, profileImage: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!conversation) return null

  const isParticipant = conversation.participants.some((p) => p.userId === session.user.id)
  if (!isParticipant) return null

  return conversation
}

export async function getUserConversations() {
  const session = await auth()
  if (!session?.user?.id) return []

  const participations = await prisma.conversationParticipant.findMany({
    where: { userId: session.user.id },
    include: {
      conversation: {
        include: {
          participants: {
            include: { user: { select: { id: true, name: true, profileImage: true } } },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: 'desc' } },
  })

  return participations.map((p) => p.conversation)
}
