import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Target,
  Play,
  Copy,
  Eye
} from 'lucide-react'

import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/Loading'
import CreateNodeModal from '@/components/templates/CreateNodeModal'

// Mock data for development
const mockTemplateDetails = {
  template: {
    id: 1,
    name: 'Sample Template',
    description: 'A sample template for demonstration',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  nodes: [] as any[],
  edges: [] as any[]
}

const TemplateDetail = () => {
  const { templateId } = useParams<{ templateId: string }>()
  const [templateDetails, setTemplateDetails] = useState(mockTemplateDetails)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateNodeModal, setShowCreateNodeModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'nodes' | 'edges' | 'overview'>('overview')

  // Load template details
  useEffect(() => {
    if (templateId) {
      setIsLoading(true)
      // Simulate loading delay
      const timer = setTimeout(() => {
        setTemplateDetails({
          ...mockTemplateDetails,
          template: {
            ...mockTemplateDetails.template,
            id: parseInt(templateId),
            name: `Template ${templateId}`
          }
        })
        setIsLoading(false)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [templateId])

  const handleCreateNode = useCallback(async (nodeData: any) => {
    try {
      const newNode = {
        nodeTemplate: {
          id: Date.now(),
          nodeId: nodeData.nodeId,
          name: nodeData.name,
          description: nodeData.description,
          sequenceId: nodeData.sequenceId,
          released: nodeData.released,
          x: nodeData.position.x,
          y: nodeData.position.y,
          theta: nodeData.position.theta,
          allowedDeviationXY: nodeData.position.allowedDeviationXY,
          allowedDeviationTheta: nodeData.position.allowedDeviationTheta,
          mapId: nodeData.position.mapId,
          actionTemplateIds: JSON.stringify(nodeData.actions.map((a: any) => a.actionId)),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        actions: nodeData.actions
      }

      setTemplateDetails(prev => ({
        ...prev,
        nodes: [...prev.nodes, newNode]
      }))
      
      console.log('Node created:', newNode)
    } catch (error) {
      console.error('Failed to create node:', error)
      throw error
    }
  }, [])

  const handleDeleteNode = useCallback((nodeId: string) => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      setTemplateDetails(prev => ({
        ...prev,
        nodes: prev.nodes.filter(node => node.nodeTemplate.nodeId !== nodeId)
      }))
    }
  }, [])

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading template details..." />
      </div>
    )
  }

  const { template, nodes, edges } = templateDetails

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
              <h1 className="text-2xl font-bold text-gray-900">
                {template.name}
              </h1>
              <p className="text-gray-600">Template Details & Node Management</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" leftIcon={<Copy className="w-4 h-4" />}>
            Duplicate
          </Button>
          <Button variant="outline" leftIcon={<Edit className="w-4 h-4" />}>
            Edit Template
          </Button>
          <Button variant="primary" leftIcon={<Play className="w-4 h-4" />}>
            Execute
          </Button>
        </div>
      </div>

      {/* Template Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Template Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Template ID</label>
            <p className="text-gray-900 font-mono">{template.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="text-gray-900">{template.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-gray-900">{template.description || 'No description'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created</label>
            <p className="text-gray-900">{new Date(template.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Last Updated</label>
            <p className="text-gray-900">{new Date(template.updatedAt).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Components</label>
            <div className="flex items-center space-x-4">
              <Badge variant="primary">{nodes.length} Nodes</Badge>
              <Badge variant="secondary">{edges.length} Edges</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'nodes', label: 'Nodes', icon: MapPin, count: nodes.length },
            { id: 'edges', label: 'Edges', icon: Target, count: edges.length }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <Badge variant={activeTab === tab.id ? 'primary' : 'secondary'} size="sm">
                    {tab.count}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Template Structure</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Nodes</span>
                </div>
                <Badge variant="primary">{nodes.length}</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-secondary-600" />
                  <span className="font-medium">Edges</span>
                </div>
                <Badge variant="secondary">{edges.length}</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="primary" 
                fullWidth
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreateNodeModal(true)}
              >
                Add New Node
              </Button>
              <Button variant="outline" fullWidth leftIcon={<Target className="w-4 h-4" />}>
                Add New Edge
              </Button>
              <Button variant="outline" fullWidth leftIcon={<Eye className="w-4 h-4" />}>
                Visualize Template
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'nodes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Nodes ({nodes.length})
            </h3>
            <Button 
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreateNodeModal(true)}
            >
              Add Node
            </Button>
          </div>

          {nodes.length === 0 ? (
            <Card className="p-12 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No nodes found</h4>
              <p className="text-gray-500 mb-6">
                Add your first node to start building the template workflow.
              </p>
              <Button 
                variant="primary"
                onClick={() => setShowCreateNodeModal(true)}
              >
                Add First Node
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nodes.map((node) => (
                <Card key={node.nodeTemplate.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100">
                        <MapPin className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{node.nodeTemplate.name}</h4>
                        <p className="text-sm text-gray-500">{node.nodeTemplate.nodeId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant={node.nodeTemplate.released ? 'success' : 'warning'} size="sm">
                        {node.nodeTemplate.released ? 'Released' : 'Draft'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">{node.nodeTemplate.description || 'No description'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Sequence:</span>
                        <span className="ml-1 font-medium">{node.nodeTemplate.sequenceId}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Actions:</span>
                        <span className="ml-1 font-medium">{node.actions?.length || 0}</span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="text-gray-500">Position:</span>
                      <span className="ml-1 font-mono">
                        ({node.nodeTemplate.x.toFixed(2)}, {node.nodeTemplate.y.toFixed(2)})
                      </span>
                    </div>

                    <div className="text-sm">
                      <span className="text-gray-500">Map:</span>
                      <span className="ml-1">{node.nodeTemplate.mapId}</span>
                    </div>

                    {node.actions && node.actions.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Actions:</p>
                        <div className="flex flex-wrap gap-1">
                          {node.actions.slice(0, 3).map((action: any, index: number) => (
                            <Badge key={index} variant="info" size="sm">
                              {action.actionType}
                            </Badge>
                          ))}
                          {node.actions.length > 3 && (
                            <Badge variant="secondary" size="sm">
                              +{node.actions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
                    <Button variant="outline" size="sm" leftIcon={<Edit className="w-3 h-3" />}>
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      leftIcon={<Trash2 className="w-3 h-3" />}
                      onClick={() => handleDeleteNode(node.nodeTemplate.nodeId)}
                      className="text-error-600 hover:text-error-700"
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'edges' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Edges ({edges.length})
            </h3>
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Add Edge
            </Button>
          </div>

          <Card className="p-12 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No edges found</h4>
            <p className="text-gray-500 mb-6">
              Edges connect nodes to create the workflow path.
            </p>
            <Button variant="primary">
              Add First Edge
            </Button>
          </Card>
        </div>
      )}

      {/* Create Node Modal */}
      <CreateNodeModal
        isOpen={showCreateNodeModal}
        onClose={() => setShowCreateNodeModal(false)}
        onSave={handleCreateNode}
        isLoading={false}
      />
    </div>
  )
}

export default TemplateDetail