'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, CheckCircle2, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { createRequest } from '@/actions/requests'
import { extractRequestFromText } from '@/lib/ai/request-extractor'
import { improveRequestDescription } from '@/lib/ai/request-improver'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { REQUEST_CATEGORIES, URGENCY_OPTIONS } from '@/lib/validation/request'
import type { AIExtractedRequest } from '@/types'

export function NewRequestForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isExtracting, setIsExtracting] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [naturalInput, setNaturalInput] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState<AIExtractedRequest | null>(null)
  const [descriptionImprovement, setDescriptionImprovement] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget: '',
    urgency: 'NORMAL',
  })

  async function handleAIExtract() {
    if (!naturalInput.trim()) {
      toast.error('Please enter a description first.')
      return
    }
    setIsExtracting(true)
    try {
      const result = await extractRequestFromText(naturalInput)
      if (result.success) {
        setAiSuggestion(result.data)
        setForm({
          title: result.data.title,
          description: result.data.description,
          category: result.data.category,
          location: result.data.location,
          budget: String(result.data.budget),
          urgency: result.data.urgency,
        })
        toast.success('AI extracted the request details. Please review and edit.')
      } else {
        toast.error(result.error)
      }
    } finally {
      setIsExtracting(false)
    }
  }

  async function handleImproveDescription() {
    if (!form.description.trim()) {
      toast.error('Please enter a description first.')
      return
    }
    setIsImproving(true)
    try {
      const result = await improveRequestDescription(form.description)
      if (result.success) {
        setDescriptionImprovement(result.improved)
        toast.success('AI suggested an improvement. Accept or dismiss below.')
      } else {
        toast.error(result.error)
      }
    } finally {
      setIsImproving(false)
    }
  }

  function acceptImprovement() {
    if (descriptionImprovement) {
      setForm((f) => ({ ...f, description: descriptionImprovement }))
      setDescriptionImprovement(null)
      toast.success('Improvement applied.')
    }
  }

  function handleSubmit(formData: FormData) {
    // Merge controlled state into formData
    formData.set('category', form.category)
    formData.set('urgency', form.urgency)
    formData.set('description', form.description)

    startTransition(async () => {
      const result = await createRequest(formData)
      if (result.success && result.data) {
        toast.success('Request posted successfully!')
        router.push(`/requests/${result.data.id}`)
      } else {
        toast.error(result.error ?? 'Failed to create request.')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* AI Natural Language Input */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">AI Request Assistant</span>
          </div>
          <p className="mb-3 text-xs text-blue-700">
            Describe your need in plain language. AI will extract and fill the form for you.
          </p>
          <Textarea
            placeholder='e.g. "I need someone to fix my laptop screen in Pune today. Budget around 800 rupees."'
            value={naturalInput}
            onChange={(e) => setNaturalInput(e.target.value)}
            rows={3}
            className="bg-white text-sm"
          />
          <Button
            type="button"
            size="sm"
            className="mt-3 gap-2"
            onClick={handleAIExtract}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Extracting...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Extract with AI</>
            )}
          </Button>
          {aiSuggestion && (
            <p className="mt-2 flex items-center gap-1 text-xs text-green-700">
              <CheckCircle2 className="h-3 w-3" /> AI filled the form. Review and edit below.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Manual Form */}
      <form action={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g. Class 10 Math Tutor in Pune"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Description</Label>
            <button
              type="button"
              onClick={handleImproveDescription}
              disabled={isImproving}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {isImproving ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Improving...</>
              ) : (
                <><Edit2 className="h-3 w-3" /> Improve with AI</>
              )}
            </button>
          </div>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe the service you need in detail..."
            rows={4}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
          />
          {descriptionImprovement && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
              <p className="mb-2 text-xs font-semibold text-blue-900">AI Suggestion:</p>
              <p className="mb-3 text-sm text-gray-700">{descriptionImprovement}</p>
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={acceptImprovement}>Accept</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setDescriptionImprovement(null)}>Dismiss</Button>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              name="category"
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g. Pune, Koregaon Park"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget (INR)</Label>
            <Input
              id="budget"
              name="budget"
              type="number"
              placeholder="e.g. 800"
              min="1"
              value={form.budget}
              onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Urgency</Label>
            <Select
              name="urgency"
              value={form.urgency}
              onValueChange={(v) => setForm((f) => ({ ...f, urgency: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {URGENCY_OPTIONS.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Posting...' : 'Post Request'}
        </Button>
      </form>
    </div>
  )
}
