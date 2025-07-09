import { useAppSelector } from '@/store'
import { ClipboardList, CheckCircle, XCircle, Clock, Play, Pause } from 'lucide-react'
import Card from '@/components/ui/Card'

const OrderStatistics = () => {
  const { orders } = useAppSelector(state => state.orders)

  // Calculate stats from orders if available
  const calculateStats = () => {
    if (orders && orders.length > 0) {
      const totalOrders = orders.length
      const activeOrders = orders.filter(order => 
        ['CREATED', 'SENT', 'EXECUTING'].includes(order.status)
      ).length
      const completedOrders = orders.filter(order => order.status === 'COMPLETED').length
      const failedOrders = orders.filter(order => order.status === 'FAILED').length
      const cancelledOrders = orders.filter(order => order.status === 'CANCELLED').length
      
      return {
        totalOrders,
        activeOrders,
        completedOrders,
        failedOrders,
        cancelledOrders,
        successRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
      }
    }

    // Default values when no orders
    return {
      totalOrders: 0,
      activeOrders: 0,
      completedOrders: 0,
      failedOrders: 0,
      cancelledOrders: 0,
      successRate: 0
    }
  }

  const stats = calculateStats()

  const statItems = [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ClipboardList,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    },
    {
      label: 'Active',
      value: stats.activeOrders,
      icon: Play,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      label: 'Completed',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    },
    {
      label: 'Failed',
      value: stats.failedOrders,
      icon: XCircle,
      color: 'text-error-600',
      bgColor: 'bg-error-100'
    }
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Order Statistics</h3>
        <div className="text-xs text-gray-500">Last 24 hours</div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statItems.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor} mb-3`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Success Rate */}
      {stats.totalOrders > 0 && (
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Success Rate</span>
            <span className="text-lg font-semibold text-success-600">
              {stats.successRate}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-success-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.successRate}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{stats.completedOrders} completed</span>
            <span>{stats.failedOrders} failed</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.totalOrders === 0 && (
        <div className="text-center py-8 border-t border-gray-200">
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h4>
          <p className="text-gray-500">
            Order statistics will appear here once you start executing orders.
          </p>
        </div>
      )}

      {/* Quick Actions */}
      {stats.totalOrders > 0 && (
        <div className="flex justify-center pt-6 border-t border-gray-200">
          <div className="flex space-x-4 text-xs">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                0s
              </div>
              <div className="text-gray-500">Avg. Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {stats.totalOrders}
              </div>
              <div className="text-gray-500">Today</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {stats.activeOrders}
              </div>
              <div className="text-gray-500">Running</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default OrderStatistics