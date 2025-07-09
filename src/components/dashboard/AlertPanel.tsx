import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store'
import { acknowledgeAlert, dismissAlert } from '@/store/slices/dashboardSlice'
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  X, 
  Eye,
  Battery,
  Wifi,
  Bot,
  Activity
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

const AlertPanel = () => {
  const dispatch = useAppDispatch()
  const { alerts } = useAppSelector(state => state.dashboard)
  const { connectedRobots, robotHealth } = useAppSelector(state => state.robots)
  
  const [showAll, setShowAll] = useState(false)

  // Generate real-time alerts from robot data
  const generateRealTimeAlerts = () => {
    const realTimeAlerts = []
    const now = new Date().toISOString()

    // Check for robots with errors
    connectedRobots.forEach(serial => {
      const health = robotHealth[serial]
      if (health?.hasErrors && health.errorCount > 0) {
        realTimeAlerts.push({
          id: `error_${serial}`,
          type: 'error' as const,
          title: 'Robot Error Detected',
          message: `Robot ${serial} has ${health.errorCount} error${health.errorCount !== 1 ? 's' : ''}`,
          timestamp: now,
          acknowledged: false,
          robotId: serial,
          icon: AlertCircle
        })
      }

      // Check for low battery
      if (health?.batteryCharge && health.batteryCharge < 20) {
        realTimeAlerts.push({
          id: `battery_${serial}`,
          type: 'warning' as const,
          title: 'Low Battery Alert',
          message: `Robot ${serial} battery level is ${health.batteryCharge.toFixed(0)}%`,
          timestamp: now,
          acknowledged: false,
          robotId: serial,
          icon: Battery
        })
      }

      // Check for offline robots
      if (!health?.isOnline) {
        realTimeAlerts.push({
          id: `offline_${serial}`,
          type: 'warning' as const,
          title: 'Robot Offline',
          message: `Robot ${serial} has lost connection`,
          timestamp: now,
          acknowledged: false,
          robotId: serial,
          icon: Wifi
        })
      }
    })

    return realTimeAlerts
  }

  // Combine stored alerts with real-time alerts
  const allAlerts = [...alerts, ...generateRealTimeAlerts()]
  const recentAlerts = showAll ? allAlerts : allAlerts.slice(0, 5)
  const unacknowledgedCount = allAlerts.filter(alert => !alert.acknowledged).length

  const handleAcknowledge = (alertId: string) => {
    dispatch(acknowledgeAlert(alertId))
  }

  const handleDismiss = (alertId: string) => {
    dispatch(dismissAlert(alertId))
  }

  const getAlertIcon = (alert: any) => {
    if (alert.icon) return alert.icon
    
    switch (alert.type) {
      case 'error':
      case 'critical':
        return AlertCircle
      case 'warning':
        return Clock
      case 'info':
        return CheckCircle
      default:
        return AlertCircle
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
      case 'critical':
        return 'text-error-600'
      case 'warning':
        return 'text-warning-600'
      case 'info':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'error':
      case 'critical':
        return 'error'
      case 'warning':
        return 'warning'
      case 'info':
        return 'info'
      default:
        return 'secondary'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
          {unacknowledgedCount > 0 && (
            <Badge variant="error" size="sm">
              {unacknowledgedCount}
            </Badge>
          )}
        </div>
        
        {allAlerts.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All (${allAlerts.length})`}
          </Button>
        )}
      </div>

      {recentAlerts.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="mx-auto h-12 w-12 text-success-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h4>
          <p className="text-sm text-gray-500">
            No alerts at this time. Your system is running smoothly.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentAlerts.map((alert) => {
            const Icon = getAlertIcon(alert)
            const isRecent = new Date().getTime() - new Date(alert.timestamp).getTime() < 5 * 60 * 1000 // 5 minutes
            
            return (
              <div
                key={alert.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                  alert.acknowledged 
                    ? 'bg-gray-50 border-gray-200 opacity-75' 
                    : isRecent
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className={`w-4 h-4 ${getAlertColor(alert.type)}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                        <span>{alert.title}</span>
                        {!alert.acknowledged && (
                          <Badge variant={getBadgeVariant(alert.type) as any} size="sm">
                            {alert.type}
                          </Badge>
                        )}
                        {isRecent && (
                          <Badge variant="info" size="sm">
                            New
                          </Badge>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>
                          {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                        </span>
                        {alert.robotId && (
                          <span className="flex items-center space-x-1">
                            <Bot className="w-3 h-3" />
                            <span>{alert.robotId}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center space-x-1 ml-2">
                      {!alert.acknowledged && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                          title="Acknowledge"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismiss(alert.id)}
                        title="Dismiss"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Alert Summary */}
      {allAlerts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              {allAlerts.filter(a => a.type === 'error' || a.type === 'critical').length} errors,{' '}
              {allAlerts.filter(a => a.type === 'warning').length} warnings
            </span>
            <span>
              {unacknowledgedCount} unacknowledged
            </span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {unacknowledgedCount > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                allAlerts
                  .filter(alert => !alert.acknowledged)
                  .forEach(alert => handleAcknowledge(alert.id))
              }}
            >
              Acknowledge All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                allAlerts.forEach(alert => handleDismiss(alert.id))
              }}
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* System Status Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Activity className={`w-3 h-3 ${
            unacknowledgedCount === 0 ? 'text-success-500' : 'text-warning-500'
          }`} />
          <span>
            Alert system {unacknowledgedCount === 0 ? 'healthy' : 'monitoring issues'}
          </span>
        </div>
      </div>
    </Card>
  )
}

export default AlertPanel