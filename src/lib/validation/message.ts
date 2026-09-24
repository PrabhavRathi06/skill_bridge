import { z } from 'zod'

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID required'),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long'),
})

export const createConversationSchema = z.object({
  requestId: z.string().min(1, 'Request ID required'),
  participantId: z.string().min(1, 'Participant ID required'),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type CreateConversationInput = z.infer<typeof createConversationSchema>
