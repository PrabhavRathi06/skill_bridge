'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types'

export async function getUserNotifications() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

export async function markNotificationRead(notificationId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  const notification = await prisma.notification.findUnique({ where: { id: notificationId } })
  if (!notification) return { success: false, error: 'Notification not found.' }
  if (notification.userId !== session.user.id) {
    return { success: false, error: 'Not authorized.' }
  }

  await prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } })
  revalidatePath('/')
  return { success: true }
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  })

  revalidatePath('/')
  return { success: true }
}

export async function getUnreadCount(): Promise<number> {
  const session = await auth()
  if (!session?.user?.id) return 0

  return prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  })
}
