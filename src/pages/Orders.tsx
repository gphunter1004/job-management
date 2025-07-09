import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store'
import { 
  fetchOrderExecutions,
  fetchOrderTemplates,
  executeOrder,
  cancelOrder
} from '@/store/slices/orderSlice'
import { 
  ClipboardList, 
  Search, 
  Filter, 
  RefreshCw, 
  Plus,
  Play,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Pause
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/Loading'
import SearchBar from '@/components/common/SearchBar'
import { OrderStatus } from '@/types/order'

const Orders = () => {
  const dispatch = useAppDispatch()
  const { 
    orders, 
    templates,
    isLoading, 
    templatesLoading,
    error 
  } = useAppSelector(state => state.orders)
  const { connectedRobots } = useAppSelector(state => state.robots)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [robotFilter, setRobotFilter] = useState<string>('all')
  const [showExecuteModal, setShowExecuteModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [selectedRobot, setSelectedRobot] = useState<string>('')

  useEffect(() => {
    dispatch(fetchOrderExecutions())
    dispatch(fetchOrderTemplates())
  }, [dispatch])

  const handleRefresh = () => {
    dispatch(fetchOrderExecutions())
    dispatch(fetchOrderTemplates())
  }

  const handleExecuteOrder = async () => {
    if (selectedTemplate && selectedRobot) {
      try {
        await dispatch(executeOrder({
          templateId: selectedTemplate,
          serialNumber: selectedRobot
        }))
        setShowExecuteModal(false)
        setSelectedTemplate(null)
        setSelectedRobot('')
        dispatch(fetchOrderExecutions()) // Refresh orders
      } catch (error) {
        console.error('Failed to execute order:', error)
      }
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await dispatch(cancelOrder(orderId))
        dispatch(fetchOrderExecutions()) // Refresh orders
      } catch (error) {
        console.error('Failed to cancel order:', error)
      }
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return <Badge variant="success">Completed</Badge>
      case OrderStatus.EXECUTING:
        return <Badge variant="primary">Executing</Badge>
      case OrderStatus.FAILED:
        return <Badge variant="error">Failed</Badge>
      case OrderStatus.CANCELLED:
        return <Badge variant="secondary">Cancelled</Badge>
      case OrderStatus.CREATED:
        return <Badge variant="info">Created</Badge>
      case OrderStatus.SENT:
        return <Badge variant="warning">Sent</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4 text-success-600" />
      case OrderStatus.EXECUTING:
        return <Play className="w-4 h-4 text-primary-600" />
      case OrderStatus.FAILED:
        return <XCircle className="w-4 h-4 text-error-600" />
      case OrderStatus.CANCELLED:
        return <X className="w-4 h-4 text-gray-600" />
      case OrderStatus.CREATED:
      case OrderStatus.SENT:
        return <Clock className="w-4 h-4 text-warning-600" />
      default:
        return <Pause className="w-4 h-4 text-gray-600" />
    }
  }

  const filteredOrders = orders.filter(order => {
    // Search filter
    if (searchTerm && !order.orderId.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false
    }
    
    // Robot filter
    if (robotFilter !== 'all' && order.serialNumber !== robotFilter) {
      return false
    }
    
    return true
  })

  const stats = {
    total: orders.length,
    active: orders.filter(o => [OrderStatus.CREATED, OrderStatus.SENT, OrderStatus.EXECUTING].includes(o.status)).length,
    completed: orders.filter(o => o.status === OrderStatus.COMPLETED).length,
    failed: orders.filter(o => o.status === OrderStatus.FAILED).length,
  }

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading orders..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">
            Manage and monitor robot order executions
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
            onClick={() => setShowExecuteModal(true)}
          >
            Execute Order
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center">
            <ClipboardList className="w-8 h-8 text-gray-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <Play className="w-8 h-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-primary-600">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-success-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-success-600">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-error-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-error-600">{stats.failed}</p>
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
              placeholder="Search orders by ID..."
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Status</option>
              <option value={OrderStatus.CREATED}>Created</option>
              <option value={OrderStatus.EXECUTING}>Executing</option>
              <option value={OrderStatus.COMPLETED}>Completed</option>
              <option value={OrderStatus.FAILED}>Failed</option>
              <option value={OrderStatus.CANCELLED}>Cancelled</option>
            </select>
            
            <select
              value={robotFilter}
              onChange={(e) => setRobotFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Robots</option>
              {connectedRobots.map(robot => (
                <option key={robot} value={robot}>{robot}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="p-6">
          <div className="flex items-center text-error-600">
            <XCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {orders.length === 0 ? 'No orders found' : 'No orders match your filters'}
          </h3>
          <p className="text-gray-500 mb-6">
            {orders.length === 0 
              ? 'Execute your first order to get started.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {orders.length === 0 && (
            <Button 
              variant="primary"
              onClick={() => setShowExecuteModal(true)}
            >
              Execute Order
            </Button>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Order ID</th>
                  <th className="table-header-cell">Robot</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Template</th>
                  <th className="table-header-cell">Created</th>
                  <th className="table-header-cell">Duration</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredOrders.map((order) => {
                  const template = templates.find(t => t.id === order.orderTemplateId)
                  const duration = order.startedAt && order.completedAt 
                    ? Math.round((new Date(order.completedAt).getTime() - new Date(order.startedAt).getTime()) / 1000)
                    : null
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <Link 
                          to={`/orders/${order.orderId}`}
                          className="font-medium text-primary-600 hover:text-primary-700"
                        >
                          {order.orderId}
                        </Link>
                      </td>
                      <td className="table-cell">
                        <Link 
                          to={`/robots/${order.serialNumber}`}
                          className="text-gray-900 hover:text-primary-600"
                        >
                          {order.serialNumber}
                        </Link>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          {getStatusBadge(order.status)}
                        </div>
                      </td>
                      <td className="table-cell">
                        {template ? (
                          <Link 
                            to={`/templates/${template.id}`}
                            className="text-gray-900 hover:text-primary-600"
                          >
                            {template.name}
                          </Link>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="table-cell text-gray-500">
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </td>
                      <td className="table-cell">
                        {duration ? (
                          <span className="text-gray-900">{duration}s</span>
                        ) : order.status === OrderStatus.EXECUTING ? (
                          <span className="text-primary-600">Running...</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <Link to={`/orders/${order.orderId}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          
                          {[OrderStatus.CREATED, OrderStatus.SENT, OrderStatus.EXECUTING].includes(order.status) && (
                            <Button
                              variant="error"
                              size="sm"
                              onClick={() => handleCancelOrder(order.orderId)}
                              leftIcon={<X className="w-3 h-3" />}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Execute Order Modal */}
      {showExecuteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Execute Order</h3>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Select Template</label>
                <select
                  value={selectedTemplate || ''}
                  onChange={(e) => setSelectedTemplate(Number(e.target.value))}
                  className="form-input"
                  disabled={templatesLoading}
                >
                  <option value="">Choose a template...</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="form-label">Select Robot</label>
                <select
                  value={selectedRobot}
                  onChange={(e) => setSelectedRobot(e.target.value)}
                  className="form-input"
                >
                  <option value="">Choose a robot...</option>
                  {connectedRobots.map(robot => (
                    <option key={robot} value={robot}>
                      {robot}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowExecuteModal(false)
                  setSelectedTemplate(null)
                  setSelectedRobot('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleExecuteOrder}
                disabled={!selectedTemplate || !selectedRobot}
                loading={isLoading}
              >
                Execute
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      {filteredOrders.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      )}
    </div>
  )
}

export default Orders