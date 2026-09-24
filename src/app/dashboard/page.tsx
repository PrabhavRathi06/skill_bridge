import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { PlusCircle, FileText, BriefcaseBusiness, Star, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatRelativeTime, getStatusColor } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard - SkillBridge' }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const [myRequests, myOffers, unreadNotifications] = await Promise.all([
    prisma.serviceRequest.findMany({
      where: { requesterId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { _count: { select: { offers: true } } },
    }),
    prisma.offer.findMany({
      where: { providerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { request: { select: { id: true, title: true, status: true } } },
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ])

  const stats = {
    totalRequests: await prisma.serviceRequest.count({ where: { requesterId: userId } }),
    activeRequests: await prisma.serviceRequest.count({
      where: { requesterId: userId, status: { in: ['OPEN', 'OFFERS_RECEIVED', 'PROVIDER_SELECTED', 'IN_PROGRESS'] } },
    }),
    totalOffers: await prisma.offer.count({ where: { providerId: userId } }),
    acceptedOffers: await prisma.offer.count({ where: { providerId: userId, status: 'ACCEPTED' } }),
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-500">Welcome back, {session.user.name}</p>
        </div>
        <Button asChild>
          <Link href="/requests/new" className="gap-2">
            <PlusCircle className="h-4 w-4" /> Post Request
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'My Requests', value: stats.totalRequests, icon: FileText, href: '/dashboard/requests' },
          { label: 'Active Requests', value: stats.activeRequests, icon: FileText, href: '/dashboard/requests' },
          { label: 'Offers Submitted', value: stats.totalOffers, icon: BriefcaseBusiness, href: '/dashboard/offers' },
          { label: 'Offers Accepted', value: stats.acceptedOffers, icon: Star, href: '/dashboard/offers' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <stat.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* My Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">My Requests</CardTitle>
            <Link href="/dashboard/requests" className="text-xs text-blue-600 hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {myRequests.length === 0 ? (
              <div className="py-6 text-center">
                <p className="mb-3 text-sm text-gray-500">No requests yet.</p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/requests/new">Post your first request</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => (
                  <Link key={req.id} href={`/requests/${req.id}`} className="block">
                    <div className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{req.title}</p>
                        <p className="text-xs text-gray-400">
                          {req._count.offers} offer{req._count.offers !== 1 ? 's' : ''} &bull; {formatRelativeTime(req.createdAt)}
                        </p>
                      </div>
                      <span className={`ml-3 rounded-md px-2 py-0.5 text-xs font-medium ${getStatusColor(req.status)}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Offers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">My Offers</CardTitle>
            <Link href="/dashboard/offers" className="text-xs text-blue-600 hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {myOffers.length === 0 ? (
              <div className="py-6 text-center">
                <p className="mb-3 text-sm text-gray-500">No offers submitted yet.</p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/requests">Browse open requests</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {myOffers.map((offer) => (
                  <Link key={offer.id} href={`/requests/${offer.request.id}`} className="block">
                    <div className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{offer.request.title}</p>
                        <p className="text-xs text-gray-400">
                          {formatCurrency(offer.amount)} &bull; {formatRelativeTime(offer.createdAt)}
                        </p>
                      </div>
                      <span className={`ml-3 rounded-md px-2 py-0.5 text-xs font-medium ${getStatusColor(offer.status)}`}>
                        {offer.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
