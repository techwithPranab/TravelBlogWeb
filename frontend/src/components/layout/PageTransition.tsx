'use client'

import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { ClientMotion } from '@/components/ui/ClientMotion'

interface PageTransitionProps {
  children: ReactNode
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <>{children}</>
  }

  return (
    <ClientMotion
      key={pathname}
      className="w-full"
    >
      {children}
    </ClientMotion>
  )
}
