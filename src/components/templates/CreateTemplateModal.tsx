// src/components/templates/CreateTemplateModal.tsx
import { useState, useEffect } from 'react'
import { X, Plus, FileText, Check, MapPin, Target, Zap } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/Loading'
import SearchBar from '@/components/common/SearchBar'
import { useAppSelector, useAppDispatch } from '@/store'
import { fetchNodes } from '@/store/slices/nodeSlice'
import { fetchEdges } from '@/store/slices/edgeSlice'
import { fetchActions } from '@/store/slices/actionSlice'
import { NodeTemplate, EdgeTemplate, ActionTemplate } from '@/types/order'

interface CreateTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (templateData: {
    name: string
    description: string
    selectedNodes: NodeTemplate[]
    selectedEdges: EdgeTemplate[]
    selectedActions: ActionTemplate[]
  }) => Promise<void>
  isLoading?: boolean
}

const CreateTemplateModal = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false
}: CreateTemplateModalProps) => {
  const dispatch = useAppDispatch()
  
  // Redux state
  const { nodes, isLoading: nodesLoading } = useAppSelector(state => state.nodes)
  const { edges, isLoading: edgesLoading } = useAppSelector(state => state.edges)
  const { actions, isLoading: actionsLoading } = useAppSelector(state => state.action)

  // Form state
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [activeTab, setActiveTab] = useState<'nodes' | 'edges' | 'actions'>('nodes')
  
  // Selection state
  const [selectedNodes, setSelectedNodes] = useState<NodeTemplate[]>([])
  const [selectedEdges, setSelectedEdges] = useState<EdgeTemplate[]>([])
  const [selectedActions, setSelectedActions] = useState<ActionTemplate[]>([])
  
  // Search state
  const [nodeSearch, setNodeSearch] = useState('')
  const [edgeSearch, setEdgeSearch] = useState('')
  const [actionSearch, setActionSearch] = useState('')

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNodes({ limit: 100, offset: 0 }))
      dispatch(fetchEdges({ limit: 100, offset: 0 }))
      dispatch(fetchActions({ limit: 100, offset: 0 }))
    }
  }, [isOpen, dispatch])

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setTemplateName('')
    setTemplateDescription('')
    setSelectedNodes([])
    setSelectedEdges([])
    setSelectedActions([])
    setActiveTab('nodes')
    setNodeSearch('')
    setEdgeSearch('')
    setActionSearch('')
  }

  const handleSave = async () => {
    if (!templateName.trim()) return

    try {
      await onSave({
        name: templateName,
        description: templateDescription,
        selectedNodes,
        selectedEdges,
        selectedActions
      })
      handleClose()
    } catch (error) {
      console.error('Failed to create template:', error)
    }
  }

  // Node selection handlers
  const toggleNodeSelection = (node: NodeTemplate) => {
    setSelectedNodes(prev => {
      const isSelected = prev.some(n => n.id === node.id)
      if (isSelected) {
        return prev.filter(n => n.id !== node.id)
      } else {
        return [...prev, node]
      }
    })
  }

  const isNodeSelected = (node: NodeTemplate) => {
    return selectedNodes.some(n => n.id === node.id)
  }

  // Edge selection handlers
  const toggleEdgeSelection = (edge: EdgeTemplate) => {
    setSelectedEdges(prev => {
      const isSelected = prev.some(e => e.id === edge.id)
      if (isSelected) {
        return prev.filter(e => e.id !== edge.id)
      } else {
        return [...prev, edge]
      }
    })
  }

  const isEdgeSelected = (edge: EdgeTemplate) => {
    return selectedEdges.some(e => e.id === edge.id)
  }

  // Action selection handlers
  const toggleActionSelection = (action: ActionTemplate) => {
    setSelectedActions(prev => {
      const isSelected = prev.some(a => a.id === action.id)
      if (isSelected) {
        return prev.filter(a => a.id !== action.id)
      } else {
        return [...prev, action]
      }
    })
  }

  const isActionSelected = (action: ActionTemplate) => {
    return selectedActions.some(a => a.id === action.id)
  }

  // Filter functions
  const filteredNodes = (nodes || []).filter(node =>
    node.name.toLowerCase().includes(nodeSearch.toLowerCase()) ||
    node.nodeId.toLowerCase().includes(nodeSearch.toLowerCase())
  )

  const filteredEdges = (edges || []).filter(edge =>
    edge.name.toLowerCase().includes(edgeSearch.toLowerCase()) ||
    edge.edgeId.toLowerCase().includes(edgeSearch.toLowerCase())
  )

  const filteredActions = (actions || []).filter(action =>
    action.actionId.toLowerCase().includes(actionSearch.toLowerCase()) ||
    (action.actionDescription && action.actionDescription.toLowerCase().includes(actionSearch.toLowerCase()))
  )

  if (!isOpen) return null

  const tabs = [
    { id: 'nodes', label: '노드', icon: MapPin, count: selectedNodes.length },
    { id: 'edges', label: '엣지', icon: Target, count: selectedEdges.length },
    { id: 'actions', label: '액션', icon: Zap, count: selectedActions.length }
  ] as const

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100">
              <Plus className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">새 템플릿 생성</h3>
              <p className="text-sm text-gray-500">
                노드, 엣지, 액션을 선택하여 템플릿을 만드세요
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

        {/* Template Basic Info */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">템플릿 이름 *</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="form-input"
                placeholder="예: 픽업-배송 워크플로우"
              />
            </div>
            <div>
              <label className="form-label">설명</label>
              <input
                type="text"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                className="form-input"
                placeholder="템플릿 설명..."
              />
            </div>
          </div>

          {/* Selection Summary */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium">노드: {selectedNodes.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-secondary-600" />
              <span className="text-sm font-medium">엣지: {selectedEdges.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-warning-600" />
              <span className="text-sm font-medium">액션: {selectedActions.length}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <Badge variant={activeTab === tab.id ? 'primary' : 'secondary'} size="sm">
                      {tab.count}
                    </Badge>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Nodes Tab */}
          {activeTab === 'nodes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">노드 선택</h4>
                <div className="w-64">
                  <SearchBar
                    value={nodeSearch}
                    onChange={setNodeSearch}
                    placeholder="노드 검색..."
                  />
                </div>
              </div>

              {nodesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner size="md" text="노드 불러오는 중..." />
                </div>
              ) : filteredNodes.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">사용 가능한 노드가 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNodes.map((node) => (
                    <div
                      key={node.id}
                      onClick={() => toggleNodeSelection(node)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isNodeSelected(node)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="primary" size="sm">{node.name}</Badge>
                            {isNodeSelected(node) && (
                              <Check className="w-4 h-4 text-primary-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{node.description || '설명 없음'}</p>
                          <p className="text-xs text-gray-500">ID: {node.nodeId}</p>
                          <p className="text-xs text-gray-500">
                            위치: ({node.x.toFixed(1)}, {node.y.toFixed(1)})
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edges Tab */}
          {activeTab === 'edges' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">엣지 선택</h4>
                <div className="w-64">
                  <SearchBar
                    value={edgeSearch}
                    onChange={setEdgeSearch}
                    placeholder="엣지 검색..."
                  />
                </div>
              </div>

              {edgesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner size="md" text="엣지 불러오는 중..." />
                </div>
              ) : filteredEdges.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">사용 가능한 엣지가 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEdges.map((edge) => (
                    <div
                      key={edge.id}
                      onClick={() => toggleEdgeSelection(edge)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isEdgeSelected(edge)
                          ? 'border-secondary-500 bg-secondary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="secondary" size="sm">{edge.name}</Badge>
                            {isEdgeSelected(edge) && (
                              <Check className="w-4 h-4 text-secondary-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{edge.description || '설명 없음'}</p>
                          <p className="text-xs text-gray-500">ID: {edge.edgeId}</p>
                          <p className="text-xs text-gray-500">
                            {edge.startNodeId} → {edge.endNodeId}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">액션 선택</h4>
                <div className="w-64">
                  <SearchBar
                    value={actionSearch}
                    onChange={setActionSearch}
                    placeholder="액션 검색..."
                  />
                </div>
              </div>

              {actionsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner size="md" text="액션 불러오는 중..." />
                </div>
              ) : filteredActions.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">사용 가능한 액션이 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredActions.map((action) => (
                    <div
                      key={action.id}
                      onClick={() => toggleActionSelection(action)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isActionSelected(action)
                          ? 'border-warning-500 bg-warning-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="warning" size="sm">{action.actionType}</Badge>
                            {isActionSelected(action) && (
                              <Check className="w-4 h-4 text-warning-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-900 font-medium mb-1">{action.actionId}</p>
                          <p className="text-sm text-gray-600 mb-1">
                            {action.actionDescription || '설명 없음'}
                          </p>
                          <p className="text-xs text-gray-500">
                            차단 타입: {action.blockingType}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            선택됨: 노드 {selectedNodes.length}개, 엣지 {selectedEdges.length}개, 액션 {selectedActions.length}개
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!templateName.trim() || isLoading}
              loading={isLoading}
            >
              템플릿 생성
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTemplateModal