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
import { fetchNodes, createNode, updateNode, deleteNode, fetchNodeById, setSelectedNode } from '@/store/slices/nodeSlice'
import { NodeTemplate, NodePosition, ActionTemplate } from '@/types/order'
import { generatePseudoUUID } from '@/utils/idGenerator'

// CreateNodeRequestFlat 타입 정의 (API 인터페이스에 맞춤)
interface CreateNodeRequestFlat {
  nodeId: string
  name: string
  description?: string
  sequenceId: number
  released: boolean
  x: number
  y: number
  theta: number
  allowedDeviationXY: number
  allowedDeviationTheta: number
  mapId: string
  actions: ActionTemplate[]
} 

const Nodes = () => {
  const dispatch = useAppDispatch()
  const { nodes, isLoading, error, pagination, selectedNode } = useAppSelector(state => state.nodes)

  const [showNodeForm, setShowNodeForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [currentNode, setCurrentNode] = useState<Omit<NodeTemplate, 'createdAt' | 'updatedAt' | 'id'> & { 
    id?: number, 
    position: NodePosition, 
    actions: ActionTemplate[] 
  }>({
    nodeId: generatePseudoUUID(), 
    name: '',
    description: '',
    sequenceId: 0,
    released: false,
    x: 0.0,
    y: 0.0,
    theta: 0.0,
    allowedDeviationXY: 0.0,
    allowedDeviationTheta: 0.0,
    mapId: '',
    actionTemplateIds: '[]',
    position: {
      x: 0.0,
      y: 0.0,
      theta: 0.0,
      allowedDeviationXY: 0.0,
      allowedDeviationTheta: 0.0,
      mapId: ''
    },
    actions: []
  })

  useEffect(() => {
    console.log('[Nodes 페이지] 컴포넌트 마운트됨. 노드 목록 조회 시작')
    dispatch(fetchNodes({ limit: pagination.limit, offset: pagination.offset, search: searchTerm }))
  }, [dispatch, pagination.limit, pagination.offset, searchTerm])

  // 선택된 노드가 변경되면 편집 폼에 반영
  useEffect(() => {
    if (selectedNode && isEditing) {
      console.log('[Nodes 페이지] 선택된 노드 변경됨:', selectedNode)
      setCurrentNode({
        id: selectedNode.id,
        nodeId: selectedNode.nodeId,
        name: selectedNode.name,
        description: selectedNode.description || '',
        sequenceId: selectedNode.sequenceId,
        released: selectedNode.released,
        x: selectedNode.x,
        y: selectedNode.y,
        theta: selectedNode.theta,
        allowedDeviationXY: selectedNode.allowedDeviationXY,
        allowedDeviationTheta: selectedNode.allowedDeviationTheta,
        mapId: selectedNode.mapId,
        actionTemplateIds: selectedNode.actionTemplateIds,
        position: { // NodeTemplate에서 NodePosition으로 매핑
          x: selectedNode.x,
          y: selectedNode.y,
          theta: selectedNode.theta,
          allowedDeviationXY: selectedNode.allowedDeviationXY,
          allowedDeviationTheta: selectedNode.allowedDeviationTheta,
          mapId: selectedNode.mapId
        },
        actions: [], // 액션은 별도 관리가 필요함
      })
    }
  }, [selectedNode, isEditing])

  const handleCreateOrUpdateNode = async () => {
    if (currentNode.nodeId.trim() && currentNode.name.trim()) {
      const nodeData: CreateNodeRequestFlat = {
        nodeId: currentNode.nodeId,
        name: currentNode.name,
        description: currentNode.description,
        sequenceId: Number(currentNode.sequenceId),
        released: currentNode.released,
        x: Number(currentNode.position.x),
        y: Number(currentNode.position.y),
        theta: Number(currentNode.position.theta),
        allowedDeviationXY: Number(currentNode.position.allowedDeviationXY),
        allowedDeviationTheta: Number(currentNode.position.allowedDeviationTheta),
        mapId: currentNode.position.mapId,
        actions: currentNode.actions
      };

      try {
        console.log('[Nodes 페이지] 노드 저장 시작:', { isEditing, nodeData })
        
        if (isEditing && currentNode.id) {
          console.log('[Nodes 페이지] 노드 수정 요청. ID:', currentNode.id)
          await dispatch(updateNode({ id: currentNode.id, data: nodeData })).unwrap()
          console.log('[Nodes 페이지] 노드 수정 성공')
        } else {
          console.log('[Nodes 페이지] 노드 생성 요청')
          await dispatch(createNode(nodeData)).unwrap()
          console.log('[Nodes 페이지] 노드 생성 성공')
        }
        
        setShowNodeForm(false)
        resetForm()
        
        // 목록 새로고침
        console.log('[Nodes 페이지] 목록 새로고침 요청')
        dispatch(fetchNodes({ limit: pagination.limit, offset: pagination.offset, search: searchTerm }))
      } catch (err) {
        console.error('[Nodes 페이지] 노드 저장 실패:', err)
      }
    }
  }

  const handleDeleteNode = async (id: number) => {
    if (window.confirm('정말로 이 노드를 삭제하시겠습니까?')) {
      try {
        console.log('[Nodes 페이지] 노드 삭제 요청. ID:', id)
        await dispatch(deleteNode(id)).unwrap()
        console.log('[Nodes 페이지] 노드 삭제 성공')
        
        // 목록 새로고침
        dispatch(fetchNodes({ limit: pagination.limit, offset: pagination.offset, search: searchTerm }))
      } catch (err) {
        console.error('[Nodes 페이지] 노드 삭제 실패:', err)
      }
    }
  }

  const handleEditNode = async (node: NodeTemplate) => {
    console.log('[Nodes 페이지] 노드 편집 시작:', node)
    
    try {
      // 선택된 노드 설정
      dispatch(setSelectedNode(node))
      
      // 최신 노드 정보 가져오기 (상세 정보 포함)
      await dispatch(fetchNodeById(node.id)).unwrap()
      
      // 편집 모드로 전환
      setIsEditing(true)
      setShowNodeForm(true)
      
      console.log('[Nodes 페이지] 편집 폼 열기 완료')
    } catch (err) {
      console.error('[Nodes 페이지] 노드 편집 준비 실패:', err)
    }
  }

  const resetForm = () => {
    console.log('[Nodes 페이지] 폼 리셋')
    setCurrentNode({
      nodeId: generatePseudoUUID(), 
      name: '', 
      description: '', 
      sequenceId: 0, 
      released: false,
      x: 0.0,
      y: 0.0,
      theta: 0.0,
      allowedDeviationXY: 0.0,
      allowedDeviationTheta: 0.0,
      mapId: '',
      actionTemplateIds: '[]',
      position: { 
        x: 0.0, 
        y: 0.0, 
        theta: 0.0, 
        allowedDeviationXY: 0.0, 
        allowedDeviationTheta: 0.0, 
        mapId: '' 
      },
      actions: []
    })
    setIsEditing(false)
    dispatch(setSelectedNode(null))
  }
  
  // 액션 관리를 위한 헬퍼 함수 (CreateNodeModal에서 가져옴)
  const addAction = () => {
    const currentActions = Array.isArray(currentNode?.actions) ? currentNode.actions : [];
    setCurrentNode(prev => ({
      ...prev,
      actions: [
        ...currentActions,
        { 
          actionType: '', 
          actionId: '', 
          blockingType: 'NONE', 
          actionDescription: '', 
          parameters: [], 
          id: Date.now(), 
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString() 
        }
      ]
    }))
  }

  const updateAction = (index: number, field: string, value: any) => {
    const currentActions = Array.isArray(currentNode?.actions) ? [...currentNode.actions] : [];
    if (!currentActions[index]) return;
    
    if(field === 'parameters') {
        currentActions[index] = { ...currentActions[index], parameters: Array.isArray(value) ? value : [] }
    } else {
        currentActions[index] = { ...currentActions[index], [field]: value }
    }
    setCurrentNode(prev => ({ ...prev, actions: currentActions }))
  }

  const removeAction = (index: number) => {
    const currentActions = Array.isArray(currentNode?.actions) ? currentNode.actions : [];
    setCurrentNode(prev => ({
      ...prev,
      actions: currentActions.filter((_, i) => i !== index)
    }))
  }

  const addParameter = (actionIndex: number) => {
    const updatedActions = [...(currentNode?.actions || [])];
    const currentAction = updatedActions[actionIndex];
    
    if (!currentAction) return;
    
    // 안전하게 parameters 배열 처리
    const currentParameters = Array.isArray(currentAction.parameters) ? currentAction.parameters : [];
    
    updatedActions[actionIndex] = {
      ...currentAction,
      parameters: [
        ...currentParameters,
        { 
          id: Date.now(), 
          actionTemplateId: currentAction.id || 0,
          key: '', 
          value: '', 
          valueType: 'string' 
        }
      ]
    };
    setCurrentNode(prev => ({ ...prev, actions: updatedActions }));
  };

  const updateParameter = (actionIndex: number, paramIndex: number, field: string, value: any) => {
    const updatedActions = [...(currentNode?.actions || [])];
    const currentAction = updatedActions[actionIndex];
    
    if (!currentAction) return;
    
    // 안전하게 parameters 배열 처리
    const currentParameters = Array.isArray(currentAction.parameters) ? [...currentAction.parameters] : [];
    
    if (currentParameters[paramIndex]) {
      currentParameters[paramIndex] = { ...currentParameters[paramIndex], [field]: value };
      updatedActions[actionIndex] = {
        ...currentAction,
        parameters: currentParameters
      };
      setCurrentNode(prev => ({ ...prev, actions: updatedActions }));
    }
  };

  const removeParameter = (actionIndex: number, paramIndex: number) => {
    const updatedActions = [...(currentNode?.actions || [])];
    const currentAction = updatedActions[actionIndex];
    
    if (!currentAction) return;
    
    // 안전하게 parameters 배열 처리
    const currentParameters = Array.isArray(currentAction.parameters) ? currentAction.parameters : [];
    
    updatedActions[actionIndex] = {
      ...currentAction,
      parameters: currentParameters.filter((_, i) => i !== paramIndex)
    };
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

      {/* Search Bar */}
      <Card className="p-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="노드 이름 또는 ID로 검색..."
        />
      </Card>

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
          {isLoading && isEditing ? (
            <div className="flex items-center justify-center h-48">
              <LoadingSpinner size="md" text="노드 상세 정보 불러오는 중..." />
            </div>
          ) : (
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
                    onChange={(e) => setCurrentNode(prev => ({ ...prev, sequenceId: parseInt(e.target.value) || 0 }))}
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
                      onChange={(e) => setCurrentNode(prev => ({ 
                        ...prev, 
                        position: { ...prev.position, x: parseFloat(e.target.value) || 0.0 },
                        x: parseFloat(e.target.value) || 0.0
                      }))}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Y 좌표</label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentNode.position.y}
                      onChange={(e) => setCurrentNode(prev => ({ 
                        ...prev, 
                        position: { ...prev.position, y: parseFloat(e.target.value) || 0.0 },
                        y: parseFloat(e.target.value) || 0.0
                      }))}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Theta (회전)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentNode.position.theta}
                      onChange={(e) => setCurrentNode(prev => ({ 
                        ...prev, 
                        position: { ...prev.position, theta: parseFloat(e.target.value) || 0.0 },
                        theta: parseFloat(e.target.value) || 0.0
                      }))}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="form-label">허용 편차 XY</label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentNode.position.allowedDeviationXY}
                      onChange={(e) => setCurrentNode(prev => ({ 
                        ...prev, 
                        position: { ...prev.position, allowedDeviationXY: parseFloat(e.target.value) || 0.0 },
                        allowedDeviationXY: parseFloat(e.target.value) || 0.0
                      }))}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">허용 편차 Theta</label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentNode.position.allowedDeviationTheta}
                      onChange={(e) => setCurrentNode(prev => ({ 
                        ...prev, 
                        position: { ...prev.position, allowedDeviationTheta: parseFloat(e.target.value) || 0.0 },
                        allowedDeviationTheta: parseFloat(e.target.value) || 0.0
                      }))}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="form-label">맵 ID</label>
                  <select
                    value={currentNode.position.mapId}
                    onChange={(e) => setCurrentNode(prev => ({ 
                      ...prev, 
                      position: { ...prev.position, mapId: e.target.value },
                      mapId: e.target.value
                    }))}
                    className="form-input"
                  >
                    <option value="">없음</option>
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
                {(() => {
                  const currentActions = Array.isArray(currentNode?.actions) ? currentNode.actions : [];
                  if (currentActions.length === 0) {
                    return <p className="text-sm text-gray-500">이 노드에 대한 액션이 없습니다.</p>;
                  }
                  return currentActions.map((action, actionIndex) => (
                  <Card key={actionIndex} className="p-4 mb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <label className="form-label mb-0">액션 타입</label>
                          <select
                              value={action.actionType}
                              onChange={(e) => updateAction(actionIndex, 'actionType', e.target.value)}
                              className="form-input text-base py-4"
                          >
                              <option value="Roboligent Robin - Inference">Roboligent Robin - Inference</option>
                              <option value="Roboligent Robin - Follow Trajectory">Roboligent Robin - Follow Trajectory</option>
                          </select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <label className="form-label mb-0">액션 ID</label>
                            <input
                                type="text"
                                value={action.actionId}
                                onChange={(e) => updateAction(actionIndex, 'actionId', e.target.value)}
                                className="form-input text-base py-4"
                                placeholder="액션 ID"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="form-label mb-0">설명</label>
                          <input
                              type="text"
                              value={action.actionDescription || ''}
                              onChange={(e) => updateAction(actionIndex, 'actionDescription', e.target.value)}
                              className="form-input text-base py-4"
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
                        {/* 매개변수 목록 - 안전하게 처리 */}
                        {(() => {
                          const parameters = action?.parameters || [];
                          if (!Array.isArray(parameters) || parameters.length === 0) {
                            return <p className="text-xs text-gray-500 ml-4">매개변수 없음</p>;
                          }
                          return parameters.map((param, paramIndex) => (
                            <div key={paramIndex} className="grid grid-cols-12 gap-2 mb-1 items-center ml-4">
                                <input
                                    type="text"
                                    value={param?.key || ''}
                                    onChange={(e) => updateParameter(actionIndex, paramIndex, 'key', e.target.value)}
                                    className="form-input col-span-4 text-xs py-1"
                                    placeholder="키"
                                />
                                <input
                                    type="text"
                                    value={param?.value || ''}
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
                          ));
                        })()}
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
                  ));
                })()}
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
            </div>
          )}
        </Card>
      )}

      {/* 노드 목록 */}
      {(() => {
        const safeNodes = Array.isArray(nodes) ? nodes : [];
        if (isLoading && safeNodes.length === 0) {
          return (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" text="노드 목록을 불러오는 중..." />
            </div>
          );
        }
        
        if (safeNodes.length === 0) {
          return (
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
          );
        }
        
        return (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {safeNodes.map((node) => {
              // 각 노드 객체도 안전하게 처리
              if (!node || typeof node.id === 'undefined') {
                return null;
              }
              
              return (
                <Card key={node.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="primary">{node.name || '이름 없음'}</Badge>
                    <span className="text-sm text-gray-500">ID: {node.nodeId || 'N/A'}</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{node.description || '설명 없음'}</h3>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>시퀀스: <Badge variant="secondary" size="sm">{node.sequenceId || 0}</Badge></p>
                    <p>위치: ({(node.x || 0).toFixed(2)}, {(node.y || 0).toFixed(2)}) on {node.mapId || 'N/A'}</p>
                    <p>릴리스됨: <Badge variant={node.released ? 'success' : 'warning'} size="sm">
                      {node.released ? '예' : '아니오'}
                    </Badge></p>
                    <p>액션 수: {(() => {
                      try {
                        return node.actionTemplateIds ? JSON.parse(node.actionTemplateIds).length : 0;
                      } catch {
                        return 0;
                      }
                    })()}</p>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      leftIcon={<Edit className="w-3 h-3" />}
                      onClick={() => handleEditNode(node)}
                      disabled={isLoading}
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
              );
            }).filter(Boolean)}
          </div>
        );
      })()}

      {/* 결과 수 표시 */}
      {(() => {
        const safeNodes = Array.isArray(nodes) ? nodes : [];
        if (safeNodes.length > 0) {
          return (
            <div className="text-center text-sm text-gray-500">
              총 {safeNodes.length}개의 노드
            </div>
          );
        }
        return null;
      })()}
    </div>
  )
}

export default Nodes