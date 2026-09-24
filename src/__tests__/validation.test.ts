import { describe, it, expect } from 'vitest'
import { createRequestSchema } from '../lib/validation/request'
import { registerSchema } from '../lib/validation/auth'
import { createOfferSchema } from '../lib/validation/offer'

describe('createRequestSchema', () => {
  it('should pass with valid data', () => {
    const result = createRequestSchema.safeParse({
      title: 'Fix my laptop',
      description: 'My laptop screen is cracked and needs replacement today.',
      category: 'Computer & IT',
      location: 'Pune',
      budget: 800,
      urgency: 'TODAY',
    })
    expect(result.success).toBe(true)
  })

  it('should fail with title too short', () => {
    const result = createRequestSchema.safeParse({
      title: 'Fix',
      description: 'My laptop screen is cracked and needs replacement today.',
      category: 'Computer & IT',
      location: 'Pune',
      budget: 800,
    })
    expect(result.success).toBe(false)
  })

  it('should fail with invalid category', () => {
    const result = createRequestSchema.safeParse({
      title: 'Fix my laptop',
      description: 'My laptop screen is cracked and needs replacement today.',
      category: 'InvalidCategory',
      location: 'Pune',
      budget: 800,
    })
    expect(result.success).toBe(false)
  })

  it('should fail with negative budget', () => {
    const result = createRequestSchema.safeParse({
      title: 'Fix my laptop',
      description: 'My laptop screen is cracked and needs replacement today.',
      category: 'Computer & IT',
      location: 'Pune',
      budget: -100,
    })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('should pass with valid registration data', () => {
    const result = registerSchema.safeParse({
      name: 'Prabhav Rathi',
      email: 'prabhav@example.com',
      password: 'Password1',
      location: 'Pune',
    })
    expect(result.success).toBe(true)
  })

  it('should fail with weak password', () => {
    const result = registerSchema.safeParse({
      name: 'Prabhav',
      email: 'prabhav@example.com',
      password: 'weak',
      location: 'Pune',
    })
    expect(result.success).toBe(false)
  })

  it('should fail with invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'Prabhav',
      email: 'not-an-email',
      password: 'Password1',
      location: 'Pune',
    })
    expect(result.success).toBe(false)
  })
})

describe('createOfferSchema', () => {
  it('should pass with valid offer data', () => {
    const result = createOfferSchema.safeParse({
      requestId: 'some-id-123',
      amount: 750,
      message: 'I have 5 years of experience and can complete this efficiently within the given timeframe.',
      estimatedTime: '2-3 hours',
    })
    expect(result.success).toBe(true)
  })

  it('should fail with message too short', () => {
    const result = createOfferSchema.safeParse({
      requestId: 'some-id-123',
      amount: 750,
      message: 'Short',
      estimatedTime: '2 hours',
    })
    expect(result.success).toBe(false)
  })
})
