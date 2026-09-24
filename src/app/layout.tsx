import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'SkillBridge — Connect Skills with Needs',
  description:
    'SkillBridge connects people who need local and short-term services with skilled providers. Find tutors, technicians, designers, and more in your city.',
  keywords: ['local services', 'freelance', 'skills', 'hire', 'India'],
  authors: [{ name: 'Prabhav Rathi' }],
  creator: 'Prabhav Rathi',
  openGraph: {
    title: 'SkillBridge — Connect Skills with Needs',
    description: 'Find skilled service providers in your city.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
