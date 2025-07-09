import { useState, ReactNode } from 'react'
import { Menu, X, Bell, Search, User, Settings, LogOut } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store'
import { logout } from '@/store/slices/authSlice'
import { Link, useLocation } from 'react-router-dom'

import Sidebar from './Sidebar'
import Header from './Header'
import { useWebSocket } from '@/hooks/useWebSocket'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAppSelector(state => state.auth)
  const { isConnected } = useWebSocket()
  const dispatch = useAppDispatch()
  const location = useLocation()

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Connection status indicator */}
              {!isConnected && (
                <div className="mb-4 bg-warning-50 border border-warning-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Bell className="h-5 w-5 text-warning-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-warning-700">
                        Real-time connection lost. Some features may not work properly.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Main content */}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout