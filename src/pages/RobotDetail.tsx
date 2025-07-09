import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Bot } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const RobotDetail = () => {
  const { serialNumber } = useParams<{ serialNumber: string }>()

  if (!serialNumber) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">Robot serial number is required</p>
        <Link to="/robots" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          ← Back to Robots
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/robots">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100">
              <Bot className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{serialNumber}</h1>
              <p className="text-gray-600">Robot Details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Robot Information</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Serial Number</label>
            <p className="text-gray-900 font-mono">{serialNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="text-gray-900">Loading...</p>
          </div>
        </div>
      </Card>

      {/* Placeholder for future features */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Robot Control</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">Robot control features will be implemented here</p>
        </div>
      </Card>
    </div>
  )
}

export default RobotDetail