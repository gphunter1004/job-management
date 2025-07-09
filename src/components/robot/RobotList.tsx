import { Link } from 'react-router-dom'
import { 
  Bot, 
  Battery, 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  Activity,
  MapPin,
  Clock,
  Zap,
  Play,
  Pause,
  Square
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import type { RobotState, RobotHealth } from '@/types/robot'

interface RobotListItem {
  serialNumber: string
  state?: RobotState
  health?: RobotHealth
}

interface RobotListProps {
  robots: RobotListItem[]
  onRobotSelect?: (serialNumber: string) => void
  onSendCommand?: (serialNumber: string, command: string) => void
  className?: string
}

const RobotList = ({ robots, onRobotSelect, onSendCommand, className }: RobotListProps) => {
  const getBatteryColor = (batteryLevel: number, isCharging: boolean) => {
    if (isCharging) return 'text-primary-600'
    if (batteryLevel > 50) return 'text-success-600'
    if (batteryLevel > 20) return 'text-warning-600'
    return 'text-error-600'
  }

  const getStatusBadge = (health?: RobotHealth, state?: RobotState) => {
    if (!health?.isOnline) return <Badge variant="error">Offline</Badge>
    if (health?.hasErrors) return <Badge variant="error">Error</Badge>
    if (health?.isPaused) return <Badge variant="warning">Paused</Badge>
    if (health?.isDriving) return <Badge variant="success">Driving</Badge>
    if (state?.operatingMode === 'CHARGING') return <Badge variant="info">Charging</Badge>
    return <Badge variant="success">Online</Badge>
  }

  if (robots.length === 0) {
    return (
      <div className="text-center py-12">
        <Bot className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No robots found</h3>
        <p className="mt-1 text-sm text-gray-500">No robots match your current filters.</p>
      </div>
    )
  }

  return (
    <div className={clsx('bg-white shadow overflow-hidden sm:rounded-md', className)}>
      <ul className="divide-y divide-gray-200">
        {robots.map((robot) => {
          const { serialNumber, state, health } = robot
          const isOnline = health?.isOnline || false
          const batteryLevel = health?.batteryCharge || 0
          const hasErrors = health?.hasErrors || false
          const isDriving = health?.isDriving || false
          const isPaused = health?.isPaused || false
          const isCharging = health?.isCharging || false
          const lastUpdate = health?.lastUpdate ? new Date(health.lastUpdate) : new Date()

          return (
            <li key={serialNumber}>
              <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                {/* Robot Info */}
                <div className="flex items-center flex-1 min-w-0">
                  {/* Robot Icon */}
                  <div className={clsx(
                    'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center',
                    isOnline ? 'bg-success-100' : 'bg-gray-100'
                  )}>
                    <Bot className={clsx(
                      'h-6 w-6',
                      isOnline ? 'text-success-600' : 'text-gray-400'
                    )} />
                  </div>

                  {/* Robot Details */}
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/robots/${serialNumber}`}
                        className="text-sm font-medium text-gray-900 truncate hover:text-primary-600"
                        onClick={() => onRobotSelect?.(serialNumber)}
                      >
                        {serialNumber}
                      </Link>
                      {getStatusBadge(health, state)}
                    </div>
                    
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      {/* Connection Status */}
                      <div className="flex items-center space-x-1">
                        {isOnline ? (
                          <Wifi className="h-4 w-4 text-success-600" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-gray-400" />
                        )}
                        <span>{state?.manufacturer || 'Unknown'}</span>
                      </div>

                      {/* Current Order */}
                      {state?.orderId && (
                        <div className="flex items-center space-x-1">
                          <Activity className="h-4 w-4" />
                          <span>Order: {state.orderId}</span>
                        </div>
                      )}

                      {/* Position */}
                      {state?.agvPosition?.positionInitialized && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>
                            ({state.agvPosition.x.toFixed(1)}, {state.agvPosition.y.toFixed(1)})
                          </span>
                        </div>
                      )}

                      {/* Last Update */}
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDistanceToNow(lastUpdate, { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Battery Level */}
                <div className="flex-shrink-0 ml-4 flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className={getBatteryColor(batteryLevel, isCharging)}>
                      {isCharging ? <Zap className="w-4 h-4" /> : <Battery className="w-4 h-4" />}
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={clsx(
                          'h-2 rounded-full transition-all duration-300',
                          {
                            'bg-success-500': batteryLevel > 50,
                            'bg-warning-500': batteryLevel > 20 && batteryLevel <= 50,
                            'bg-error-500': batteryLevel <= 20,
                          }
                        )}
                        style={{ width: `${Math.max(batteryLevel, 2)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">
                      {batteryLevel.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 ml-4 flex items-center space-x-2">
                  {hasErrors && (
                    <Button
                      variant="error"
                      size="sm"
                      leftIcon={<AlertCircle className="w-4 h-4" />}
                      onClick={() => onSendCommand?.(serialNumber, 'view_errors')}
                    >
                      {health?.errorCount} Error{(health?.errorCount || 0) !== 1 ? 's' : ''}
                    </Button>
                  )}

                  {isOnline && (
                    <div className="flex items-center space-x-1">
                      {isPaused ? (
                        <Button
                          variant="success"
                          size="sm"
                          leftIcon={<Play className="w-4 h-4" />}
                          onClick={() => onSendCommand?.(serialNumber, 'resume')}
                        >
                          Resume
                        </Button>
                      ) : isDriving ? (
                        <Button
                          variant="warning"
                          size="sm"
                          leftIcon={<Pause className="w-4 h-4" />}
                          onClick={() => onSendCommand?.(serialNumber, 'pause')}
                        >
                          Pause
                        </Button>
                      ) : (
                        <Button
                          variant="error"
                          size="sm"
                          leftIcon={<Square className="w-4 h-4" />}
                          onClick={() => onSendCommand?.(serialNumber, 'emergency_stop')}
                        >
                          E-Stop
                        </Button>
                      )}
                    </div>
                  )}

                  {/* View Details Button */}
                  <Link to={`/robots/${serialNumber}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default RobotList