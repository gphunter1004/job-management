import { useState } from 'react'
import { X, Plus, MapPin, Target, Settings as SettingsIcon, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface NodePosition {
  x: number
  y: number
  theta: number
  allowedDeviationXY: number
  allowedDeviationTheta: number
  mapId: string
}

interface ActionTemplate {
  actionType: string
  actionId: string
  blockingType: string
  actionDescription: string
  parameters: Array<{
    key: string
    value: any
    valueType: string
  }>
}

interface CreateNodeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (nodeData: any) => Promise<void>
  isLoading?: boolean
}

const CreateNodeModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  isLoading = false 
}: CreateNodeModalProps) => {
  const [step, setStep] = useState<'basic' | 'position' | 'actions' | 'confirm'>('basic')
  
  // Basic info
  const [nodeId, setNodeId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sequenceId, setSequenceId] = useState(1)
  const [released, setReleased] = useState(false)

  // Position info
  const [position, setPosition] = useState<NodePosition>({
    x: 0,
    y: 0,
    theta: 0,
    allowedDeviationXY: 0.1,
    allowedDeviationTheta: 0.1,
    mapId: 'default_map'
  })

  // Actions
  const [actions, setActions] = useState<ActionTemplate[]>([])
  const [currentAction, setCurrentAction] = useState<ActionTemplate>({
    actionType: '',
    actionId: '',
    blockingType: 'HARD',
    actionDescription: '',
    parameters: []
  })

  if (!isOpen) return null

  const handleSave = async () => {
    const nodeData = {
      nodeId,
      name,
      description,
      sequenceId,
      released,
      position,
      actions
    }

    try {
      await onSave(nodeData)
      resetForm()
      onClose()
    } catch (error) {
      console.error('Failed to create node:', error)
    }
  }

  const resetForm = () => {
    setStep('basic')
    setNodeId('')
    setName('')
    setDescription('')
    setSequenceId(1)
    setReleased(false)
    setPosition({
      x: 0,
      y: 0,
      theta: 0,
      allowedDeviationXY: 0.1,
      allowedDeviationTheta: 0.1,
      mapId: 'default_map'
    })
    setActions([])
    setCurrentAction({
      actionType: '',
      actionId: '',
      blockingType: 'HARD',
      actionDescription: '',
      parameters: []
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const addAction = () => {
    if (currentAction.actionType && currentAction.actionId) {
      setActions([...actions, { ...currentAction }])
      setCurrentAction({
        actionType: '',
        actionId: '',
        blockingType: 'HARD',
        actionDescription: '',
        parameters: []
      })
    }
  }

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index))
  }

  const addParameter = () => {
    setCurrentAction({
      ...currentAction,
      parameters: [
        ...currentAction.parameters,
        { key: '', value: '', valueType: 'string' }
      ]
    })
  }

  const updateParameter = (index: number, field: string, value: any) => {
    const newParameters = [...currentAction.parameters]
    newParameters[index] = { ...newParameters[index], [field]: value }
    setCurrentAction({ ...currentAction, parameters: newParameters })
  }

  const removeParameter = (index: number) => {
    setCurrentAction({
      ...currentAction,
      parameters: currentAction.parameters.filter((_, i) => i !== index)
    })
  }

  const isStepValid = () => {
    switch (step) {
      case 'basic':
        return nodeId.trim() && name.trim()
      case 'position':
        return position.mapId.trim()
      case 'actions':
        return true // Actions are optional
      case 'confirm':
        return true
      default:
        return false
    }
  }

  const canProceed = isStepValid()

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100">
              <Plus className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Create New Node</h3>
              <p className="text-sm text-gray-500">
                {step === 'basic' && 'Enter basic node information'}
                {step === 'position' && 'Set node position and location'}
                {step === 'actions' && 'Add actions to the node'}
                {step === 'confirm' && 'Review and confirm node details'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {['basic', 'position', 'actions', 'confirm'].map((stepName, index) => {
              const isActive = step === stepName
              const isCompleted = ['basic', 'position', 'actions', 'confirm'].indexOf(step) > index
              
              return (
                <div key={stepName} className="flex items-center">
                  <div className={`flex items-center space-x-2 ${
                    isActive ? 'text-primary-600' : 
                    isCompleted ? 'text-success-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      isActive ? 'bg-primary-100' :
                      isCompleted ? 'bg-success-100' : 'bg-gray-100'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium capitalize">{stepName}</span>
                  </div>
                  {index < 3 && (
                    <div className={`h-px w-8 ml-4 ${isCompleted ? 'bg-success-300' : 'bg-gray-300'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Step 1: Basic Information */}
          {step === 'basic' && (
            <div className="space-y-6">
              <h4 className="font-medium text-gray-900">Basic Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Node ID *</label>
                  <input
                    type="text"
                    value={nodeId}
                    onChange={(e) => setNodeId(e.target.value)}
                    className="form-input"
                    placeholder="e.g., node_001"
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique identifier for the node</p>
                </div>
                
                <div>
                  <label className="form-label">Node Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    placeholder="e.g., Pickup Point A"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
                  rows={3}
                  placeholder="Optional description of the node's purpose..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Sequence ID</label>
                  <input
                    type="number"
                    value={sequenceId}
                    onChange={(e) => setSequenceId(parseInt(e.target.value) || 1)}
                    className="form-input"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Execution order in the template</p>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="released"
                    checked={released}
                    onChange={(e) => setReleased(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="released" className="text-sm text-gray-700">
                    Released for execution
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Position */}
          {step === 'position' && (
            <div className="space-y-6">
              <h4 className="font-medium text-gray-900">Position Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="form-label">X Coordinate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={position.x}
                    onChange={(e) => setPosition({...position, x: parseFloat(e.target.value) || 0})}
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="form-label">Y Coordinate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={position.y}
                    onChange={(e) => setPosition({...position, y: parseFloat(e.target.value) || 0})}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Theta (Rotation)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={position.theta}
                    onChange={(e) => setPosition({...position, theta: parseFloat(e.target.value) || 0})}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Allowed Deviation XY</label>
                  <input
                    type="number"
                    step="0.01"
                    value={position.allowedDeviationXY}
                    onChange={(e) => setPosition({...position, allowedDeviationXY: parseFloat(e.target.value) || 0})}
                    className="form-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">Acceptable position deviation in meters</p>
                </div>

                <div>
                  <label className="form-label">Allowed Deviation Theta</label>
                  <input
                    type="number"
                    step="0.01"
                    value={position.allowedDeviationTheta}
                    onChange={(e) => setPosition({...position, allowedDeviationTheta: parseFloat(e.target.value) || 0})}
                    className="form-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">Acceptable rotation deviation in radians</p>
                </div>
              </div>

              <div>
                <label className="form-label">Map ID *</label>
                <select
                  value={position.mapId}
                  onChange={(e) => setPosition({...position, mapId: e.target.value})}
                  className="form-input"
                >
                  <option value="default_map">Default Map</option>
                  <option value="warehouse_floor_1">Warehouse Floor 1</option>
                  <option value="warehouse_floor_2">Warehouse Floor 2</option>
                  <option value="production_area">Production Area</option>
                </select>
              </div>

              {/* Visual Position Preview */}
              <Card className="p-4">
                <h5 className="text-sm font-medium text-gray-900 mb-3">Position Preview</h5>
                <div className="bg-gray-100 rounded-lg p-4 relative" style={{height: '200px'}}>
                  <div 
                    className="absolute w-4 h-4 bg-primary-500 rounded-full transform -translate-x-2 -translate-y-2"
                    style={{
                      left: `${Math.max(0, Math.min(100, (position.x + 10) * 5))}%`,
                      top: `${Math.max(0, Math.min(100, (position.y + 10) * 5))}%`
                    }}
                  />
                  <div className="absolute bottom-2 left-2 text-xs text-gray-500">
                    Position: ({position.x.toFixed(2)}, {position.y.toFixed(2)})
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 3: Actions */}
          {step === 'actions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Node Actions</h4>
                <Badge variant="info">{actions.length} action{actions.length !== 1 ? 's' : ''}</Badge>
              </div>

              {/* Existing Actions */}
              {actions.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-700">Added Actions</h5>
                  {actions.map((action, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="primary">{action.actionType}</Badge>
                            <Badge variant="secondary">{action.blockingType}</Badge>
                          </div>
                          <p className="text-sm text-gray-900 font-medium">{action.actionId}</p>
                          {action.actionDescription && (
                            <p className="text-sm text-gray-600 mt-1">{action.actionDescription}</p>
                          )}
                          {action.parameters.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">{action.parameters.length} parameter{action.parameters.length !== 1 ? 's' : ''}</p>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAction(index)}
                          className="text-error-600 hover:text-error-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Add New Action */}
              <Card className="p-4">
                <h5 className="text-sm font-medium text-gray-900 mb-4">Add New Action</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="form-label">Action Type</label>
                    <select
                      value={currentAction.actionType}
                      onChange={(e) => setCurrentAction({...currentAction, actionType: e.target.value})}
                      className="form-input"
                    >
                      <option value="">Select action type...</option>
                      <option value="move">Move</option>
                      <option value="pick">Pick</option>
                      <option value="place">Place</option>
                      <option value="wait">Wait</option>
                      <option value="scan">Scan</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Action ID</label>
                    <input
                      type="text"
                      value={currentAction.actionId}
                      onChange={(e) => setCurrentAction({...currentAction, actionId: e.target.value})}
                      className="form-input"
                      placeholder="e.g., pick_001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="form-label">Blocking Type</label>
                    <select
                      value={currentAction.blockingType}
                      onChange={(e) => setCurrentAction({...currentAction, blockingType: e.target.value})}
                      className="form-input"
                    >
                      <option value="HARD">Hard (Blocking)</option>
                      <option value="SOFT">Soft (Non-blocking)</option>
                      <option value="NONE">None</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      value={currentAction.actionDescription}
                      onChange={(e) => setCurrentAction({...currentAction, actionDescription: e.target.value})}
                      className="form-input"
                      placeholder="Action description..."
                    />
                  </div>
                </div>

                {/* Parameters */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="form-label">Parameters</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addParameter}
                      leftIcon={<Plus className="w-3 h-3" />}
                    >
                      Add Parameter
                    </Button>
                  </div>

                  {currentAction.parameters.map((param, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={param.key}
                          onChange={(e) => updateParameter(index, 'key', e.target.value)}
                          className="form-input"
                          placeholder="Key"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => updateParameter(index, 'value', e.target.value)}
                          className="form-input"
                          placeholder="Value"
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          value={param.valueType}
                          onChange={(e) => updateParameter(index, 'valueType', e.target.value)}
                          className="form-input"
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="object">Object</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParameter(index)}
                          className="text-error-600 hover:text-error-700 w-full"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="primary"
                  onClick={addAction}
                  disabled={!currentAction.actionType || !currentAction.actionId}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Action
                </Button>
              </Card>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <h4 className="font-medium text-gray-900">Review Node Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h5>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-500">Node ID:</span> <span className="font-mono">{nodeId}</span></div>
                    <div><span className="text-gray-500">Name:</span> {name}</div>
                    <div><span className="text-gray-500">Description:</span> {description || 'N/A'}</div>
                    <div><span className="text-gray-500">Sequence:</span> {sequenceId}</div>
                    <div><span className="text-gray-500">Released:</span> {released ? 'Yes' : 'No'}</div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Position</h5>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-500">Coordinates:</span> ({position.x}, {position.y})</div>
                    <div><span className="text-gray-500">Rotation:</span> {position.theta}</div>
                    <div><span className="text-gray-500">XY Deviation:</span> {position.allowedDeviationXY}</div>
                    <div><span className="text-gray-500">Theta Deviation:</span> {position.allowedDeviationTheta}</div>
                    <div><span className="text-gray-500">Map:</span> {position.mapId}</div>
                  </div>
                </Card>
              </div>

              <Card className="p-4">
                <h5 className="text-sm font-medium text-gray-900 mb-3">Actions ({actions.length})</h5>
                {actions.length === 0 ? (
                  <p className="text-sm text-gray-500">No actions added</p>
                ) : (
                  <div className="space-y-2">
                    {actions.map((action, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <Badge variant="primary" size="sm">{action.actionType}</Badge>
                        <span>{action.actionId}</span>
                        <Badge variant="secondary" size="sm">{action.blockingType}</Badge>
                        {action.parameters.length > 0 && (
                          <span className="text-gray-500">({action.parameters.length} params)</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h6 className="text-sm font-medium text-blue-900">Ready to Create</h6>
                    <p className="text-sm text-blue-700 mt-1">
                      The node will be added to the current template. You can modify it later if needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Step {['basic', 'position', 'actions', 'confirm'].indexOf(step) + 1} of 4
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            
            {step !== 'basic' && (
              <Button
                variant="outline"
                onClick={() => {
                  const steps = ['basic', 'position', 'actions', 'confirm']
                  const currentIndex = steps.indexOf(step)
                  setStep(steps[currentIndex - 1] as any)
                }}
              >
                Back
              </Button>
            )}
            
            {step !== 'confirm' ? (
              <Button
                variant="primary"
                onClick={() => {
                  const steps = ['basic', 'position', 'actions', 'confirm']
                  const currentIndex = steps.indexOf(step)
                  setStep(steps[currentIndex + 1] as any)
                }}
                disabled={!canProceed}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!canProceed}
                loading={isLoading}
              >
                Create Node
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateNodeModal