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
  Zap
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { RobotState, RobotHealth } from '@/types/robot'

interface RobotCardProps {
  serialNumber: string
  state?: RobotState
  health?: RobotHealth
  onClick?: () => void
  className?: string
}

const RobotCard = ({ serialNumber, state, health, onClick, className }: RobotCardProps) => {
  const isOnline = health?.isOnline || false
  const batteryLevel = health?.batteryCharge || 0
  const hasErrors = health?.hasErrors || false
  const isDriving = health?.isDriving || false
  const isPaused = health?.isPaused || false
  const isCharging = health?.isCharging || false

  const getBatteryIcon = () => {
    if (isCharging) return <Zap className="w-4 h-4" />
    return <Battery className="w-4 h-4" />
  }

  const getBatteryColor = () => {
    if (isCharging) return 'text-primary-600'
    if (batteryLevel > 50) return 'text-success-600'
    if (batteryLevel > 20) return 'text-warning-600'
    return 'text-error-600'
  }

  const getStatusBadge = () => {
    if (!isOnline) return <Badge variant="error">Offline</Badge>
    if (hasErrors) return <Badge variant="error">Error</Badge>
    if (isPaused) return <Badge variant="warning">Paused</Badge>
    if (isDriving) return <Badge variant="success">Driving</Badge>
    return <Badge variant="success">Online</Badge>
  }

  const lastUpdate = health?.lastUpdate ? new Date(health.lastUpdate) : new Date()

  return (
    <Card 
      className={clsx('p-6 hover:shadow-lg transition-all duration-200', className)}
      hover
      onClick={onClick}
    >
      <Link to={`/robots/${serialNumber}`} className="block">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={clsx(
              'flex items-center justify-center w-10 h-10 rounded-lg',
              isOnline ? 'bg-success-100' : 'bg-gray-100'
            )}>
              <Bot className={clsx(
                'w-6 h-6',
                isOnline ? 'text-success-600' : 'text-gray-400'
              )} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{serialNumber}</h3>
              <p className="text-sm text-gray-500">
                {state?.manufacturer || 'Unknown'}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2 mb-3">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-success-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-gray-400" />
          )}
          <span className={clsx(
            'text-sm font-medium',
            isOnline ? 'text-success-600' : 'text-gray-400'
          )}>
            {isOnline ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Battery Level */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={getBatteryColor()}>
              {getBatteryIcon()}
            </div>
            <span className="text-sm font-medium text-gray-700">Battery</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-20 bg-gray-200 rounded-full h-2">
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
            <span className="text-sm font-semibold text-gray-900">
              {batteryLevel.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Current Activity */}
        {state && (
          <div className="space-y-2 mb-4">
            {state.orderId && (
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-700">
                  Order: <span className="font-medium">{state.orderId}</span>
                </span>
              </div>
            )}
            
            {state.agvPosition?.positionInitialized && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  Position: ({state.agvPosition.x.toFixed(1)}, {state.agvPosition.y.toFixed(1)})
                </span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                Mode: <span className="font-medium">{state.operatingMode}</span>
              </span>
            </div>
          </div>
        )}

        {/* Alerts */}
        {hasErrors && (
          <div className="flex items-center space-x-2 p-3 bg-error-50 rounded-lg mb-4">
            <AlertCircle className="w-4 h-4 text-error-600" />
            <span className="text-sm text-error-700">
              {health?.errorCount} error{(health?.errorCount || 0) !== 1 ? 's' : ''} detected
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span>
            Last update: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
          </span>
          <span>
            Version: {state?.version || 'Unknown'}
          </span>
        </div>
      </Link>
    </Card>
  )
}

export default RobotCard