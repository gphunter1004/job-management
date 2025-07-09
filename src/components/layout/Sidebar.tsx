import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Bot, 
  ClipboardList, 
  FileText, 
  Settings,
  Activity,
  Zap,
  Database,
  MapPin, // MapPin 아이콘 추가
  Target // Target 아이콘 추가
} from 'lucide-react' 
import { useAppSelector } from '@/store'
import clsx from 'clsx'

const navigation = [
  // { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }, // Dashboard 숨김
  { name: 'Robots', href: '/robots', icon: Bot },
  { name: 'Orders', href: '/orders', icon: ClipboardList },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Actions', href: '/actions', icon: Zap },
  { name: 'Nodes', href: '/nodes', icon: MapPin }, // Nodes 메뉴 추가
  { name: 'Edges', href: '/edges', icon: Target }, // Edges 메뉴 추가
]

const secondaryNavigation = [
  // { name: 'System Status', href: '/system', icon: Activity }, 
  // { name: 'Transport', href: '/transport', icon: Zap }, 
  // { name: 'Database', href: '/database', icon: Database }, 
  // { name: 'Settings', href: '/settings', icon: Settings }, 
]

const Sidebar = () => {
  const location = useLocation()
  const { connectedRobots, robotHealth } = useAppSelector(state => state.robots)
  
  // Calculate metrics for badges
  const onlineRobots = connectedRobots.filter(serial => 
    robotHealth[serial]?.isOnline
  ).length
  
  const robotsWithErrors = connectedRobots.filter(serial => 
    robotHealth[serial]?.hasErrors || (robotHealth[serial]?.errorCount || 0) > 0
  ).length

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Bot className="h-8 w-8 text-primary-600" />
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900">Robot Dashboard</h1>
            <p className="text-xs text-gray-500">MQTT Bridge Control</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto">
        {/* Main Navigation */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Main
          </h3>
          <div className="mt-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                    {
                      'bg-primary-100 text-primary-700': isActive,
                      'text-gray-700 hover:bg-gray-100 hover:text-gray-900': !isActive,
                    }
                  )}
                >
                  <item.icon
                    className={clsx(
                      'flex-shrink-0 mr-3 h-5 w-5',
                      {
                        'text-primary-500': isActive,
                        'text-gray-400 group-hover:text-gray-500': !isActive,
                      }
                    )}
                  />
                  <span className="flex-1">{item.name}</span>
                  
                  {/* Show badges for specific items */}
                  {item.name === 'Robots' && connectedRobots.length > 0 && (
                    <div className="flex items-center space-x-1">
                      {onlineRobots > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                          {onlineRobots}
                        </span>
                      )}
                      {robotsWithErrors > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-800">
                          !{robotsWithErrors}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Secondary Navigation */}
        {/* secondaryNavigation 배열이 비어있으므로 이 섹션은 렌더링되지 않습니다. */}
        {secondaryNavigation.length > 0 && (
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              System
            </h3>
            <div className="mt-3 space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = location.pathname === item.href || 
                  location.pathname.startsWith(item.href)
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                      {
                        'bg-primary-100 text-primary-700': isActive,
                        'text-gray-700 hover:bg-gray-100 hover:text-gray-900': !isActive,
                      }
                    )}
                  >
                    <item.icon
                      className={clsx(
                        'flex-shrink-0 mr-3 h-5 w-5',
                        {
                          'text-primary-500': isActive,
                          'text-gray-400 group-hover:text-gray-500': !isActive,
                        }
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className={clsx(
              'w-2 h-2 rounded-full',
              connectedRobots.length > 0 ? 'bg-success-400' : 'bg-gray-400'
            )} />
            <span>
              {connectedRobots.length} robot{connectedRobots.length !== 1 ? 's' : ''} connected
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar