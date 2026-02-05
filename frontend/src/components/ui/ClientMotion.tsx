'use client'

import { useEffect, useState, ElementType, ComponentProps } from 'react'

interface ClientMotionProps {
  as?: ElementType
  children: React.ReactNode
  className?: string
  key?: string | number
  onClick?: (e: React.MouseEvent) => void
  [key: string]: any
}

export function ClientMotion({
  as: Component = 'div',
  children,
  ...props
}: ClientMotionProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Return a regular div on the server
    const { as, ...divProps } = props as any
    return <div {...divProps}>{children}</div>
  }

  // Return the motion component on the client
  return <Component {...props}>{children}</Component>
}

// Convenience components removed - use ClientMotion directly
