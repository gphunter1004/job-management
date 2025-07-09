import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store'
import { 
  fetchConnectedRobots, 
  fetchRobotState, 
  fetchRobotHealth,
  setSelectedRobot 
} from '@/store/slices/robotSlice'
import { 
  Bot, 
  Search, 
  Filter, 
  RefreshCw, 
  Plus,
  Battery,
  Wifi,
  AlertCircle,
  Activity
} from 'lucide-react'

import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/Loading'
import RobotCard from '@/components/robot/RobotCard'
import RobotList from '@/components/robot/RobotList'
import SearchBar from '@/components/common/SearchBar'
import FilterPanel from '@/components/common/FilterPanel'

const Robots = () => {
  const dispatch = useAppDispatch()
  const { 
    connectedRobots, 
    robotStates, 
    robotHealth, 
    isLoading, 
    error 
  } = useAppSelector(state => state.robots)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    batteryLevel: 'all',
    hasErrors: false
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    dispatch(fetchConnectedRobots())
  }, [dispatch])

  useEffect(() => {
    // Fetch state and health for all connected robots
    connectedRobots.forEach(serialNumber => {
      if (!robotStates[serialNumber]) {
        dispatch(fetchRobotState(serialNumber))
      }
      if (!robotHealth[serialNumber]) {
        dispatch(fetchRobotHealth(serialNumber))
      }
    })
  }, [connectedRobots, dispatch, robotStates, robotHealth])

  const handleRefresh = () => {
    dispatch(fetchConnectedRobots())
    connectedRobots.forEach(serialNumber => {
      dispatch(fetchRobotState(serialNumber))
      dispatch(fetchRobotHealth(serialNumber))
    })
  }

  const filteredRobots = connectedRobots.filter(serialNumber => {
    const robot = robotStates[serialNumber]
    const health = robotHealth[serialNumber]
    
    // Search filter
    if (searchTerm && !serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Status filter
    if (filters.status !== 'all') {
      const isOnline = health?.isOnline
      if (filters.status === 'online' && !isOnline) return false
      if (filters.status === 'offline' && isOnline) return false
    }

    // Battery filter
    if (filters.batteryLevel !== 'all') {
      const batteryLevel = health?.batteryCharge || 0
      if (filters.batteryLevel === 'low' && batteryLevel > 20) return false
      if (filters.batteryLevel === 'medium' && (batteryLevel <= 20 || batteryLevel > 80)) return false
      if (filters.batteryLevel === 'high' && batteryLevel <= 80) return false
    }

    // Error filter
    if (filters.hasErrors && !health?.hasErrors) {
      return false
    }

    return true
  })

  const stats = {
    total: connectedRobots.length,
    online: connectedRobots.filter(serial => robotHealth[serial]?.isOnline).length,
    offline: connectedRobots.filter(serial => !robotHealth[serial]?.isOnline).length,
    withErrors: connectedRobots.filter(serial => robotHealth[serial]?.hasErrors).length,
    lowBattery: connectedRobots.filter(serial => (robotHealth[serial]?.batteryCharge || 0) < 20).length
  }

  if (isLoading && connectedRobots.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading robots..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Robots</h1>
          <p className="text-gray-600">
            Manage and monitor your connected robots
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={handleRefresh}
            loading={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Connect Robot
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-6">
          <div className="flex items-center">
            <Bot className="w-8 h-8 text-gray-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <Wifi className="w-8 h-8 text-success-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Online</p>
              <p className="text-2xl font-bold text-success-600">{stats.online}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-gray-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Offline</p>
              <p className="text-2xl font-bold text-gray-400">{stats.offline}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-error-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">With Errors</p>
              <p className="text-2xl font-bold text-error-600">{stats.withErrors}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Battery className="w-8 h-8 text-warning-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Low Battery</p>
              <p className="text-2xl font-bold text-warning-600">{stats.lowBattery}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search robots by serial number..."
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
            
            <div className="flex rounded-md shadow-sm">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                  viewMode === 'grid'
                    ? 'bg-primary-50 text-primary-700 border-primary-200'
                    : 'bg-white text-gray-500 border-gray-300 hover:text-gray-700'
                }`}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                  viewMode === 'list'
                    ? 'bg-primary-50 text-primary-700 border-primary-200'
                    : 'bg-white text-gray-500 border-gray-300 hover:text-gray-700'
                }`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            className="mt-4 pt-4 border-t border-gray-200"
          />
        )}
      </Card>

      {/* Error State */}
      {error && (
        <Card className="p-6">
          <div className="flex items-center text-error-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Robots Display */}
      {filteredRobots.length === 0 ? (
        <Card className="p-12 text-center">
          <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {connectedRobots.length === 0 ? 'No robots connected' : 'No robots match your filters'}
          </h3>
          <p className="text-gray-500 mb-6">
            {connectedRobots.length === 0 
              ? 'Connect your first robot to get started.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {connectedRobots.length === 0 && (
            <Button variant="primary">
              Connect Robot
            </Button>
          )}
        </Card>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'space-y-4'
        }>
          {filteredRobots.map(serialNumber => (
            viewMode === 'grid' ? (
              <RobotCard
                key={serialNumber}
                serialNumber={serialNumber}
                state={robotStates[serialNumber]}
                health={robotHealth[serialNumber]}
                onClick={() => dispatch(setSelectedRobot(serialNumber))}
              />
            ) : (
              <div key={serialNumber}>
                <RobotList
                  robots={[{
                    serialNumber,
                    state: robotStates[serialNumber],
                    health: robotHealth[serialNumber]
                  }]}
                />
              </div>
            )
          ))}
        </div>
      )}

      {/* Results count */}
      {filteredRobots.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {filteredRobots.length} of {connectedRobots.length} robots
        </div>
      )}
    </div>
  )
}

export default Robots