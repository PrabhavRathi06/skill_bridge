import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { NewRequestForm } from '@/components/requests/new-request-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Post a Request - SkillBridge',
  description: 'Post a service request and get offers from skilled providers.',
}

export default async function NewRequestPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Post a Service Request</h1>
        <p className="mt-1 text-gray-500">
          Describe what you need — our AI will help structure your request.
        </p>
      </div>
      <NewRequestForm />
    </div>
  )
}
