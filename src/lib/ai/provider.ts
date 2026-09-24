import { createGroq } from '@ai-sdk/groq'

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY environment variable is not set')
}

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export const AI_MODEL = 'llama-3.3-70b-versatile'
