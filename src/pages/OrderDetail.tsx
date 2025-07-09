import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>()

  if (!orderId) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">Order ID is required</p>
        <Link to="/orders" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          ← Back to Orders
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/orders">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100">
              <ClipboardList className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{orderId}</h1>
              <p className="text-gray-600">Order Execution Details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Order ID</label>
            <p className="text-gray-900 font-mono">{orderId}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="text-gray-900">Loading...</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Robot</label>
            <p className="text-gray-900">Loading...</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Template</label>
            <p className="text-gray-900">Loading...</p>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Execution Timeline</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">Order timeline will be displayed here</p>
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
        <div className="flex space-x-4">
          <Button variant="outline">
            View Robot
          </Button>
          <Button variant="outline">
            View Template
          </Button>
          <Button variant="error">
            Cancel Order
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default OrderDetail