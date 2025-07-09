import { useMemo } from 'react'
import { Battery, Wifi, WifiOff, TrendingUp, TrendingDown } from 'lucide-react'

interface RealtimeChartProps {
  type: 'battery' | 'status' | 'line' | 'bar'
  data: Array<{
    label: string
    value: number
    color?: string
    trend?: 'up' | 'down' | 'stable'
    timestamp?: string
  }>
  title?: string
  showTrend?: boolean
  maxItems?: number
}

const RealtimeChart = ({ 
  type, 
  data, 
  title, 
  showTrend = false, 
  maxItems = 10 
}: RealtimeChartProps) => {
  // Limit data items for performance
  const limitedData = useMemo(() => {
    return data.slice(0, maxItems)
  }, [data, maxItems])

  // Calculate total for percentage calculations
  const total = useMemo(() => {
    if (type === 'status') {
      return limitedData.reduce((sum, item) => sum + item.value, 0)
    }
    return 0
  }, [limitedData, type])

  const renderBatteryChart = () => (
    <div className="space-y-3">
      {limitedData.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Battery className={`w-4 h-4 flex-shrink-0 ${
              item.value > 50 ? 'text-success-500' : 
              item.value > 20 ? 'text-warning-500' : 'text-error-500'
            }`} />
            <span className="text-sm text-gray-600 truncate">{item.label}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Battery Bar */}
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  item.value > 50 ? 'bg-success-500' : 
                  item.value > 20 ? 'bg-warning-500' : 'bg-error-500'
                }`}
                style={{ width: `${Math.max(item.value, 2)}%` }}
              />
            </div>
            
            {/* Percentage */}
            <span className="text-sm font-medium text-gray-900 w-8 text-right">
              {item.value.toFixed(0)}%
            </span>

            {/* Trend Indicator */}
            {showTrend && item.trend && (
              <div className="w-4">
                {item.trend === 'up' && <TrendingUp className="w-3 h-3 text-success-500" />}
                {item.trend === 'down' && <TrendingDown className="w-3 h-3 text-error-500" />}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderStatusChart = () => (
    <div className="space-y-3">
      {limitedData.map((item, index) => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0
        const isOnline = item.label.toLowerCase().includes('online')
        
        return (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-success-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-gray-400" />
              )}
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color || (isOnline ? '#22c55e' : '#6b7280') }}
              />
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 w-10 text-right">
                {percentage.toFixed(1)}%
              </span>
              <span className="text-sm font-medium text-gray-900 w-6 text-right">
                {item.value}
              </span>
            </div>
          </div>
        )
      })}

      {/* Visual Pie Chart Representation */}
      {total > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
            {limitedData.map((item, index) => {
              const width = (item.value / total) * 100
              return (
                <div
                  key={index}
                  className="transition-all duration-300"
                  style={{
                    width: `${width}%`,
                    backgroundColor: item.color || (index === 0 ? '#22c55e' : '#6b7280')
                  }}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  const renderLineChart = () => {
    const maxValue = Math.max(...limitedData.map(item => item.value))
    const minValue = Math.min(...limitedData.map(item => item.value))
    const range = maxValue - minValue || 1

    return (
      <div className="space-y-4">
        {/* Simple Line Chart Visualization */}
        <div className="relative h-32 border-l border-b border-gray-200">
          <div className="absolute inset-0 flex items-end justify-between px-2">
            {limitedData.map((item, index) => {
              const height = ((item.value - minValue) / range) * 100
              return (
                <div key={index} className="flex flex-col items-center space-y-1">
                  <div
                    className="w-2 bg-primary-500 rounded-t transition-all duration-300"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                  <span className="text-xs text-gray-500 transform -rotate-45 origin-bottom-left">
                    {item.label.substring(0, 3)}
                  </span>
                </div>
              )
            })}
          </div>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
            <span>{maxValue.toFixed(0)}</span>
            <span>{((maxValue + minValue) / 2).toFixed(0)}</span>
            <span>{minValue.toFixed(0)}</span>
          </div>
        </div>

        {/* Data Points */}
        <div className="space-y-2">
          {limitedData.slice(0, 5).map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium">{item.value.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderBarChart = () => {
    const maxValue = Math.max(...limitedData.map(item => item.value)) || 1

    return (
      <div className="space-y-3">
        {limitedData.map((item, index) => {
          const width = (item.value / maxValue) * 100
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 truncate">{item.label}</span>
                <span className="font-medium text-gray-900">{item.value}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(width, 2)}%`,
                    backgroundColor: item.color || '#3b82f6'
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderChart = () => {
    switch (type) {
      case 'battery':
        return renderBatteryChart()
      case 'status':
        return renderStatusChart()
      case 'line':
        return renderLineChart()
      case 'bar':
        return renderBarChart()
      default:
        return renderBatteryChart()
    }
  }

  return (
    <div className="w-full">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          {limitedData.length > 0 && (
            <span className="text-xs text-gray-500">
              {limitedData.length} item{limitedData.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {limitedData.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            {type === 'battery' && <Battery className="w-8 h-8 mx-auto" />}
            {type === 'status' && <Wifi className="w-8 h-8 mx-auto" />}
            {(type === 'line' || type === 'bar') && <TrendingUp className="w-8 h-8 mx-auto" />}
          </div>
          <p className="text-sm text-gray-500">No data available</p>
        </div>
      ) : (
        renderChart()
      )}

      {/* Timestamp */}
      {limitedData.length > 0 && limitedData[0].timestamp && (
        <div className="mt-4 text-xs text-gray-400 text-center">
          Last updated: {new Date(limitedData[0].timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}

export default RealtimeChart