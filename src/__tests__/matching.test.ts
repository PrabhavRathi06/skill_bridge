import { describe, it, expect } from 'vitest'
import { calculateMatchScore } from '../lib/matching/algorithm'

const baseProvider = {
  id: 'p1',
  name: 'Test Provider',
  location: 'Pune',
  skills: [{ skill: { name: 'Mathematics Tutoring', category: 'Education' } }],
  reviewsReceived: [],
  offers: [],
}

const baseRequest = {
  category: 'Education',
  location: 'Pune',
  budget: 1000,
}

describe('calculateMatchScore', () => {
  it('should return a total score between 0 and 100', () => {
    const result = calculateMatchScore(baseProvider, baseRequest)
    expect(result.total).toBeGreaterThanOrEqual(0)
    expect(result.total).toBeLessThanOrEqual(100)
  })

  it('should score higher when location matches exactly', () => {
    const sameLocation = calculateMatchScore(baseProvider, baseRequest)
    const diffLocation = calculateMatchScore(
      { ...baseProvider, location: 'Chennai' },
      baseRequest
    )
    expect(sameLocation.breakdown.locationMatch).toBeGreaterThan(
      diffLocation.breakdown.locationMatch
    )
  })

  it('should score zero for skill match when no matching skills', () => {
    const result = calculateMatchScore(
      { ...baseProvider, skills: [] },
      { ...baseRequest, category: 'Design' }
    )
    expect(result.breakdown.skillMatch).toBe(0)
  })

  it('should include non-empty explanation array', () => {
    const result = calculateMatchScore(baseProvider, baseRequest)
    expect(result.explanation.length).toBeGreaterThan(0)
  })

  it('should score higher for providers with good ratings', () => {
    const withRating = calculateMatchScore(
      { ...baseProvider, reviewsReceived: [{ rating: 5 }, { rating: 5 }] },
      baseRequest
    )
    const noRating = calculateMatchScore(baseProvider, baseRequest)
    expect(withRating.breakdown.ratingMatch).toBeGreaterThanOrEqual(
      noRating.breakdown.ratingMatch
    )
  })
})
