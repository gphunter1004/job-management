import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Card from '@/components/ui/Card'

interface DashboardOverviewProps {
  totalRobots: number
  onlineRobots: number
  robotsWithErrors: number
  averageBatteryLevel: number
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  color?: 'success' | 'warning' | 'error' | 'neutral'
  className?: string
}

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeLabel, 
  color = 'neutral',
  className 
}: MetricCardProps) => {
  const getChangeIcon = () => {
    if (change === undefined || change === 0) return <Minus className="w-4 h-4" />
    return change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
  }

  const getChangeColor = () => {
    if (change === undefined || change === 0) return 'text-gray-500'
    return change > 0 ? 'text-success-600' : 'text-error-600'
  }

  const getValueColor = () => {
    switch (color) {
      case 'success': return 'text-success-600'
      case 'warning': return 'text-warning-600'
      case 'error': return 'text-error-600'
      default: return 'text-gray-900'
    }
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${getValueColor()}`}>{value}</p>
          
          {change !== undefined && changeLabel && (
            <div className={`flex items-center mt-2 text-sm ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="ml-1">
                {Math.abs(change)}% {changeLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

const DashboardOverview = ({ 
  totalRobots, 
  onlineRobots, 
  robotsWithErrors, 
  averageBatteryLevel 
}: DashboardOverviewProps) => {
  const offlineRobots = totalRobots - onlineRobots
  const onlinePercentage = totalRobots > 0 ? Math.round((onlineRobots / totalRobots) * 100) : 0
  const errorPercentage = totalRobots > 0 ? Math.round((robotsWithErrors / totalRobots) * 100) : 0

  // Mock trend data - in real app, this would come from props or API
  const trends = {
    onlineRobots: 5.2, // +5.2% from last week
    averageBattery: -2.1, // -2.1% from last week
    errorRate: -8.5, // -8.5% from last week (good trend)
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">System Overview</h2>
        <p className="text-sm text-gray-600">
          Real-time status of your robot fleet
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Fleet Size */}
        <MetricCard
          title="Total Robots"
          value={totalRobots}
          color="neutral"
        />

        {/* Online Robots */}
        <MetricCard
          title="Online Robots"
          value={`${onlineRobots} (${onlinePercentage}%)`}
          change={trends.onlineRobots}
          changeLabel="from last week"
          color={onlineRobots === totalRobots ? 'success' : 'warning'}
        />

        {/* Average Battery */}
        <MetricCard
          title="Avg. Battery Level"
          value={`${averageBatteryLevel}%`}
          change={trends.averageBattery}
          changeLabel="from last week"
          color={
            averageBatteryLevel > 70 ? 'success' 
            : averageBatteryLevel > 30 ? 'warning' 
            : 'error'
          }
        />

        {/* Error Rate */}
        <MetricCard
          title="Robots with Errors"
          value={`${robotsWithErrors} (${errorPercentage}%)`}
          change={trends.errorRate}
          changeLabel="from last week"
          color={robotsWithErrors === 0 ? 'success' : 'error'}
        />
      </div>

      {/* Quick Status Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Fleet Status */}
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              onlinePercentage > 90 ? 'text-success-600' 
              : onlinePercentage > 70 ? 'text-warning-600' 
              : 'text-error-600'
            }`}>
              {onlinePercentage}%
            </div>
            <div className="text-sm text-gray-500">Fleet Online</div>
          </div>

          {/* System Health */}
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              errorPercentage === 0 ? 'text-success-600'
              : errorPercentage < 10 ? 'text-warning-600'
              : 'text-error-600'
            }`}>
              {errorPercentage === 0 ? '✓' : `${errorPercentage}%`}
            </div>
            <div className="text-sm text-gray-500">
              {errorPercentage === 0 ? 'Healthy' : 'Error Rate'}
            </div>
          </div>

          {/* Power Status */}
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              averageBatteryLevel > 70 ? 'text-success-600'
              : averageBatteryLevel > 30 ? 'text-warning-600'
              : 'text-error-600'
            }`}>
              {averageBatteryLevel}%
            </div>
            <div className="text-sm text-gray-500">Avg. Battery</div>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-success-400"></div>
              <span className="text-gray-600">{onlineRobots} Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-gray-600">{offlineRobots} Offline</span>
            </div>
            {robotsWithErrors > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-error-400"></div>
                <span className="text-gray-600">{robotsWithErrors} Error{robotsWithErrors !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          
          <div className="text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default DashboardOverview