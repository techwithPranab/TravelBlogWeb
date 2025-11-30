'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  FileText, 
  MapPin, 
  BookOpen, 
  Users, 
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  Camera,
  MessageSquare,
  UserCheck,
  Mail,
  Folder
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AdminLayoutProps {
  readonly children: React.ReactNode
}

const sidebarItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    badge: null
  },
  {
    name: 'Blog Posts',
    href: '/admin/posts',
    icon: FileText,
    badge: 'Posts'
  },
  {
    name: 'Photos',
    href: '/admin/photos',
    icon: Camera,
    badge: null
  },
  {
    name: 'Destinations',
    href: '/admin/destinations',
    icon: MapPin,
    badge: null
  },
  {
    name: 'Guides',
    href: '/admin/guides',
    icon: BookOpen,
    badge: null
  },
  {
    name: 'Resources',
    href: '/admin/resources',
    icon: Folder,
    badge: null
  },
  {
    name: 'Partners',
    href: '/admin/partners',
    icon: UserCheck,
    badge: null
  },
  {
    name: 'Contact Messages',
    href: '/admin/contacts',
    icon: MessageSquare,
    badge: null
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    badge: null
  },
  {
    name: 'Email Templates',
    href: '/admin/email-templates',
    icon: Mail,
    badge: null
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    badge: null
  }
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip authentication check for login page
    if (pathname === '/admin/login') {
      return
    }

    // Check authentication and admin role
    const token = localStorage.getItem('adminToken')
    const userData = localStorage.getItem('adminUser')

    if (!token || !userData) {
      router.push('/admin/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'admin') {
        router.push('/admin/login')
        return
      }
      setUser(parsedUser)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/admin/login')
    }
  }, [router, pathname])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    router.push('/admin/login')
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <button 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
      
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Admin User Info */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-400">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 transition-colors ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                }`} />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-0">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900 capitalize">
                {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Admin Panel</span>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
