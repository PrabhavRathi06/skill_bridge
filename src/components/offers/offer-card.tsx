'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { acceptOffer, rejectOffer } from '@/actions/offers'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatRelativeTime, getStatusColor } from '@/lib/utils'
import { CheckCircle2, XCircle, Clock, IndianRupee } from 'lucide-react'

interface OfferCardProps {
  offer: {
    id: string
    providerId: string
    amount: number
    message: string
    estimatedTime: string
    status: string
    createdAt: Date
    provider: {
      id: string
      name: string
      profileImage: string | null
      location: string | null
      bio: string | null
    }
  }
  requestStatus: string
  isRequester: boolean
}

export function OfferCard({ offer, requestStatus, isRequester }: OfferCardProps) {
  const [isPending, startTransition] = useTransition()

  function handleAccept() {
    startTransition(async () => {
      const result = await acceptOffer(offer.id)
      if (!result.success) toast.error(result.error ?? 'Failed to accept offer.')
      else toast.success('Offer accepted! Conversation started.')
    })
  }

  function handleReject() {
    startTransition(async () => {
      const result = await rejectOffer(offer.id)
      if (!result.success) toast.error(result.error ?? 'Failed to reject offer.')
      else toast.success('Offer rejected.')
    })
  }

  const canAct = isRequester && offer.status === 'PENDING' && ['OPEN', 'OFFERS_RECEIVED'].includes(requestStatus)

  return (
    <Card className={offer.status === 'ACCEPTED' ? 'border-green-300 bg-green-50' : ''}>
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {offer.provider.name[0]}
            </div>
            <div>
              <p className="font-medium text-gray-900">{offer.provider.name}</p>
              {offer.provider.location && <p className="text-xs text-gray-500">{offer.provider.location}</p>}
            </div>
          </div>
          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${getStatusColor(offer.status)}`}>{offer.status}</span>
        </div>
        <div className="mb-3 flex gap-4 text-sm">
          <span className="flex items-center gap-1 font-semibold text-green-700"><IndianRupee className="h-4 w-4" />{formatCurrency(offer.amount)}</span>
          <span className="flex items-center gap-1 text-gray-500"><Clock className="h-4 w-4" />{offer.estimatedTime}</span>
        </div>
        <p className="mb-4 text-sm text-gray-700">{offer.message}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{formatRelativeTime(offer.createdAt)}</span>
          {canAct && (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAccept} disabled={isPending} className="gap-1.5 bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="h-4 w-4" /> Accept
              </Button>
              <Button size="sm" variant="outline" onClick={handleReject} disabled={isPending} className="gap-1.5 text-red-600 hover:bg-red-50">
                <XCircle className="h-4 w-4" /> Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
