import { useState } from 'react'
import { Menu, Bell, Search, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store'
import { logout } from '@/store/slices/authSlice'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

import Button from '@/components/ui/Button'
import { useWebSocket } from '@/hooks/useWebSocket'

interface HeaderProps {
  onMenuClick: () => void
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const { connectedRobots, robotHealth } = useAppSelector(state => state.robots)
  const { isConnected } = useWebSocket()
  
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
  }

  // Calculate notification counts
  const robotsWithErrors = connectedRobots.filter(serial => 
    robotHealth[serial]?.hasErrors || (robotHealth[serial]?.errorCount || 0) > 0
  ).length

  const lowBatteryRobots = connectedRobots.filter(serial => 
    (robotHealth[serial]?.batteryCharge || 0) < 20
  ).length

  const totalNotifications = robotsWithErrors + lowBatteryRobots

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
      {/* Mobile menu button */}
      <button
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex-1 px-4 flex justify-between">
        {/* Left side - Search */}
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            <label htmlFor="search-field" className="sr-only">
              Search
            </label>
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <Search className="h-5 w-5" />
              </div>
              <input
                id="search-field"
                className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent"
                placeholder="Search robots, orders, templates..."
                type="search"
              />
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={clsx(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-success-400' : 'bg-error-400'
            )} />
            <span className="text-sm text-gray-600 hidden sm:block">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-6 w-6" />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-error-400 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {totalNotifications > 9 ? '9+' : totalNotifications}
                  </span>
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                  </div>
                  
                  {totalNotifications === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No new notifications
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {robotsWithErrors > 0 && (
                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-error-400 rounded-full"></div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                {robotsWithErrors} robot{robotsWithErrors !== 1 ? 's' : ''} with errors
                              </p>
                              <p className="text-xs text-gray-500">Click to view details</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {lowBatteryRobots > 0 && (
                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-warning-400 rounded-full"></div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                {lowBatteryRobots} robot{lowBatteryRobots !== 1 ? 's' : ''} with low battery
                              </p>
                              <p className="text-xs text-gray-500">Battery level below 20%</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 px-4 py-2">
                    <Link 
                      to="/notifications" 
                      className="text-sm text-primary-600 hover:text-primary-700"
                      onClick={() => setShowNotifications(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  {user?.avatar ? (
                    <img 
                      className="h-8 w-8 rounded-full" 
                      src={user.avatar} 
                      alt={user.firstName || user.username} 
                    />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.firstName || user?.username}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="mr-3 h-4 w-4" />
                    Your Profile
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                  </Link>
                  
                  <div className="border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        handleLogout()
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside handler for dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false)
            setShowNotifications(false)
          }}
        />
      )}
    </div>
  )
}

export default Header