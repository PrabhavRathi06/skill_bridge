import { Suspense } from 'react'
import Link from 'next/link'
import { Search, Filter, PlusCircle } from 'lucide-react'
import { getRequests } from '@/actions/requests'
import { Button } from '@/components/ui/button'
import { RequestCard } from '@/components/requests/request-card'
import { RequestFilters } from '@/components/requests/request-filters'
import { RequestCardSkeleton } from '@/components/requests/request-card-skeleton'
import { Pagination } from '@/components/shared/pagination'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Requests - SkillBridge',
  description: 'Browse service requests from people who need help near you.',
}

interface RequestsPageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

async function RequestsList({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const result = await getRequests(searchParams)

  if (result.data.length === 0) {
    return (
      <div className="py-20 text-center">
        <Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">No requests found</h3>
        <p className="mb-6 text-gray-500">Try adjusting your filters or be the first to post a request.</p>
        <Button asChild>
          <Link href="/requests/new">Post a Request</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {result.total} request{result.total !== 1 ? 's' : ''} found
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.data.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))}
      </div>
      {result.totalPages > 1 && (
        <div className="mt-8">
          <Pagination currentPage={result.page} totalPages={result.totalPages} />
        </div>
      )}
    </div>
  )
}

export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  const params = await searchParams

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Requests</h1>
          <p className="mt-1 text-gray-500">Find service requests in your area</p>
        </div>
        <Button asChild>
          <Link href="/requests/new" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Post Request
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <RequestFilters />
        </aside>
        <div className="lg:col-span-3">
          <Suspense fallback={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <RequestCardSkeleton key={i} />)}
            </div>
          }>
            <RequestsList searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
