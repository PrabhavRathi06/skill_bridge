'use server'

import { generateObject } from 'ai'
import { z } from 'zod'
import { groq, AI_MODEL } from './provider'
import type { AIExtractedRequest } from '@/types'

// We use Zod here to forcefully structure the AI's output. By passing this schema 
// into Vercel AI SDK's generateObject, we ensure the LLM strictly adheres to the types
// we need, saving us from writing tedious parsing and fallback logic.
const extractedRequestSchema = z.object({
  title: z.string().min(5).max(100).describe('Short, clear title for the service request'),
  category: z
    .enum([
      'Education',
      'Computer & IT',
      'Electronics',
      'Home Repair',
      'Design',
      'Photography',
      'Vehicle',
      'Fitness',
      'Writing',
      'Business',
      'Other',
    ])
    .describe('Best matching category'),
  location: z.string().min(2).max(100).describe('City or area mentioned in the request'),
  budget: z
    .number()
    .min(1)
    .max(1000000)
    .describe('Numeric budget in INR. If not mentioned, estimate reasonably.'),
  urgency: z
    .enum(['LOW', 'NORMAL', 'URGENT', 'TODAY'])
    .describe('Urgency level based on timing words used'),
  description: z
    .string()
    .min(20)
    .max(500)
    .describe('Improved, professional rewrite of the request description'),
})

export async function extractRequestFromText(
  userInput: string
): Promise<{ success: true; data: AIExtractedRequest } | { success: false; error: string }> {
  // Quick sanity check to save LLM tokens (and money) if the user accidentally submits garbage or empty text.
  if (!userInput || userInput.trim().length < 5) {
    return { success: false, error: 'Input too short to extract meaningful information.' }
  }

  try {
    // We use Groq as our provider because it's optimized for incredibly low latency (LPU architecture).
    // This is critical for UX, as the user is waiting synchronously for this extraction to finish
    // before they can preview their service request.
    const { object } = await generateObject({
      model: groq(AI_MODEL),
      schema: extractedRequestSchema,
      prompt: `You are a service request assistant for SkillBridge, an Indian local services platform.

Extract structured information from the following user input and return a clean, professional service request.

Rules:
- Title should be concise and professional (e.g. "Class 10 Math Tutor in Pune")
- If budget is mentioned in hundreds (e.g. "800"), treat as INR
- If no budget mentioned, estimate based on the service type and Indian market rates
- Urgency: TODAY if today/urgent/asap, URGENT if within 2 days, NORMAL default, LOW if flexible
- Description should be a professional rewrite, not just a copy of the input
- Location: extract city/area name only

User input: "${userInput.replace(/"/g, "'")}"`,
    })

    return { success: true, data: object as AIExtractedRequest }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI extraction failed'
    return { success: false, error: message }
  }
}
