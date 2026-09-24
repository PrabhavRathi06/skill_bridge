import Link from 'next/link'
import { ArrowRight, Zap, Shield, Star, Users, MapPin, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const CATEGORIES = [
  { name: 'Education', icon: '📚', count: '240+' },
  { name: 'Computer & IT', icon: '💻', count: '180+' },
  { name: 'Home Repair', icon: '🔧', count: '320+' },
  { name: 'Design', icon: '🎨', count: '150+' },
  { name: 'Electronics', icon: '⚡', count: '210+' },
  { name: 'Fitness', icon: '💪', count: '90+' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Describe your need',
    description:
      'Type naturally — our AI assistant extracts the details and builds a structured request for you.',
  },
  {
    step: '02',
    title: 'Receive offers',
    description:
      'Skilled providers in your area review your request and submit competitive offers.',
  },
  {
    step: '03',
    title: 'Choose and connect',
    description:
      'Review provider profiles, ratings, and match scores. Accept the best offer and get started.',
  },
  {
    step: '04',
    title: 'Rate the experience',
    description:
      'After the service is complete, leave a review to help the community make better decisions.',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
            AI-Powered Service Marketplace
          </Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Connect Skills with <span className="text-blue-600">Local Needs</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600">
            SkillBridge helps you find trusted local professionals for any task — from laptop repair
            to math tutoring. Describe what you need, and let our AI match you with the right
            provider.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2 text-base">
              <Link href="/requests/new">
                Post a Request <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link href="/requests">Browse Requests</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { label: 'Active Requests', value: '1,200+', icon: Briefcase },
            { label: 'Skilled Providers', value: '3,400+', icon: Users },
            { label: 'Cities Covered', value: '25+', icon: MapPin },
            { label: 'Avg. Rating', value: '4.8 / 5', icon: Star },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="mx-auto mb-2 h-6 w-6 text-blue-600" />
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">Popular Categories</h2>
            <p className="text-gray-500">Find help across a wide range of service categories</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/requests?category=${encodeURIComponent(cat.name)}`}
                className="group"
              >
                <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <span className="mb-3 text-3xl">{cat.icon}</span>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      {cat.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">{cat.count} requests</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">How SkillBridge Works</h2>
            <p className="text-gray-500">From need to service in four simple steps</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  {step.step}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">Why SkillBridge</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Zap,
                title: 'AI-Assisted Requests',
                description:
                  'Just describe your need in plain language. Our AI extracts and structures the details automatically.',
              },
              {
                icon: Shield,
                title: 'Verified & Secure',
                description:
                  'Every transaction is protected. Server-side authorization ensures your data stays safe.',
              },
              {
                icon: Star,
                title: 'Transparent Reviews',
                description:
                  'Read real reviews from real users. Make decisions based on verified ratings and feedback.',
              },
            ].map((feature) => (
              <Card key={feature.title} className="p-6">
                <feature.icon className="mb-4 h-8 w-8 text-blue-600" />
                <h3 className="mb-2 font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="mb-8 text-blue-100">
            Join thousands of people who use SkillBridge to get things done.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">Create Free Account</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              <Link href="/requests">Browse Requests</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
