'use server'

import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validation/auth'
import { signIn, signOut } from '@/lib/auth'
import { AuthError } from 'next-auth'
import bcrypt from 'bcryptjs'
import type { ActionResult } from '@/types'

export async function registerUser(
  formData: FormData
): Promise<ActionResult<{ email: string }>> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    location: formData.get('location'),
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? 'Validation failed',
    }
  }

  const { name, email, password, location } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: { name, email, passwordHash, location },
  })

  return { success: true, data: { email } }
}


export async function loginUser(formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirectTo: '/dashboard',
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid credentials.' }
        default:
          return { success: false, error: 'Something went wrong.' }
      }
    }
    throw error
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: '/' })
}
