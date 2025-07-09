// src/pages/Nodes.tsx
import { useState, useEffect } from 'react'
import { Plus, MapPin, Trash2, Edit, AlertCircle, Eye, Settings as SettingsIcon } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/Loading'
import SearchBar from '@/components/common/SearchBar'
import Select from '@/components/ui/Select'

import { useAppSelector, useAppDispatch } from '@/store'
import { fetchNodes, createNode, updateNode, deleteNode } from '@/store/slices/nodeSlice'
import { NodeTemplate, NodePosition, ActionTemplate } from '@/types/order'

const Nodes = () => {
  const dispatch = useAppDispatch()
  const { nodes, isLoading, error, pagination } = useAppSelector(state => state.nodes)

  const [showNodeForm, setShowNodeForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [currentNode, setCurrentNode] = useState<Omit<NodeTemplate, 'createdAt' | 'updatedAt' | 'id'> & { id?: number, position: NodePosition, actions: ActionTemplate[] }>({
    nodeId: '',
    name: '',
    description: '',
    sequenceId: 1,
    released: false,
    position: {
      x: 0,
      y: 0,
      theta: 0,
      allowedDeviationXY: 0.1,
      allowedDeviationTheta: 0.1,
      mapId: 'default_map'
    },
    actions: []
  })

  useEffect(() => {
    dispatch(fetchNodes({ limit: pagination.limit, offset: pagination.offset, search: searchTerm }))
  }, [dispatch, pagination.limit, pagination.offset, searchTerm])

  const handleCreateOrUpdateNode = async () => {
    if (currentNode.nodeId.trim() && currentNode.name.trim()) {
      const nodeData = {
        ...currentNode,
        sequenceId: Number(currentNode.sequenceId), // ensure number type
        x: Number(currentNode.position.x),
        y: Number(currentNode.position.y),
        theta: Number(currentNode.position.theta),
        allowedDeviationXY: Number(currentNode.position.allowedDeviationXY),
        allowedDeviationTheta: Number(currentNode.position.allowedDeviationTheta),
      };

      try {
        if (isEditing && currentNode.id) {
          await dispatch(updateNode({ id: currentNode.id, data: nodeData })).unwrap()
        } else {
          await dispatch(createNode(nodeData as CreateNodeRequest)).unwrap()
        }
        setShowNodeForm(false)
        resetForm()
        dispatch(fetchNodes({ limit: pagination.limit, offset: pagination.offset, search: searchTerm })) // 목록 새로고침
      } catch (err) {
        console.error('노드 저장 실패:', err)
      }
    }
  }

  const handleDeleteNode = async (id: number) => {
    if (window.confirm('정말로 이 노드를 삭제하시겠습니까?')) {
      try {
        await dispatch(deleteNode(id)).unwrap()
        dispatch(fetchNodes({ limit: pagination.limit, offset: pagination.offset, search: searchTerm })) // 목록 새로고침
      } catch (err) {
        console.error('노드 삭제 실패:', err)
      }
    }
  }

  const handleEditNode = (node: NodeTemplate) => {
    setCurrentNode({
      nodeId: node.nodeId,
      name: node.name,
      description: node.description || '',
      sequenceId: node.sequenceId,
      released: node.released,
      position: { // NodeTemplate에서 NodePosition으로 매핑
        x: node.x,
        y: node.y,
        theta: node.theta,
        allowedDeviationXY: node.allowedDeviationXY,
        allowedDeviationTheta: node.allowedDeviationTheta,
        mapId: node.mapId
      },
      // actions는 NodeTemplate에 직접 포함되어 있지 않으므로, 상세 조회 또는 별도 관리 필요.
      // 여기서는 기본값으로 빈 배열을 사용하거나, 필요시 fetchNodeById를 호출하여 상세 액션 로드
      actions: [], 
      id: node.id // 편집을 위해 ID 포함
    })
    setIsEditing(true)
    setShowNodeForm(true)
  }

  const resetForm = () => {
    setCurrentNode({
      nodeId: '', name: '', description: '', sequenceId: 1, released: false,
      position: { x: 0, y: 0, theta: 0, allowedDeviationXY: 0.1, allowedDeviationTheta: 0.1, mapId: 'default_map' },
      actions: []
    })
    setIsEditing(false)
  }
  
  // 액션 관리를 위한 헬퍼 함수 (CreateNodeModal에서 가져옴)
  const addAction = () => {
    setCurrentNode(prev => ({
      ...prev,
      actions: [
        ...prev.actions,
        { actionType: '', actionId: '', blockingType: 'HARD', actionDescription: '', parameters: [], id: Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ]
    }))
  }

  const updateAction = (index: number, field: string, value: any) => {
    const newActions = [...currentNode.actions]
    if(field === 'parameters') { // 매개변수 자체를 업데이트하는 경우
        newActions[index] = { ...newActions[index], parameters: value }
    } else {
        newActions[index] = { ...newActions[index], [field]: value }
    }
    setCurrentNode(prev => ({ ...prev, actions: newActions }))
  }

  const removeAction = (index: number) => {
    setCurrentNode(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }))
  }

  const addParameter = (actionIndex: number) => {
    const updatedActions = [...currentNode.actions];
    updatedActions[actionIndex].parameters = [
      ...(updatedActions[actionIndex].parameters || []),
      { 
        id: Date.now(), 
        actionTemplateId: updatedActions[actionIndex].id || 0, // 액션의 ID와 연결
        key: '', 
        value: '', 
        valueType: 'string' 
      }
    ];
    setCurrentNode(prev => ({ ...prev, actions: updatedActions }));
  };

  const updateParameter = (actionIndex: number, paramIndex: number, field: string, value: any) => {
    const updatedActions = [...currentNode.actions];
    const updatedParams = [...(updatedActions[actionIndex].parameters || [])];
    updatedParams[paramIndex] = { ...updatedParams[paramIndex], [field]: value };
    updatedActions[actionIndex].parameters = updatedParams;
    setCurrentNode(prev => ({ ...prev, actions: updatedActions }));
  };

  const removeParameter = (actionIndex: number, paramIndex: number) => {
    const updatedActions = [...currentNode.actions];
    updatedActions[actionIndex].parameters = (updatedActions[actionIndex].parameters || []).filter((_, i) => i !== paramIndex);
    setCurrentNode(prev => ({ ...prev, actions: updatedActions }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">노드 관리</h1>
          <p className="text-gray-600">
            로봇의 이동 경로를 구성하는 노드를 관리합니다.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => { resetForm(); setShowNodeForm(true) }}
        >
          새 노드 생성
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

      {/* 노드 생성/수정 폼 */}
      {showNodeForm && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isEditing ? '노드 편집' : '새 노드 정의'}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">노드 ID *</label>
                <input
                  type="text"
                  value={currentNode.nodeId}
                  onChange={(e) => setCurrentNode(prev => ({ ...prev, nodeId: e.target.value }))}
                  className="form-input"
                  placeholder="예: node_001"
                  disabled={isEditing}
                />
              </div>
              <div>
                <label className="form-label">노드 이름 *</label>
                <input
                  type="text"
                  value={currentNode.name}
                  onChange={(e) => setCurrentNode(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  placeholder="예: 픽업 지점 A"
                />
              </div>
            </div>

            <div>
              <label className="form-label">설명</label>
              <textarea
                value={currentNode.description || ''}
                onChange={(e) => setCurrentNode(prev => ({ ...prev, description: e.target.value }))}
                className="form-input"
                rows={2}
                placeholder="노드에 대한 간단한 설명..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">시퀀스 ID</label>
                <input
                  type="number"
                  value={currentNode.sequenceId}
                  onChange={(e) => setCurrentNode(prev => ({ ...prev, sequenceId: parseInt(e.target.value) || 1 }))}
                  className="form-input"
                  min="1"
                />
              </div>
              <div className="flex items-center space-x-3 mt-6 md:mt-0">
                <input
                  type="checkbox"
                  id="node-released"
                  checked={currentNode.released}
                  onChange={(e) => setCurrentNode(prev => ({ ...prev, released: e.target.checked }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="node-released" className="text-sm text-gray-700">
                  실행을 위해 릴리스됨
                </label>
              </div>
            </div>

            {/* 위치 정보 */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-900">위치 정보</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">X 좌표</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentNode.position.x}
                    onChange={(e) => setCurrentNode(prev => ({ ...prev, position: { ...prev.position, x: parseFloat(e.target.value) || 0 } }))}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Y 좌표</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentNode.position.y}
                    onChange={(e) => setCurrentNode(prev => ({ ...prev, position: { ...prev.position, y: parseFloat(e.target.value) || 0 } }))}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Theta (회전)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentNode.position.theta}
                    onChange={(e) => setCurrentNode(prev => ({ ...prev, position: { ...prev.position, theta: parseFloat(e.target.value) || 0 } }))}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="form-label">맵 ID</label>
                <select
                  value={currentNode.position.mapId}
                  onChange={(e) => setCurrentNode(prev => ({ ...prev, position: { ...prev.position, mapId: e.target.value } }))}
                  className="form-input"
                >
                  <option value="default_map">기본 맵</option>
                  <option value="warehouse_floor_1">창고 1층</option>
                  <option value="warehouse_floor_2">창고 2층</option>
                </select>
              </div>
            </div>

            {/* 액션 섹션 */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">노드 액션</h4>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-3 h-3" />}
                  onClick={addAction}
                >
                  액션 추가
                </Button>
              </div>
              {currentNode.actions.length === 0 && (
                <p className="text-sm text-gray-500">이 노드에 대한 액션이 없습니다.</p>
              )}
              {currentNode.actions.map((action, actionIndex) => (
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
                            <option value="pick">집기</option>
                            <option value="place">놓기</option>
                            <option value="wait">대기</option>
                            <option value="scan">스캔</option>
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
              <Button variant="outline" onClick={() => setShowNodeForm(false)}>
                취소
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateOrUpdateNode}
                disabled={isLoading || !currentNode.nodeId.trim() || !currentNode.name.trim()}
              >
                {isLoading ? '저장 중...' : isEditing ? '노드 수정' : '노드 생성'}
              </Button>
            </div>
          </Card>
        )}

      {/* 노드 목록 */}
      {nodes.length === 0 && !isLoading ? (
        <Card className="p-12 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">생성된 노드 없음</h3>
          <p className="text-gray-500 mb-6">
            새로운 노드를 생성하여 목록에 추가하세요.
          </p>
          <Button 
            variant="primary"
            onClick={() => { resetForm(); setShowNodeForm(true) }}
          >
            첫 노드 생성
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {nodes.map((node) => (
            <Card key={node.id} className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="primary">{node.name}</Badge>
                <span className="text-sm text-gray-500">ID: {node.nodeId}</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{node.description || '설명 없음'}</h3>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p>시퀀스: <Badge variant="secondary" size="sm">{node.sequenceId}</Badge></p>
                <p>위치: ({node.x.toFixed(2)}, {node.y.toFixed(2)}) on {node.mapId}</p>
                <p>액션 수: {node.actionTemplateIds ? JSON.parse(node.actionTemplateIds).length : 0}</p>
              </div>

              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  size="sm" 
                  leftIcon={<Edit className="w-3 h-3" />}
                  onClick={() => handleEditNode(node)}
                >
                  편집
                </Button>
                <Button 
                  variant="error" 
                  size="sm" 
                  leftIcon={<Trash2 className="w-3 h-3" />} 
                  onClick={() => handleDeleteNode(node.id)}
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

export default Nodes