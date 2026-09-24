import { notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getRequestById } from '@/actions/requests'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OfferForm } from '@/components/offers/offer-form'
import { OfferCard } from '@/components/offers/offer-card'
import { ServiceStatusActions } from '@/components/requests/service-status-actions'
import { formatCurrency, formatDate, getStatusColor, getUrgencyColor } from '@/lib/utils'
import { MapPin, IndianRupee, Calendar } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const request = await getRequestById(id)
  return { title: request ? `${request.title} - SkillBridge` : 'Request Not Found' }
}

export default async function RequestDetailPage({ params }: Props) {
  const { id } = await params
  const [request, session] = await Promise.all([getRequestById(id), auth()])

  if (!request) notFound()

  const isRequester = session?.user?.id === request.requesterId
  const hasSubmittedOffer = request.offers.some((o) => o.providerId === session?.user?.id)
  const isAcceptedProvider = request.offers.some(
    (o) => o.providerId === session?.user?.id && o.status === 'ACCEPTED'
  )
  const canSubmitOffer =
    session &&
    !isRequester &&
    !hasSubmittedOffer &&
    ['OPEN', 'OFFERS_RECEIVED'].includes(request.status)

  const acceptedOffer = request.offers.find((o) => o.status === 'ACCEPTED')

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/requests" className="text-sm text-gray-500 hover:text-gray-900">
          Back to requests
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{request.category}</Badge>
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                {request.urgency}
              </span>
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${getStatusColor(request.status)}`}>
                {request.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="mb-4 text-2xl font-bold text-gray-900">{request.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {request.location}
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-green-700">
                <IndianRupee className="h-4 w-4" /> {formatCurrency(request.budget)}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> {formatDate(request.createdAt)}
              </span>
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-gray-700">{request.description}</p>
            </CardContent>
          </Card>

          {(isRequester || isAcceptedProvider) && (
            <ServiceStatusActions
              requestId={request.id}
              status={request.status}
              isRequester={isRequester}
              isProvider={isAcceptedProvider}
              acceptedOffer={acceptedOffer ? { providerId: acceptedOffer.providerId } : null}
            />
          )}

          {isRequester && request.offers.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Offers ({request.offers.length})
              </h2>
              <div className="space-y-4">
                {request.offers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    requestStatus={request.status}
                    isRequester={isRequester}
                  />
                ))}
              </div>
            </div>
          )}

          {canSubmitOffer && (
            <Card>
              <CardHeader><CardTitle className="text-base">Submit an Offer</CardTitle></CardHeader>
              <CardContent><OfferForm requestId={request.id} /></CardContent>
            </Card>
          )}

          {!session && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-5 text-center">
                <p className="mb-3 text-sm text-gray-700">Sign in to submit an offer for this request.</p>
                <Button asChild size="sm"><Link href="/login">Sign In</Link></Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-500">Posted by</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {request.requester.name[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{request.requester.name}</p>
                  {request.requester.location && (
                    <p className="text-xs text-gray-500">{request.requester.location}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-500">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Category</span>
                <span className="font-medium">{request.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Budget</span>
                <span className="font-medium text-green-700">{formatCurrency(request.budget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Urgency</span>
                <span className="font-medium">{request.urgency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Offers</span>
                <span className="font-medium">{request._count.offers}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
