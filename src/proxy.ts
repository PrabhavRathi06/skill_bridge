import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

// Initialize NextAuth with our specific config. 
// This acts as the edge-compatible gateway for authentication in middleware.
const { auth } = NextAuth(authConfig)

// Define our secure routes. Any route starting with these prefixes will require an active session.
const PROTECTED_PATHS = ['/dashboard', '/requests/new', '/messages', '/profile']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path))

  // If the user tries to access a protected area without being logged in,
  // we seamlessly redirect them to the login page and remember where they were trying to go.
  if (isProtected && !req.auth) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Conversely, if a logged-in user tries to visit the login or register pages,
  // we bounce them over to their dashboard to prevent confusion.
  if ((pathname === '/login' || pathname === '/register') && req.auth) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

// Configure the Next.js middleware matcher.
// This regex specifically excludes static files, API routes, and Next.js internals
// so we don't waste compute cycles running auth checks on images or scripts.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
