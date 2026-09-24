'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { REQUEST_CATEGORIES, URGENCY_OPTIONS } from '@/lib/validation/request'

export function RequestFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  function clearFilters() {
    router.push(pathname)
  }

  const hasFilters = searchParams.size > 0

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Keyword..."
              className="pl-8 text-sm"
              defaultValue={searchParams.get('q') ?? ''}
              onChange={(e) => updateFilter('q', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Category</Label>
          <Select
            defaultValue={searchParams.get('category') ?? 'all'}
            onValueChange={(v) => updateFilter('category', v)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {REQUEST_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Location</Label>
          <Input
            placeholder="City..."
            className="text-sm"
            defaultValue={searchParams.get('location') ?? ''}
            onChange={(e) => updateFilter('location', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Urgency</Label>
          <Select
            defaultValue={searchParams.get('urgency') ?? 'all'}
            onValueChange={(v) => updateFilter('urgency', v)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Any urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any urgency</SelectItem>
              {URGENCY_OPTIONS.map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Sort by</Label>
          <Select
            defaultValue={searchParams.get('sort') ?? 'newest'}
            onValueChange={(v) => updateFilter('sort', v)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="budget_desc">Budget: High to Low</SelectItem>
              <SelectItem value="budget_asc">Budget: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
