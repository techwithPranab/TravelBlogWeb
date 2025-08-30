'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'

interface ConditionalLayoutProps {
  readonly children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Check if the current path is an admin route
  const isAdminRoute = pathname.startsWith('/admin')
  
  // If it's an admin route, render children without header/footer
  if (isAdminRoute) {
    return <>{children}</>
  }
  
  // For all other routes, render with header and footer
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </div>
  )
}
