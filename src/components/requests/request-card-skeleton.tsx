import { Card, CardContent, CardFooter } from '@/components/ui/card'

export function RequestCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-14 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="mb-1 h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="mb-4 h-4 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="flex gap-3">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      </CardContent>
      <CardFooter className="border-t px-5 py-3">
        <div className="flex w-full items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      </CardFooter>
    </Card>
  )
}
