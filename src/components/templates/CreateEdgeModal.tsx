// src/components/templates/CreateEdgeModal.tsx
import { useState } from 'react'
import { X, Plus, Target, MapPin, Settings as SettingsIcon, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select' // Select 컴포넌트 import

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

interface CreateEdgeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (edgeData: any) => Promise<void>
  isLoading?: boolean
  nodes: Array<{ nodeTemplate: { nodeId: string; name: string } }>; // 엣지 생성을 위한 노드 목록
}

const CreateEdgeModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  isLoading = false,
  nodes
}: CreateEdgeModalProps) => {
  const [step, setStep] = useState<'basic' | 'actions' | 'confirm'>('basic')
  
  // Basic info
  const [edgeId, setEdgeId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sequenceId, setSequenceId] = useState(1)
  const [released, setReleased] = useState(false)
  const [startNodeId, setStartNodeId] = useState('')
  const [endNodeId, setEndNodeId] = useState('')

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
    const edgeData = {
      edgeId,
      name,
      description,
      sequenceId,
      released,
      startNodeId,
      endNodeId,
      actions
    }

    try {
      await onSave(edgeData)
      resetForm()
      onClose()
    } catch (error) {
      console.error('Failed to create edge:', error)
    }
  }

  const resetForm = () => {
    setStep('basic')
    setEdgeId('')
    setName('')
    setDescription('')
    setSequenceId(1)
    setReleased(false)
    setStartNodeId('')
    setEndNodeId('')
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
        return edgeId.trim() && name.trim() && startNodeId && endNodeId
      case 'actions':
        return true // Actions are optional
      case 'confirm':
        return true
      default:
        return false
    }
  }

  const canProceed = isStepValid()
  const nodeOptions = nodes.map(node => ({
    value: node.nodeTemplate.nodeId,
    label: `${node.nodeTemplate.name} (${node.nodeTemplate.nodeId})`
  }));

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary-100">
              <Plus className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">새 엣지 생성</h3>
              <p className="text-sm text-gray-500">
                {step === 'basic' && '기본 엣지 정보를 입력하세요'}
                {step === 'actions' && '엣지에 액션을 추가하세요'}
                {step === 'confirm' && '엣지 세부 정보를 확인하고 생성합니다'}
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
            {['basic', 'actions', 'confirm'].map((stepName, index) => {
              const isActive = step === stepName
              const isCompleted = ['basic', 'actions', 'confirm'].indexOf(step) > index
              
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
                    <span className="text-sm font-medium capitalize">{stepName === 'basic' ? '기본' : stepName === 'actions' ? '액션' : '확인'}</span>
                  </div>
                  {index < 2 && ( // Changed from 3 to 2 for edges
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
              <h4 className="font-medium text-gray-900">기본 정보</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">엣지 ID *</label>
                  <input
                    type="text"
                    value={edgeId}
                    onChange={(e) => setEdgeId(e.target.value)}
                    className="form-input"
                    placeholder="예: edge_001"
                  />
                  <p className="text-xs text-gray-500 mt-1">엣지의 고유 식별자입니다.</p>
                </div>
                
                <div>
                  <label className="form-label">엣지 이름 *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    placeholder="예: Pick to Place"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">설명</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
                  rows={3}
                  placeholder="엣지의 목적에 대한 선택적 설명..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">시퀀스 ID</label>
                  <input
                    type="number"
                    value={sequenceId}
                    onChange={(e) => setSequenceId(parseInt(e.target.value) || 1)}
                    className="form-input"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">템플릿 내 실행 순서</p>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="edge-released"
                    checked={released}
                    onChange={(e) => setReleased(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edge-released" className="text-sm text-gray-700">
                    실행을 위해 릴리스됨
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">시작 노드 ID *</label>
                  <Select
                    value={startNodeId}
                    onChange={(value) => setStartNodeId(value)}
                    options={nodeOptions}
                    placeholder="시작 노드 선택..."
                  />
                </div>
                <div>
                  <label className="form-label">종료 노드 ID *</label>
                  <Select
                    value={endNodeId}
                    onChange={(value) => setEndNodeId(value)}
                    options={nodeOptions}
                    placeholder="종료 노드 선택..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Actions */}
          {step === 'actions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">엣지 액션</h4>
                <Badge variant="info">{actions.length} 액션</Badge>
              </div>

              {/* Existing Actions */}
              {actions.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-700">추가된 액션</h5>
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
                              <p className="text-xs text-gray-500">{action.parameters.length} 매개변수</p>
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
                <h5 className="text-sm font-medium text-gray-900 mb-4">새 액션 추가</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="form-label">액션 타입</label>
                    <select
                      value={currentAction.actionType}
                      onChange={(e) => setCurrentAction({...currentAction, actionType: e.target.value})}
                      className="form-input"
                    >
                      <option value="">액션 타입 선택...</option>
                      <option value="move">이동</option>
                      <option value="pick">집기</option>
                      <option value="place">놓기</option>
                      <option value="wait">대기</option>
                      <option value="scan">스캔</option>
                      <option value="custom">커스텀</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">액션 ID</label>
                    <input
                      type="text"
                      value={currentAction.actionId}
                      onChange={(e) => setCurrentAction({...currentAction, actionId: e.target.value})}
                      className="form-input"
                      placeholder="예: pick_001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="form-label">차단 타입</label>
                    <select
                      value={currentAction.blockingType}
                      onChange={(e) => setCurrentAction({...currentAction, blockingType: e.target.value})}
                      className="form-input"
                    >
                      <option value="HARD">하드 (차단)</option>
                      <option value="SOFT">소프트 (비차단)</option>
                      <option value="NONE">없음</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">설명</label>
                    <input
                      type="text"
                      value={currentAction.actionDescription}
                      onChange={(e) => setCurrentAction({...currentAction, actionDescription: e.target.value})}
                      className="form-input"
                      placeholder="액션 설명..."
                    />
                  </div>
                </div>

                {/* Parameters */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="form-label">매개변수</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addParameter}
                      leftIcon={<Plus className="w-3 h-3" />}
                    >
                      매개변수 추가
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
                          placeholder="키"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => updateParameter(index, 'value', e.target.value)}
                          className="form-input"
                          placeholder="값"
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          value={param.valueType}
                          onChange={(e) => updateParameter(index, 'valueType', e.target.value)}
                          className="form-input"
                        >
                          <option value="string">문자열</option>
                          <option value="number">숫자</option>
                          <option value="boolean">불리언</option>
                          <option value="object">객체</option>
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
                  액션 추가
                </Button>
              </Card>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <h4 className="font-medium text-gray-900">엣지 세부 정보 확인</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">기본 정보</h5>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-500">엣지 ID:</span> <span className="font-mono">{edgeId}</span></div>
                    <div><span className="text-gray-500">이름:</span> {name}</div>
                    <div><span className="text-gray-500">설명:</span> {description || 'N/A'}</div>
                    <div><span className="text-gray-500">시퀀스:</span> {sequenceId}</div>
                    <div><span className="text-gray-500">릴리스됨:</span> {released ? '예' : '아니오'}</div>
                    <div><span className="text-gray-500">시작 노드:</span> {startNodeId}</div>
                    <div><span className="text-gray-500">종료 노드:</span> {endNodeId}</div>
                  </div>
                </Card>
              </div>

              <Card className="p-4">
                <h5 className="text-sm font-medium text-gray-900 mb-3">액션 ({actions.length})</h5>
                {actions.length === 0 ? (
                  <p className="text-sm text-gray-500">추가된 액션 없음</p>
                ) : (
                  <div className="space-y-2">
                    {actions.map((action, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <Badge variant="primary" size="sm">{action.actionType}</Badge>
                        <span>{action.actionId}</span>
                        <Badge variant="secondary" size="sm">{action.blockingType}</Badge>
                        {action.parameters.length > 0 && (
                          <span className="text-gray-500">({action.parameters.length} 매개변수)</span>
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
                    <h6 className="text-sm font-medium text-blue-900">생성 준비 완료</h6>
                    <p className="text-sm text-blue-700 mt-1">
                      엣지가 현재 템플릿에 추가됩니다. 필요에 따라 나중에 수정할 수 있습니다.
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
            {['basic', 'actions', 'confirm'].indexOf(step) + 1} / 3 단계
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleClose}>
              취소
            </Button>
            
            {step !== 'basic' && (
              <Button
                variant="outline"
                onClick={() => {
                  const steps = ['basic', 'actions', 'confirm']
                  const currentIndex = steps.indexOf(step)
                  setStep(steps[currentIndex - 1] as any)
                }}
              >
                뒤로
              </Button>
            )}
            
            {step !== 'confirm' ? (
              <Button
                variant="primary"
                onClick={() => {
                  const steps = ['basic', 'actions', 'confirm']
                  const currentIndex = steps.indexOf(step)
                  setStep(steps[currentIndex + 1] as any)
                }}
                disabled={!canProceed}
              >
                다음
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!canProceed}
                loading={isLoading}
              >
                엣지 생성
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateEdgeModal