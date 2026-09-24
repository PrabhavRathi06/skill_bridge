import Link from 'next/link'
import { MapPin, Clock, IndianRupee } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatRelativeTime, getStatusColor, getUrgencyColor, truncate } from '@/lib/utils'
import type { RequestWithDetails } from '@/types'

interface RequestCardProps {
  request: RequestWithDetails
}

export function RequestCard({ request }: RequestCardProps) {
  return (
    <Link href={`/requests/${request.id}`}>
      <Card className="group h-full cursor-pointer transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="mb-3 flex items-start justify-between gap-2">
            <Badge variant="secondary" className="shrink-0 text-xs">
              {request.category}
            </Badge>
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
              {request.urgency}
            </span>
          </div>

          <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-blue-600">
            {truncate(request.title, 60)}
          </h3>
          <p className="mb-4 text-sm text-gray-500">{truncate(request.description, 100)}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {request.location}
            </span>
            <span className="flex items-center gap-1 font-semibold text-green-700">
              <IndianRupee className="h-3 w-3" />
              {formatCurrency(request.budget)}
            </span>
          </div>
        </CardContent>

        <CardFooter className="border-t px-5 py-3">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                {request.requester.name[0]}
              </div>
              <span className="text-xs text-gray-500">{request.requester.name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>{request._count.offers} offer{request._count.offers !== 1 ? 's' : ''}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(request.createdAt)}
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
