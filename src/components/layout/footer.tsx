import Link from 'next/link'
import { Github, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
              <span className="text-xs font-bold text-white">SB</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">SkillBridge</p>
              <p className="text-xs text-gray-500">Connect Skills with Needs</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Built by{' '}
              <span className="font-medium text-gray-900">Prabhav Rathi</span>
            </p>
            <p className="mt-0.5 text-xs text-gray-400">House of Edtech — Fullstack Assignment 2026</p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/PrabhavRathi06"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
              aria-label="GitHub Profile"
            >
              <Github className="h-4 w-4" />
              GitHub
            </Link>
            <Link
              href="https://linkedin.com/in/prabhav-rathi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t pt-6 text-center">
          <p className="text-xs text-gray-400">
            &copy; 2026 SkillBridge. All rights reserved. Built with Next.js 16, Prisma, MongoDB &amp; Groq AI.
          </p>
        </div>
      </div>
    </footer>
  )
}
