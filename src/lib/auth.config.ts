import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { loginSchema } from './validation/auth'
import type { NextAuthConfig } from 'next-auth'

// We separate auth config from auth initialization because Next.js middleware 
// runs on the Edge runtime, which doesn't support certain Node.js APIs (like bcrypt or Prisma).
// This file contains only the Edge-compatible configuration.
export const authConfig = {
  // We use JWT here to avoid DB lookups on edge for every authenticated request,
  // making our middleware lightning fast and reducing database load.
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // We will validate password in auth.ts which runs in Node.
        // This is just a placeholder type to satisfy the NextAuthConfig shape in this Edge-only file.
        // The actual implementation lives in auth.ts.
        return null
      },
    }),
  ],
  callbacks: {
    // We attach the user's ID and role to the JWT token so it's available 
    // across the app without needing to query the database again.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
      }
      return token
    },
    // The session callback maps the properties from the JWT token back onto the session object
    // exposed to the client-side/server-side Next.js components.
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
} satisfies NextAuthConfig
