import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-6xl font-bold text-gray-900">404</h1>
      <h2 className="mb-4 text-xl font-semibold text-gray-700">Page not found</h2>
      <p className="mb-8 max-w-md text-gray-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">Return home</Link>
      </Button>
    </div>
  )
}
