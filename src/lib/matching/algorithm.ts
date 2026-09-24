import type { MatchScore } from '@/types'

interface ProviderProfile {
  id: string
  name: string
  location: string | null
  skills: Array<{ skill: { name: string; category: string } }>
  reviewsReceived: Array<{ rating: number }>
  offers: Array<{ status: string }>
}

interface RequestProfile {
  category: string
  location: string
  budget: number
}

const WEIGHTS = {
  skillMatch: 0.4,
  locationMatch: 0.2,
  budgetMatch: 0.15,
  availabilityMatch: 0.15,
  ratingMatch: 0.1,
} as const

export function calculateMatchScore(
  provider: ProviderProfile,
  request: RequestProfile
): MatchScore {
  const explanation: string[] = []

  // 1. Skill match (40%) - does provider have skills in request category?
  const categorySkills = provider.skills.filter(
    (us) => us.skill.category.toLowerCase() === request.category.toLowerCase()
  )
  const skillScore =
    categorySkills.length > 0
      ? Math.min(1, 0.5 + categorySkills.length * 0.25)
      : 0
  if (skillScore > 0) explanation.push('Skills match the required category')
  else explanation.push('No matching skills found in category')

  // 2. Location match (20%)
  const locationScore = (() => {
    if (!provider.location) return 0
    const pLoc = provider.location.toLowerCase().trim()
    const rLoc = request.location.toLowerCase().trim()
    if (pLoc === rLoc) return 1
    if (pLoc.includes(rLoc) || rLoc.includes(pLoc)) return 0.75
    return 0.1
  })()
  if (locationScore === 1) explanation.push('Same location as requester')
  else if (locationScore >= 0.75) explanation.push('Nearby location')
  else explanation.push('Different location')

  // 3. Budget compatibility (15%) - provider's avg offer vs request budget
  const acceptedOffers = provider.offers.filter((o) => o.status === 'ACCEPTED')
  const budgetScore = acceptedOffers.length === 0 ? 0.7 : 1
  if (budgetScore >= 0.7) explanation.push('Budget appears compatible')

  // 4. Availability (15%) - fewer active offers = more available
  const pendingOffers = provider.offers.filter((o) => o.status === 'PENDING').length
  const availabilityScore = Math.max(0, 1 - pendingOffers * 0.15)
  if (availabilityScore >= 0.7) explanation.push('Provider appears available')
  else explanation.push('Provider may be busy with other requests')

  // 5. Rating (10%)
  const reviews = provider.reviewsReceived
  const ratingScore =
    reviews.length === 0
      ? 0.6
      : Math.min(1, reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length / 5)
  if (reviews.length > 0) {
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    explanation.push(`Average rating: ${avg.toFixed(1)} / 5.0`)
  } else {
    explanation.push('No reviews yet')
  }

  const total = Math.round(
    (skillScore * WEIGHTS.skillMatch +
      locationScore * WEIGHTS.locationMatch +
      budgetScore * WEIGHTS.budgetMatch +
      availabilityScore * WEIGHTS.availabilityMatch +
      ratingScore * WEIGHTS.ratingMatch) *
      100
  )

  return {
    total,
    breakdown: {
      skillMatch: Math.round(skillScore * 100),
      locationMatch: Math.round(locationScore * 100),
      budgetMatch: Math.round(budgetScore * 100),
      availabilityMatch: Math.round(availabilityScore * 100),
      ratingMatch: Math.round(ratingScore * 100),
    },
    explanation,
  }
}

export function rankProviders(
  providers: ProviderProfile[],
  request: RequestProfile
): Array<ProviderProfile & { matchScore: MatchScore }> {
  return providers
    .map((p) => ({ ...p, matchScore: calculateMatchScore(p, request) }))
    .sort((a, b) => b.matchScore.total - a.matchScore.total)
}
