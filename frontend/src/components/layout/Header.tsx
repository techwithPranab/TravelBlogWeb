'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Menu, 
  X, 
  Search, 
  User, 
  ShoppingBag, 
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
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/Button'
import { SearchModal } from '@/components/search/SearchModal'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  
  const { theme, setTheme } = useTheme()
  const { user, logout, isAuthenticated } = useAuth()
  const { totalItems } = useCart()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
            ? 'bg-black/95 backdrop-blur-sm border-b border-gray-800 shadow-sm' 
            : 'bg-black/80 backdrop-blur-sm'
        }`}
      >
        <nav className="container-max px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Map className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">
                  TravelBlog
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-3 py-2 rounded-md text-sm font-medium text-white hover:text-primary-400 hover:bg-white/10 transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-md text-white hover:text-primary-400 hover:bg-white/10 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme Toggle */}
              <div className="relative">
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
                  className="p-2 rounded-md text-white hover:text-primary-400 hover:bg-white/10 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' && <Sun className="w-5 h-5" />}
                  {theme === 'dark' && <Moon className="w-5 h-5" />}
                  {theme === 'system' && <Monitor className="w-5 h-5" />}
                </button>
              </div>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 rounded-md text-white hover:text-primary-400 hover:bg-white/10 transition-colors"
                aria-label={`Cart (${totalItems} items)`}
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-md text-white hover:text-primary-400 hover:bg-white/10 transition-colors"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="hidden md:block text-sm">{user?.name}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="primary" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="primary" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-md text-white hover:text-primary-400 hover:bg-white/10 transition-colors"
                aria-label="Open main menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
              <div className="pt-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-primary-400 hover:bg-white/10 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
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
