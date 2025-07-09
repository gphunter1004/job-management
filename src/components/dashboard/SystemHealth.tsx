import { useAppSelector } from '@/store'
import { Activity, AlertCircle, CheckCircle, Clock, Cpu, Database, Wifi } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

const SystemHealth = () => {
  const { connectedRobots, robotHealth } = useAppSelector(state => state.robots)
  const { metrics } = useAppSelector(state => state.dashboard)
  const { isConnected } = useAppSelector(state => state.ui) || { isConnected: true }

  // Calculate system health metrics
  const onlineRobots = connectedRobots.filter(serial => 
    robotHealth[serial]?.isOnline
  ).length

  const robotsWithErrors = connectedRobots.filter(serial => 
    robotHealth[serial]?.hasErrors || (robotHealth[serial]?.errorCount || 0) > 0
  ).length

  const lowBatteryRobots = connectedRobots.filter(serial => 
    (robotHealth[serial]?.batteryCharge || 0) < 20
  ).length

  const averageBattery = connectedRobots.length > 0 
    ? Math.round(connectedRobots.reduce((sum, serial) => 
        sum + (robotHealth[serial]?.batteryCharge || 0), 0) / connectedRobots.length)
    : 0

  // Calculate uptime (mock calculation)
  const uptimeHours = Math.floor((metrics.systemUptime || Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60))
  const uptimeDays = Math.floor(uptimeHours / 24)

  // Determine overall system status
  const getSystemStatus = () => {
    if (robotsWithErrors > 0) return { status: 'warning', label: 'Issues Detected', color: 'warning' }
    if (connectedRobots.length === 0) return { status: 'info', label: 'No Robots', color: 'secondary' }
    if (onlineRobots === connectedRobots.length) return { status: 'healthy', label: 'Healthy', color: 'success' }
    return { status: 'degraded', label: 'Degraded', color: 'warning' }
  }

  const systemStatus = getSystemStatus()

  const healthMetrics = [
    {
      label: 'System Status',
      value: systemStatus.label,
      icon: systemStatus.status === 'healthy' ? CheckCircle : AlertCircle,
      status: systemStatus.status,
      color: systemStatus.color
    },
    {
      label: 'Connection',
      value: isConnected ? 'Connected' : 'Disconnected',
      icon: isConnected ? Wifi : AlertCircle,
      status: isConnected ? 'healthy' : 'error',
      color: isConnected ? 'success' : 'error'
    },
    {
      label: 'Fleet Status',
      value: `${onlineRobots}/${connectedRobots.length} Online`,
      icon: Activity,
      status: onlineRobots === connectedRobots.length ? 'healthy' : 'warning',
      color: onlineRobots === connectedRobots.length ? 'success' : 'warning'
    },
    {
      label: 'Average Battery',
      value: `${averageBattery}%`,
      icon: Activity,
      status: averageBattery > 50 ? 'healthy' : averageBattery > 20 ? 'warning' : 'error',
      color: averageBattery > 50 ? 'success' : averageBattery > 20 ? 'warning' : 'error'
    },
    {
      label: 'System Uptime',
      value: uptimeDays > 0 ? `${uptimeDays}d ${uptimeHours % 24}h` : `${uptimeHours}h`,
      icon: Clock,
      status: 'healthy',
      color: 'success'
    }
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">System Health</h3>
        <Badge variant={systemStatus.color as any}>
          {systemStatus.label}
        </Badge>
      </div>

      {/* Health Metrics */}
      <div className="space-y-4">
        {healthMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${
                  metric.status === 'healthy' ? 'text-success-600' : 
                  metric.status === 'warning' ? 'text-warning-600' : 
                  metric.status === 'error' ? 'text-error-600' : 'text-gray-600'
                }`} />
                <span className="text-sm text-gray-600">{metric.label}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{metric.value}</span>
            </div>
          )
        })}
      </div>

      {/* Alerts Section */}
      {(robotsWithErrors > 0 || lowBatteryRobots > 0) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Active Issues</h4>
          <div className="space-y-2">
            {robotsWithErrors > 0 && (
              <div className="flex items-center justify-between p-2 bg-error-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-error-600" />
                  <span className="text-sm text-error-800">Robot Errors</span>
                </div>
                <span className="text-sm font-medium text-error-900">{robotsWithErrors}</span>
              </div>
            )}
            
            {lowBatteryRobots > 0 && (
              <div className="flex items-center justify-between p-2 bg-warning-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-warning-600" />
                  <span className="text-sm text-warning-800">Low Battery</span>
                </div>
                <span className="text-sm font-medium text-warning-900">{lowBatteryRobots}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Resources */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">System Resources</h4>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <Cpu className="w-6 h-6 mx-auto text-primary-600 mb-2" />
            <div className="text-lg font-semibold text-gray-900">Normal</div>
            <div className="text-xs text-gray-500">CPU Load</div>
          </div>
          <div>
            <Database className="w-6 h-6 mx-auto text-success-600 mb-2" />
            <div className="text-lg font-semibold text-gray-900">Online</div>
            <div className="text-xs text-gray-500">Database</div>
          </div>
        </div>
      </div>

      {/* Last Update */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <span className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </Card>
  )
}

export default SystemHealth