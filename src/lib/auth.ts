import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { loginSchema } from './validation/auth'
import { authConfig } from './auth.config'

// This file is strictly for the Node.js environment. It imports the Edge-compatible 
// authConfig and layers on the Node-only dependencies (Prisma, bcrypt).
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // PrismaAdapter syncs NextAuth with our database, automatically handling 
  // User/Session/Account creation if we were to add OAuth providers like Google or GitHub.
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // This is the actual authorization logic. It runs securely on the server (Node runtime),
      // meaning our database queries and bcrypt hashing are never exposed to the client or edge.
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (!user || !user.passwordHash) return null

        // We use bcrypt for password hashing as it's an industry standard for securing passwords,
        // mitigating timing and brute-force attacks via adaptive hashing (salt + cost factor).
        const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!isValid) return null

        // Return the subset of user data we want serialized into the JWT (via auth.config callbacks)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.profileImage,
          role: user.role,
        }
      },
    }),
  ],
})
