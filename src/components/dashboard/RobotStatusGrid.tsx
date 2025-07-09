import { useAppSelector } from '@/store'
import { Link } from 'react-router-dom'
import { Bot, Battery, Wifi, WifiOff } from 'lucide-react'
import Card from '@/components/ui/Card'

interface RobotStatusGridProps {
  robots: string[]
}

const RobotStatusGrid = ({ robots }: RobotStatusGridProps) => {
  const { robotStates, robotHealth } = useAppSelector(state => state.robots)

  if (robots.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No robots connected</h3>
        <p className="text-gray-500">Connect your first robot to see status here.</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Robot Status Grid</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {robots.slice(0, 8).map((serialNumber) => {
          const health = robotHealth[serialNumber]
          const isOnline = health?.isOnline || false
          const batteryLevel = health?.batteryCharge || 0

          return (
            <Link key={serialNumber} to={`/robots/${serialNumber}`}>
              <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Bot className={`w-4 h-4 ${isOnline ? 'text-success-600' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium truncate">{serialNumber}</span>
                  </div>
                  {isOnline ? (
                    <Wifi className="w-3 h-3 text-success-600" />
                  ) : (
                    <WifiOff className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Battery className="w-3 h-3 text-gray-500" />
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        batteryLevel > 50 ? 'bg-success-500' : 
                        batteryLevel > 20 ? 'bg-warning-500' : 'bg-error-500'
                      }`}
                      style={{ width: `${Math.max(batteryLevel, 2)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{batteryLevel.toFixed(0)}%</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
      {robots.length > 8 && (
        <div className="mt-4 text-center">
          <Link to="/robots" className="text-primary-600 hover:text-primary-700 text-sm">
            View all {robots.length} robots →
          </Link>
        </div>
      )}
    </Card>
  )
}

export default RobotStatusGrid