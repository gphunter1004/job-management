// src/pages/Edges.tsx
import { useState, useEffect } from 'react'
import { Plus, Target, Trash2, Edit, AlertCircle, MapPin, Settings as SettingsIcon } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/Loading'
import SearchBar from '@/components/common/SearchBar'
import Select from '@/components/ui/Select'

import { useAppSelector, useAppDispatch } from '@/store'
import { fetchEdges, createEdge, updateEdge, deleteEdge } from '@/store/slices/edgeSlice'
import { fetchNodes } from '@/store/slices/nodeSlice'
import { EdgeTemplate, ActionTemplate } from '@/types/order'

const Edges = () => {
  const dispatch = useAppDispatch()
  const { edges, isLoading, error, pagination } = useAppSelector(state => state.edges)
  const { nodes: availableNodes } = useAppSelector(state => state.nodes)

  const [showEdgeForm, setShowEdgeForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [currentEdge, setCurrentEdge] = useState<Omit<EdgeTemplate, 'createdAt' | 'updatedAt' | 'id'> & { id?: number, actions: ActionTemplate[] }>({
    edgeId: '',
    name: '',
    description: '',
    sequenceId: 1,
    released: false,
    startNodeId: '',
    endNodeId: '',
    actions: []
  })

  useEffect(() => {
    dispatch(fetchEdges({ limit: pagination.limit, offset: pagination.offset, search: searchTerm }))
    dispatch(fetchNodes({ limit: 999, offset: 0 }))
  }, [dispatch, pagination.limit, pagination.offset, searchTerm])

  const handleCreateOrUpdateEdge = async () => {
    if (currentEdge.edgeId.trim() && currentEdge.name.trim() && currentEdge.startNodeId.trim() && currentEdge.endNodeId.trim()) {
      const edgeData = {
        ...currentEdge,
        sequenceId: Number(currentEdge.sequenceId),
      };

      try {
        if (isEditing && currentEdge.id) {
          await dispatch(updateEdge({ id: currentEdge.id, data: edgeData })).unwrap()
        } else {
          await dispatch(createEdge(edgeData as CreateEdgeRequest)).unwrap()
        }
        setShowEdgeForm(false)
        resetForm()
        dispatch(fetchEdges({ limit: pagination.limit, offset: pagination.offset, search: searchTerm }))
      } catch (err) {
        console.error('엣지 저장 실패:', err)
      }
    }
  }

  const handleDeleteEdge = async (id: number) => {
    if (window.confirm('정말로 이 엣지를 삭제하시겠습니까?')) {
      try {
        await dispatch(deleteEdge(id)).unwrap()
        dispatch(fetchEdges({ limit: pagination.limit, offset: pagination.offset, search: searchTerm }))
      } catch (err) {
        console.error('엣지 삭제 실패:', err)
      }
    }
  }

  const handleEditEdge = (edge: EdgeTemplate) => {
    setCurrentEdge({
      edgeId: edge.edgeId,
      name: edge.name,
      description: edge.description || '',
      sequenceId: edge.sequenceId,
      released: edge.released,
      startNodeId: edge.startNodeId,
      endNodeId: edge.endNodeId,
      actions: [], 
      id: edge.id 
    })
    setIsEditing(true)
    setShowEdgeForm(true)
  }

  const resetForm = () => {
    setCurrentEdge({
      edgeId: '', name: '', description: '', sequenceId: 1, released: false,
      startNodeId: '', endNodeId: '', actions: []
    })
    setIsEditing(false)
  }

  const addAction = () => {
    setCurrentEdge(prev => ({
      ...prev,
      actions: [
        ...prev.actions,
        { actionType: '', actionId: '', blockingType: 'HARD', actionDescription: '', parameters: [], id: Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ]
    }))
  }

  const updateAction = (index: number, field: string, value: any) => {
    const newActions = [...currentEdge.actions] 
    if(field === 'parameters') {
        newActions[index] = { ...newActions[index], parameters: value }
    } else {
        newActions[index] = { ...newActions[index], [field]: value }
    }
    setCurrentEdge(prev => ({ ...prev, actions: newActions }))
  }

  const removeAction = (index: number) => {
    setCurrentEdge(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }))
  }

  const addParameter = (actionIndex: number) => {
    const updatedActions = [...currentEdge.actions];
    updatedActions[actionIndex].parameters = [
      ...(updatedActions[actionIndex].parameters || []),
      { 
        id: Date.now(), 
        actionTemplateId: updatedActions[actionIndex].id || 0,
        key: '', 
        value: '', 
        valueType: 'string' 
      }
    ];
    setCurrentEdge(prev => ({ ...prev, actions: updatedActions }));
  };

  const updateParameter = (actionIndex: number, paramIndex: number, field: string, value: any) => {
    const updatedActions = [...currentEdge.actions];
    const updatedParams = [...(updatedActions[actionIndex].parameters || [])];
    updatedParams[paramIndex] = { ...updatedParams[paramIndex], [field]: value };
    updatedActions[actionIndex].parameters = updatedParams;
    setCurrentEdge(prev => ({ ...prev, actions: updatedActions }));
  };

  const removeParameter = (actionIndex: number, paramIndex: number) => {
    const updatedActions = [...currentEdge.actions];
    updatedActions[actionIndex].parameters = (updatedActions[actionIndex].parameters || []).filter((_, i) => i !== paramIndex);
    setCurrentEdge(prev => ({ ...prev, actions: updatedActions }));
  };

  const nodeOptions = availableNodes.map(node => ({
    value: node.nodeId,
    label: `${node.name} (${node.nodeId})`
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">엣지 관리</h1>
          <p className="text-gray-600">
            로봇의 노드 간 연결 경로를 관리합니다.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => { resetForm(); setShowEdgeForm(true) }}
        >
          새 엣지 생성
        </Button>
      </div>

      {/* 오류 메시지 표시 */}
      {error && (
        <Card className="p-6 bg-error-50 border border-error-200 text-error-700">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5" />
            <span>오류: {error}</span>
          </div>
        </Card>
      )}

      {/* 엣지 생성/수정 폼 */}
      {showEdgeForm && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isEditing ? '엣지 편집' : '새 엣지 정의'}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">엣지 ID *</label>
                <input
                  type="text"
                  value={currentEdge.edgeId}
                  onChange={(e) => setCurrentEdge(prev => ({ ...prev, edgeId: e.target.value }))}
                  className="form-input"
                  placeholder="예: path_001_to_002"
                  disabled={isEditing}
                />
              </div>
              <div>
                <label className="form-label">엣지 이름 *</label>
                <input
                  type="text"
                  value={currentEdge.name}
                  onChange={(e) => setCurrentEdge(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  placeholder="예: 픽업-드롭오프 경로"
                />
              </div>
            </div>

            <div>
              <label className="form-label">설명</label>
              <textarea
                value={currentEdge.description || ''}
                onChange={(e) => setCurrentEdge(prev => ({ ...prev, description: e.target.value }))}
                className="form-input"
                rows={2}
                placeholder="엣지에 대한 간단한 설명..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">시퀀스 ID</label>
                <input
                  type="number"
                  value={currentEdge.sequenceId}
                  onChange={(e) => setCurrentEdge(prev => ({ ...prev, sequenceId: parseInt(e.target.value) || 1 }))}
                  className="form-input"
                  min="1"
                />
              </div>
              <div className="flex items-center space-x-3 mt-6 md:mt-0">
                <input
                  type="checkbox"
                  id="edge-released"
                  checked={currentEdge.released}
                  onChange={(e) => setCurrentEdge(prev => ({ ...prev, released: e.target.checked }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="edge-released" className="text-sm text-gray-700">
                  실행을 위해 릴리스됨
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">시작 노드 ID *</label>
                <Select
                  value={currentEdge.startNodeId}
                  onChange={(value) => setCurrentEdge(prev => ({ ...prev, startNodeId: value }))}
                  options={nodeOptions}
                  placeholder="시작 노드 선택..."
                />
              </div>
              <div>
                <label className="form-label">종료 노드 ID *</label>
                <Select
                  value={currentEdge.endNodeId}
                  onChange={(value) => setCurrentEdge(prev => ({ ...prev, endNodeId: value }))}
                  options={nodeOptions}
                  placeholder="종료 노드 선택..."
                />
              </div>
            </div>

            {/* 액션 섹션 */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">엣지 액션</h4>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-3 h-3" />}
                  onClick={addAction}
                >
                  액션 추가
                </Button>
              </div>
              {currentEdge.actions.length === 0 && (
                <p className="text-sm text-gray-500">이 엣지에 대한 액션이 없습니다.</p>
              )}
              {currentEdge.actions.map((action, actionIndex) => (
                <Card key={actionIndex} className="p-4 mb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <label className="form-label mb-0">액션 타입</label>
                        <select
                            value={action.actionType}
                            onChange={(e) => updateAction(actionIndex, 'actionType', e.target.value)}
                            className="form-input text-sm py-1"
                        >
                            <option value="">선택...</option>
                            <option value="move">이동</option>
                            <option value="navigate">내비게이트</option>
                            <option value="custom">커스텀</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                          <label className="form-label mb-0">액션 ID</label>
                          <input
                              type="text"
                              value={action.actionId}
                              onChange={(e) => updateAction(actionIndex, 'actionId', e.target.value)}
                              className="form-input text-sm py-1"
                              placeholder="액션 ID"
                          />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="form-label mb-0">설명</label>
                        <input
                            type="text"
                            value={action.actionDescription || ''}
                            onChange={(e) => updateAction(actionIndex, 'actionDescription', e.target.value)}
                            className="form-input text-sm py-1"
                            placeholder="액션 설명"
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <label className="form-label mb-0">매개변수:</label>
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Plus className="w-3 h-3" />}
                            onClick={() => addParameter(actionIndex)}
                        >
                            매개변수 추가
                        </Button>
                      </div>
                      {/* 매개변수 목록 */}
                      {(action.parameters || []).length === 0 && (
                          <p className="text-xs text-gray-500 ml-4">매개변수 없음</p>
                      )}
                      {(action.parameters || []).map((param, paramIndex) => (
                          <div key={paramIndex} className="grid grid-cols-12 gap-2 mb-1 items-center ml-4">
                              <input
                                  type="text"
                                  value={param.key}
                                  onChange={(e) => updateParameter(actionIndex, paramIndex, 'key', e.target.value)}
                                  className="form-input col-span-4 text-xs py-1"
                                  placeholder="키"
                              />
                              <input
                                  type="text"
                                  value={param.value}
                                  onChange={(e) => updateParameter(actionIndex, paramIndex, 'value', e.target.value)}
                                  className="form-input col-span-5 text-xs py-1"
                                  placeholder="값"
                              />
                              <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => removeParameter(actionIndex, paramIndex)}
                                  className="text-error-600 hover:text-error-700 col-span-3"
                              >
                                  <Trash2 className="w-3 h-3" />
                              </Button>
                          </div>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAction(actionIndex)}
                      className="text-error-600 hover:text-error-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setShowEdgeForm(false)}>
                취소
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateOrUpdateEdge}
                disabled={isLoading || !currentEdge.edgeId.trim() || !currentEdge.name.trim() || !currentEdge.startNodeId.trim() || !currentEdge.endNodeId.trim()}
              >
                {isLoading ? '저장 중...' : isEditing ? '엣지 수정' : '엣지 생성'}
              </Button>
            </div>
          </Card>
        )}

      {/* 엣지 목록 */}
      {edges.length === 0 && !isLoading ? (
        <Card className="p-12 text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">생성된 엣지 없음</h3>
          <p className="text-gray-500 mb-6">
            새로운 엣지를 생성하여 목록에 추가하세요.
          </p>
          <Button 
            variant="primary"
            onClick={() => { resetForm(); setShowEdgeForm(true) }}
          >
            첫 엣지 생성
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {edges.map((edge) => (
            <Card key={edge.id} className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="primary">{edge.name}</Badge>
                <span className="text-sm text-gray-500">ID: {edge.edgeId}</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{edge.description || '설명 없음'}</h3>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p>시퀀스: <Badge variant="secondary" size="sm">{edge.sequenceId}</Badge></p>
                <p>시작 노드: <Badge variant="info" size="sm">{edge.startNodeId}</Badge></p>
                <p>종료 노드: <Badge variant="info" size="sm">{edge.endNodeId}</Badge></p>
                <p>액션 수: {edge.actionTemplateIds ? JSON.parse(edge.actionTemplateIds).length : 0}</p>
              </div>

              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  size="sm" 
                  leftIcon={<Edit className="w-3 h-3" />}
                  onClick={() => handleEditEdge(edge)}
                >
                  편집
                </Button>
                <Button 
                  variant="error" 
                  size="sm" 
                  leftIcon={<Trash2 className="w-3 h-3" />} 
                  onClick={() => handleDeleteEdge(edge.id)}
                  disabled={isLoading}
                >
                  삭제
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Edges