import { useState } from 'react'
import { X, Plus, Bot, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface CreateOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onExecute: (templateId: number, robotSerial: string) => Promise<void>
  templates: Array<{
    id: number
    name: string
    description: string
    createdAt: string
    updatedAt: string
  }>
  connectedRobots: string[]
  robotHealth?: Record<string, {
    isOnline: boolean
    batteryCharge: number
    hasErrors: boolean
    errorCount: number
  }>
  isLoading?: boolean
}

const CreateOrderModal = ({ 
  isOpen, 
  onClose, 
  onExecute, 
  templates, 
  connectedRobots,
  robotHealth = {},
  isLoading = false 
}: CreateOrderModalProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [selectedRobot, setSelectedRobot] = useState<string>('')
  const [step, setStep] = useState<'template' | 'robot' | 'confirm'>('template')

  if (!isOpen) return null

  const handleExecute = async () => {
    if (selectedTemplate && selectedRobot) {
      try {
        await onExecute(selectedTemplate, selectedRobot)
        onClose()
        resetModal()
      } catch (error) {
        console.error('Failed to execute order:', error)
      }
    }
  }

  const resetModal = () => {
    setSelectedTemplate(null)
    setSelectedRobot('')
    setStep('template')
  }

  const handleClose = () => {
    onClose()
    resetModal()
  }

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate)
  const selectedRobotHealth = robotHealth[selectedRobot]

  const getAvailableRobots = () => {
    const safeConnectedRobots = connectedRobots || []
    return safeConnectedRobots.filter(serial => {
      const health = robotHealth[serial]
      return health?.isOnline && !health?.hasErrors
    })
  }

  const getRobotStatusBadge = (serial: string) => {
    const health = robotHealth[serial]
    if (!health) return <Badge variant="secondary">Unknown</Badge>
    if (!health.isOnline) return <Badge variant="error">Offline</Badge>
    if (health.hasErrors) return <Badge variant="error">Error</Badge>
    if (health.batteryCharge < 20) return <Badge variant="warning">Low Battery</Badge>
    return <Badge variant="success">Ready</Badge>
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100">
              <Plus className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Create New Order</h3>
              <p className="text-sm text-gray-500">
                {step === 'template' && 'Select a template to execute'}
                {step === 'robot' && 'Choose a robot for execution'}
                {step === 'confirm' && 'Confirm order details'}
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
            <div className={`flex items-center space-x-2 ${
              step === 'template' ? 'text-primary-600' : 
              selectedTemplate ? 'text-success-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step === 'template' ? 'bg-primary-100' :
                selectedTemplate ? 'bg-success-100' : 'bg-gray-100'
              }`}>
                {selectedTemplate ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">Template</span>
            </div>
            
            <div className={`h-px flex-1 ${selectedTemplate ? 'bg-success-300' : 'bg-gray-300'}`} />
            
            <div className={`flex items-center space-x-2 ${
              step === 'robot' ? 'text-primary-600' : 
              selectedRobot ? 'text-success-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step === 'robot' ? 'bg-primary-100' :
                selectedRobot ? 'bg-success-100' : 'bg-gray-100'
              }`}>
                {selectedRobot ? <CheckCircle className="w-4 h-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Robot</span>
            </div>
            
            <div className={`h-px flex-1 ${selectedRobot ? 'bg-success-300' : 'bg-gray-300'}`} />
            
            <div className={`flex items-center space-x-2 ${
              step === 'confirm' ? 'text-primary-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step === 'confirm' ? 'bg-primary-100' : 'bg-gray-100'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Confirm</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Step 1: Template Selection */}
          {step === 'template' && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Available Templates</h4>
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No templates available</p>
                  <p className="text-sm text-gray-400 mt-1">Create a template first to execute orders</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{template.name}</h5>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            Created: {new Date(template.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Robot Selection */}
          {step === 'robot' && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Available Robots</h4>
              {getAvailableRobots().length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-warning-400 mx-auto mb-4" />
                  <p className="text-gray-900 font-medium">No robots available</p>
                  <p className="text-sm text-gray-500 mt-1">
                    All robots are either offline or have errors
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {(connectedRobots || []).map((serial) => {
                    const health = robotHealth[serial]
                    const isAvailable = health?.isOnline && !health?.hasErrors
                    
                    return (
                      <div
                        key={serial}
                        onClick={() => isAvailable && setSelectedRobot(serial)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedRobot === serial
                            ? 'border-primary-500 bg-primary-50'
                            : isAvailable
                            ? 'border-gray-200 hover:border-gray-300 cursor-pointer'
                            : 'border-gray-200 bg-gray-50 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Bot className={`w-6 h-6 ${
                              health?.isOnline ? 'text-success-600' : 'text-gray-400'
                            }`} />
                            <div>
                              <h5 className="font-medium text-gray-900">{serial}</h5>
                              <div className="flex items-center space-x-2 mt-1">
                                {getRobotStatusBadge(serial)}
                                {health && (
                                  <span className="text-xs text-gray-500">
                                    Battery: {health.batteryCharge.toFixed(0)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <h4 className="font-medium text-gray-900">Order Summary</h4>
              
              <div className="space-y-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-primary-600" />
                    <div>
                      <h5 className="font-medium text-gray-900">Template</h5>
                      <p className="text-sm text-gray-600">{selectedTemplateData?.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{selectedTemplateData?.description}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <Bot className="w-6 h-6 text-success-600" />
                    <div>
                      <h5 className="font-medium text-gray-900">Robot</h5>
                      <p className="text-sm text-gray-600">{selectedRobot}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getRobotStatusBadge(selectedRobot)}
                        {selectedRobotHealth && (
                          <span className="text-xs text-gray-500">
                            Battery: {selectedRobotHealth.batteryCharge.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h6 className="text-sm font-medium text-blue-900">Ready to Execute</h6>
                    <p className="text-sm text-blue-700 mt-1">
                      The order will be sent to robot {selectedRobot} immediately upon confirmation.
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
            {step === 'template' && templates.length > 0 && `${templates.length} templates available`}
            {step === 'robot' && `${getAvailableRobots().length} robots ready`}
            {step === 'confirm' && 'Review and confirm order details'}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            
            {step === 'template' && (
              <Button
                variant="primary"
                onClick={() => setStep('robot')}
                disabled={!selectedTemplate}
              >
                Next: Select Robot
              </Button>
            )}
            
            {step === 'robot' && (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setStep('template')}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setStep('confirm')}
                  disabled={!selectedRobot}
                >
                  Next: Confirm
                </Button>
              </div>
            )}
            
            {step === 'confirm' && (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setStep('robot')}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleExecute}
                  disabled={!selectedTemplate || !selectedRobot}
                  loading={isLoading}
                >
                  Execute Order
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateOrderModal