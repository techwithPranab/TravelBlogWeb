'use client'

import { usePathname } from 'next/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Skip template for admin routes
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>
  }

  // For now, just return children without page transitions
  // TODO: Re-enable page transitions once Framer Motion SSR issues are resolved
  return <>{children}</>
}
