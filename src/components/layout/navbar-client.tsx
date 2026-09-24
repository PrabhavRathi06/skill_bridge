'use client'

import Link from 'next/link'
import { useState } from 'react'
import { LogOut, User, LayoutDashboard, PlusCircle, Bell } from 'lucide-react'
import { logoutUser } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'

interface NavbarClientProps {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function NavbarClient({ user }: NavbarClientProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm">
        <Link href="/requests/new" className="gap-1.5">
          <PlusCircle className="h-4 w-4" />
          Post Request
        </Link>
      </Button>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="User menu"
          aria-expanded={open}
        >
          {user.name ? getInitials(user.name) : 'U'}
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-md border bg-white py-1 shadow-lg">
              <div className="border-b px-4 py-3">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <nav className="py-1">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link
                  href="/notifications"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  <Bell className="h-4 w-4" /> Notifications
                </Link>
              </nav>
              <div className="border-t py-1">
                <form action={logoutUser}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
