import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store'
import { fetchConnectedRobots } from '@/store/slices/robotSlice'
import { Activity, Cpu, Zap, AlertCircle, TrendingUp, Clock } from 'lucide-react'

import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/Loading'
import DashboardOverview from '@/components/dashboard/DashboardOverview'
import RobotStatusGrid from '@/components/dashboard/RobotStatusGrid'
//import OrderStatistics from '@/components/dashboard/OrderStatistics'
//import SystemHealth from '@/components/dashboard/SystemHealth'
//import RealtimeChart from '@/components/dashboard/RealtimeChart'
//import AlertPanel from '@/components/dashboard/AlertPanel'

const Dashboard = () => {
  const dispatch = useAppDispatch()
  const { connectedRobots, robotStates, robotHealth, isLoading } = useAppSelector(state => state.robots)
  const { user } = useAppSelector(state => state.auth)
  
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Initial data fetch
    dispatch(fetchConnectedRobots())

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchConnectedRobots())
    }, 30000)

    setRefreshInterval(interval)

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [dispatch])

  // Calculate metrics
  const totalRobots = connectedRobots.length
  const onlineRobots = connectedRobots.filter(serial => 
    robotStates[serial]?.manufacturer && robotHealth[serial]?.isOnline
  ).length
  const robotsWithErrors = connectedRobots.filter(serial => 
    robotHealth[serial]?.hasErrors || (robotHealth[serial]?.errorCount || 0) > 0
  ).length
  const averageBatteryLevel = connectedRobots.length > 0 
    ? Math.round(connectedRobots.reduce((sum, serial) => 
        sum + (robotHealth[serial]?.batteryCharge || 0), 0) / connectedRobots.length)
    : 0

  if (isLoading && connectedRobots.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName || user?.username}! Here's what's happening with your robots.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="w-8 h-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Robots
                </dt>
                <dd className="text-2xl font-bold text-gray-900">{totalRobots}</dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Cpu className="w-8 h-8 text-success-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Online
                </dt>
                <dd className="text-2xl font-bold text-gray-900">{onlineRobots}</dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Zap className="w-8 h-8 text-warning-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Avg. Battery
                </dt>
                <dd className="text-2xl font-bold text-gray-900">{averageBatteryLevel}%</dd>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className={`w-8 h-8 ${robotsWithErrors > 0 ? 'text-error-600' : 'text-gray-400'}`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  With Errors
                </dt>
                <dd className="text-2xl font-bold text-gray-900">{robotsWithErrors}</dd>
              </dl>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <DashboardOverview 
            totalRobots={totalRobots}
            onlineRobots={onlineRobots}
            robotsWithErrors={robotsWithErrors}
            averageBatteryLevel={averageBatteryLevel}
          />

          {/* Robot Status Grid */}
          <RobotStatusGrid robots={connectedRobots} />

          {/* Real-time Charts */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Battery Levels
              </h3>
              <RealtimeChart 
                type="battery"
                data={connectedRobots.map(serial => ({
                  label: serial,
                  value: robotHealth[serial]?.batteryCharge || 0
                }))}
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Connection Status
              </h3>
              <RealtimeChart 
                type="status"
                data={[
                  { label: 'Online', value: onlineRobots, color: '#22c55e' },
                  { label: 'Offline', value: totalRobots - onlineRobots, color: '#ef4444' }
                ]}
              />
            </Card>
          </div>

          {/* Order Statistics */}
          <OrderStatistics />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* System Health */}
          <SystemHealth />

          {/* Alerts Panel */}
          <AlertPanel />

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full btn btn-primary">
                Create New Order
              </button>
              <button className="w-full btn btn-outline">
                Manage Templates
              </button>
              <button className="w-full btn btn-outline">
                View Reports
              </button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                <div className="flex-1 text-sm">
                  <p className="text-gray-900">Robot R001 completed order</p>
                  <p className="text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                <div className="flex-1 text-sm">
                  <p className="text-gray-900">Low battery alert for R003</p>
                  <p className="text-gray-500">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <div className="flex-1 text-sm">
                  <p className="text-gray-900">New order template created</p>
                  <p className="text-gray-500">10 minutes ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard