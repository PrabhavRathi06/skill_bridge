'use server'

import { generateObject } from 'ai'
import { z } from 'zod'
import { groq, AI_MODEL } from './provider'

const improvedDescriptionSchema = z.object({
  improved: z
    .string()
    .min(20)
    .max(1000)
    .describe('Improved, clear, professional version of the description'),
  changes: z
    .array(z.string())
    .describe('List of improvements made (e.g. Added specific details, Fixed grammar)'),
})

export async function improveRequestDescription(description: string): Promise<
  | { success: true; improved: string; changes: string[] }
  | { success: false; error: string }
> {
  if (!description || description.trim().length < 5) {
    return { success: false, error: 'Description is too short to improve.' }
  }

  try {
    const { object } = await generateObject({
      model: groq(AI_MODEL),
      schema: improvedDescriptionSchema,
      prompt: `You are a writing assistant for SkillBridge, an Indian local services platform.

Improve the following service request description to make it clearer, more professional, and more likely to attract good service providers. Keep the original intent intact. Do not invent details not present in the original.

Original description: "${description.replace(/"/g, "'")}"`,
    })

    return { success: true, improved: object.improved, changes: object.changes }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI improvement failed'
    return { success: false, error: message }
  }
}
