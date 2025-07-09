import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const TemplateDetail = () => {
  const { templateId } = useParams<{ templateId: string }>()

  if (!templateId) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">Template ID is required</p>
        <Link to="/templates" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          ← Back to Templates
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/templates">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100">
              <FileText className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Template {templateId}</h1>
              <p className="text-gray-600">Order Template Details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Template Information</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Template ID</label>
            <p className="text-gray-900 font-mono">{templateId}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="text-gray-900">Loading...</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-gray-900">Loading...</p>
          </div>
        </div>
      </Card>

      {/* Template Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Nodes</h3>
          <div className="text-center py-8">
            <p className="text-gray-500">Template nodes will be displayed here</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edges</h3>
          <div className="text-center py-8">
            <p className="text-gray-500">Template edges will be displayed here</p>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button variant="primary" fullWidth>
            Execute Template
          </Button>
          <Button variant="outline" fullWidth>
            Edit Template
          </Button>
          <Button variant="outline" fullWidth>
            Delete Template
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default TemplateDetail