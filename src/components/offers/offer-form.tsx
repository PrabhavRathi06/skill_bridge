'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { submitOffer } from '@/actions/offers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function OfferForm({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitOffer(formData)
      if (result.success) {
        toast.success('Offer submitted successfully!')
      } else {
        toast.error(result.error ?? 'Failed to submit offer.')
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="requestId" value={requestId} />
      <div className="space-y-2">
        <Label htmlFor="amount">Your offer amount (INR)</Label>
        <Input id="amount" name="amount" type="number" placeholder="e.g. 750" min="1" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="estimatedTime">Estimated completion time</Label>
        <Input id="estimatedTime" name="estimatedTime" placeholder="e.g. 2-3 hours, 1 day" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message to requester</Label>
        <Textarea id="message" name="message" placeholder="Describe your experience and why you are the right person for this job..." rows={4} required />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit Offer'}
      </Button>
    </form>
  )
}
