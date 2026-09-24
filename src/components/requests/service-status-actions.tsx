'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { markServiceInProgress, markServiceCompleted } from '@/actions/offers'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PlayCircle, CheckCircle2 } from 'lucide-react'

interface ServiceStatusActionsProps {
  requestId: string
  status: string
  isRequester: boolean
  isProvider: boolean
  acceptedOffer: { providerId: string } | null
}

export function ServiceStatusActions({ requestId, status, isRequester, isProvider }: ServiceStatusActionsProps) {
  const [isPending, startTransition] = useTransition()

  function handleMarkInProgress() {
    startTransition(async () => {
      const result = await markServiceInProgress(requestId)
      if (!result.success) toast.error(result.error ?? 'Failed to update status.')
      else toast.success('Service marked as In Progress!')
    })
  }

  function handleMarkCompleted() {
    startTransition(async () => {
      const result = await markServiceCompleted(requestId)
      if (!result.success) toast.error(result.error ?? 'Failed to complete service.')
      else toast.success('Service marked as completed!')
    })
  }

  if (status === 'COMPLETED' || status === 'CANCELLED') return null

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <p className="mb-3 text-sm font-medium text-gray-700">Service Actions</p>
        <div className="flex flex-wrap gap-3">
          {status === 'PROVIDER_SELECTED' && (isRequester || isProvider) && (
            <Button size="sm" onClick={handleMarkInProgress} disabled={isPending} className="gap-1.5">
              <PlayCircle className="h-4 w-4" /> Mark In Progress
            </Button>
          )}
          {status === 'IN_PROGRESS' && isRequester && (
            <Button size="sm" onClick={handleMarkCompleted} disabled={isPending} className="gap-1.5 bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4" /> Mark Completed
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
