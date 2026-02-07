'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Menu, 
  X, 
  Search, 
  User, 
  Sun, 
  Moon, 
  Monitor,
  LogOut,
  Settings,
  BookOpen,
  Map
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { SearchModal } from '@/components/search/SearchModal'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  
  const { theme, setTheme } = useTheme()
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Debug effect to log menu state changes
  useEffect(() => {
    console.log('Mobile menu state changed:', isMenuOpen)
  }, [isMenuOpen])

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    router.push('/')
  }

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'Destinations', href: '/destinations' },
    { name: 'Guides', href: '/guides' },
    { name: 'Gallery', href: '/gallery' },
  ]

  // Add Itinerary to navigation only for authenticated users
  const userNavigation = isAuthenticated
    ? [...navigation, { name: 'Itinerary', href: '/itinerary/dashboard' }]
    : navigation

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm' 
            : 'bg-white/95 backdrop-blur-sm'
        }`}
      >
        <nav className="container-max px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                {/* Logo Image - Replace with actual logo file */}
                <img
                  src="/images/logo1.svg"
                  alt="BagPackStories Logo"
                  className="h-20 w-auto md:h-10"
                  onError={(e) => {
                    // Fallback to icon if logo image fails to load
                    e.currentTarget.style.display = 'none';
                    const fallbackIcon = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallbackIcon) {
                      fallbackIcon.style.display = 'flex';
                    }
                  }}
                />
                {/* Fallback Icon */}
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
                  <Map className="w-5 h-5 md:w-6 md:h-6 text-gray-900" />
                </div>
                <span className="text-lg md:text-xl font-bold text-gray-900 font-poppins">
                  BagPackStories
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:text-primary-600 hover:bg-gray-100 transition-colors font-poppins"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 md:space-x-4 flex-shrink-0">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 md:p-2.5 rounded-md text-gray-900 hover:text-primary-600 hover:bg-gray-100 transition-colors touch-manipulation hidden sm:flex"
                aria-label="Search"
              >
                <Search className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              {/* Theme Toggle */}
              {/* <div className="relative hidden sm:block">
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="sr-only"
                  aria-label="Theme"
                >
                  {themeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const currentIndex = themeOptions.findIndex(opt => opt.value === theme)
                    const nextIndex = (currentIndex + 1) % themeOptions.length
                    setTheme(themeOptions[nextIndex].value as any)
                  }}
                  className="p-2 md:p-2.5 rounded-md text-gray-900 hover:text-primary-600 hover:bg-gray-100 transition-colors touch-manipulation"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' && <Sun className="w-5 h-5 md:w-6 md:h-6" />}
                  {theme === 'dark' && <Moon className="w-5 h-5 md:w-6 md:h-6" />}
                  {theme === 'system' && <Monitor className="w-5 h-5 md:w-6 md:h-6" />}
                </button>
              </div> */}

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 md:p-2.5 rounded-md text-gray-900 hover:text-primary-600 hover:bg-gray-100 transition-colors touch-manipulation"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 md:w-8 md:h-8 rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5 md:w-6 md:h-6" />
                    )}
                    <span className="hidden lg:block text-sm md:text-base font-poppins">{user?.name}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 md:w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-3 text-sm md:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-poppins"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 md:w-5 md:h-5 mr-3" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm md:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-poppins"
                      >
                        <LogOut className="w-4 h-4 md:w-5 md:h-5 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="primary" size="sm" className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base">
                      Login
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu button - Always visible on mobile */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Mobile menu button clicked, current state:', isMenuOpen)
                  setIsMenuOpen(!isMenuOpen)
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)'
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                className="lg:hidden p-3 md:p-3 rounded-md text-gray-900 hover:text-primary-600 hover:bg-gray-100 active:bg-gray-200 transition-all duration-150 touch-manipulation flex-shrink-0 mobile-menu-button border border-gray-300"
                aria-label="Open main menu"
                type="button"
              >
                <div className="relative">
                  {isMenuOpen ? <X className="w-7 h-7 md:w-8 md:h-8" /> : <Menu className="w-7 h-7 md:w-8 md:h-8" />}
                  {/* Visual indicator */}
                  <div className="absolute -inset-2 border-2 border-transparent rounded-md transition-colors duration-150 group-active:border-white/30"></div>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 relative z-40 bg-white/95 backdrop-blur-sm">
              {/* Mobile Actions */}
              <div className="pt-4 pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
                <div className="flex items-center justify-between">
                  {/* Mobile Search */}
                  <button
                    onClick={() => {
                      console.log('Search button clicked')
                      setIsSearchOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 p-3 rounded-md text-gray-900 hover:text-primary-600 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation font-poppins"
                  >
                    <Search className="w-5 h-5" />
                    <span>Search</span>
                  </button>
                </div>

                {/* Mobile Auth */}
                <div className="mt-4 flex flex-col space-y-2">
                  {isAuthenticated ? (
                    <div className="flex items-center space-x-2 p-3 rounded-md text-gray-900 hover:text-primary-600 hover:bg-gray-100 transition-colors font-poppins">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                      <span>{user?.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Link href="/login" onClick={() => {
                        console.log('Login link clicked')
                        setIsMenuOpen(false)
                      }}>
                        <Button variant="primary" className="w-full">
                          Login
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-3 rounded-md text-base md:text-lg font-medium text-gray-900 hover:text-primary-600 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation font-poppins"
                    onClick={() => {
                      console.log(`Navigation link clicked: ${item.name}`)
                      setIsMenuOpen(false)
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  )
}
