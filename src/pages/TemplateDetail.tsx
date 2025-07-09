import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store' // Redux hooks import
import { 
  fetchTemplateDetails, // fetchTemplateDetails thunk import
  updateNodeInTemplate, // 노드 업데이트 액션 (기존 코드에는 없지만, 나중에 필요할 수 있음)
  removeNodeFromTemplate, // 노드 삭제 액션
  addNodeToTemplate // 노드 추가 액션 (로컬 업데이트용)
} from '@/store/slices/templateSlice'
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
import CreateEdgeModal from '@/components/templates/CreateEdgeModal' 

// Edge 추가를 위한 새로운 모달 (아래에서 추가 예정)
// import CreateEdgeModal from '@/components/templates/CreateEdgeModal' 
import { NodeWithActions, EdgeWithActions } from '@/types/order' // 타입 import

const TemplateDetail = () => {
  const { templateId } = useParams<{ templateId: string }>()
  const dispatch = useAppDispatch()
  
  // Redux 스토어에서 템플릿 상세 정보와 로딩 상태를 가져옵니다.
  const { selectedTemplateDetails, isLoading, error } = useAppSelector(state => state.templates)

  const [showCreateNodeModal, setShowCreateNodeModal] = useState(false)
  const [showCreateEdgeModal, setShowCreateEdgeModal] = useState(false) // Edge 추가 모달 상태
  const [activeTab, setActiveTab] = useState<'overview' | 'nodes' | 'edges'>('overview')

  useEffect(() => {
    if (templateId) {
      dispatch(fetchTemplateDetails(parseInt(templateId)))
    }
  }, [dispatch, templateId])

  // 노드 추가 핸들러 (로컬 업데이트)
  const handleCreateNode = useCallback(async (nodeData: any) => {
    try {
      // 새로운 노드 객체를 생성합니다.
      const newNode: NodeWithActions = {
        nodeTemplate: {
          id: Date.now(), // 임시 ID
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
      
      // Redux 스토어에 로컬 노드 추가 액션을 디스패치합니다.
      // 이 액션은 현재 백엔드와 연동되지 않으며, UI 상의 즉각적인 반영을 위한 것입니다.
      dispatch(addNodeToTemplate(newNode))
      
      console.log('Node created (locally):', newNode)
      setShowCreateNodeModal(false) // 모달 닫기
    } catch (err) {
      console.error('Failed to create node locally:', err)
      // 에러 처리
    }
  }, [dispatch])

  // 노드 삭제 핸들러 (로컬 업데이트)
  const handleDeleteNode = useCallback((nodeId: string) => {
    if (window.confirm('정말로 이 노드를 삭제하시겠습니까?')) {
      dispatch(removeNodeFromTemplate(nodeId))
    }
  }, [dispatch])

  // 엣지 추가 핸들러 (로컬 업데이트)
  const handleCreateEdge = useCallback(async (edgeData: any) => {
    try {
      const newEdge: EdgeWithActions = {
        edgeTemplate: {
          id: Date.now(), // 임시 ID
          edgeId: edgeData.edgeId,
          name: edgeData.name,
          description: edgeData.description,
          sequenceId: edgeData.sequenceId,
          released: edgeData.released,
          startNodeId: edgeData.startNodeId,
          endNodeId: edgeData.endNodeId,
          actionTemplateIds: JSON.stringify(edgeData.actions.map((a: any) => a.actionId)),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        actions: edgeData.actions
      }

      // Redux 스토어에 로컬 엣지 추가 액션을 디스패치합니다.
      // 이 액션은 현재 백엔드와 연동되지 않으며, UI 상의 즉각적인 반영을 위한 것입니다.
      // templateSlice에 addEdgeToTemplate 액션이 정의되어 있어야 합니다.
      dispatch(addEdgeToTemplate(newEdge)) 

      console.log('Edge created (locally):', newEdge)
      setShowCreateEdgeModal(false) // 모달 닫기
    } catch (err) {
      console.error('Failed to create edge locally:', err)
      // 에러 처리
    }
  }, [dispatch])

  // templateId가 없을 경우
  if (!templateId) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">템플릿 ID가 필요합니다.</p>
        <Link to="/templates" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          ← 템플릿 목록으로 돌아가기
        </Link>
      </div>
    )
  }

  // 로딩 중이거나 데이터가 없을 경우
  if (isLoading || !selectedTemplateDetails?.template) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="템플릿 상세 정보를 불러오는 중..." />
      </div>
    )
  }

  // 에러 발생 시
  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center text-error-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>오류 발생: {error}</span>
        </div>
      </Card>
    )
  }

  const { template, nodes, edges } = selectedTemplateDetails

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/templates">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              뒤로
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
              <p className="text-gray-600">템플릿 상세 & 노드/엣지 관리</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" leftIcon={<Copy className="w-4 h-4" />}>
            복제
          </Button>
          <Button variant="outline" leftIcon={<Edit className="w-4 h-4" />}>
            템플릿 편집
          </Button>
          <Button variant="primary" leftIcon={<Play className="w-4 h-4" />}>
            실행
          </Button>
        </div>
      </div>

      {/* Template Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">템플릿 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">템플릿 ID</label>
            <p className="text-gray-900 font-mono">{template.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">이름</label>
            <p className="text-gray-900">{template.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">설명</label>
            <p className="text-gray-900">{template.description || '설명 없음'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">생성일</label>
            <p className="text-gray-900">{new Date(template.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">최종 업데이트</label>
            <p className="text-gray-900">{new Date(template.updatedAt).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">구성 요소</label>
            <div className="flex items-center space-x-4">
              <Badge variant="primary">{nodes.length} 노드</Badge>
              <Badge variant="secondary">{edges.length} 엣지</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: '개요', icon: Eye },
            { id: 'nodes', label: '노드', icon: MapPin, count: nodes.length },
            { id: 'edges', label: '엣지', icon: Target, count: edges.length }
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
              <h3 className="text-lg font-medium text-gray-900">템플릿 구조</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">노드</span>
                </div>
                <Badge variant="primary">{nodes.length}</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-secondary-600" />
                  <span className="font-medium">엣지</span>
                </div>
                <Badge variant="secondary">{edges.length}</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">빠른 작업</h3>
            <div className="space-y-3">
              <Button 
                variant="primary" 
                fullWidth
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreateNodeModal(true)}
              >
                새 노드 추가
              </Button>
              <Button 
                variant="outline" 
                fullWidth 
                leftIcon={<Target className="w-4 h-4" />}
                onClick={() => setShowCreateEdgeModal(true)} // 엣지 추가 모달 열기
              >
                새 엣지 추가
              </Button>
              <Button 
                variant="outline" 
                fullWidth 
                leftIcon={<Eye className="w-4 h-4" />}
                disabled // 현재 비활성화
                title="시각화 기능은 아직 구현되지 않았습니다."
              >
                템플릿 시각화
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'nodes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              노드 ({nodes.length})
            </h3>
            <Button 
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreateNodeModal(true)}
            >
              노드 추가
            </Button>
          </div>

          {nodes.length === 0 ? (
            <Card className="p-12 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">노드를 찾을 수 없습니다.</h4>
              <p className="text-gray-500 mb-6">
                템플릿 워크플로우를 구축하려면 첫 번째 노드를 추가하세요.
              </p>
              <Button 
                variant="primary"
                onClick={() => setShowCreateNodeModal(true)}
              >
                첫 노드 추가
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
                        {node.nodeTemplate.released ? '릴리스됨' : '초안'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">{node.nodeTemplate.description || '설명 없음'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">시퀀스:</span>
                        <span className="ml-1 font-medium">{node.nodeTemplate.sequenceId}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">액션:</span>
                        <span className="ml-1 font-medium">{node.actions?.length || 0}</span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="text-gray-500">위치:</span>
                      <span className="ml-1 font-mono">
                        ({node.nodeTemplate.x.toFixed(2)}, {node.nodeTemplate.y.toFixed(2)})
                      </span>
                    </div>

                    <div className="text-sm">
                      <span className="text-gray-500">맵:</span>
                      <span className="ml-1">{node.nodeTemplate.mapId}</span>
                    </div>

                    {node.actions && node.actions.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">액션:</p>
                        <div className="flex flex-wrap gap-1">
                          {node.actions.slice(0, 3).map((action: any, index: number) => (
                            <Badge key={index} variant="info" size="sm">
                              {action.actionType}
                            </Badge>
                          ))}
                          {node.actions.length > 3 && (
                            <Badge variant="secondary" size="sm">
                              +{node.actions.length - 3}개 더보기
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
                    <Button variant="outline" size="sm" leftIcon={<Edit className="w-3 h-3" />}>
                      편집
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      leftIcon={<Trash2 className="w-3 h-3" />}
                      onClick={() => handleDeleteNode(node.nodeTemplate.nodeId)}
                      className="text-error-600 hover:text-error-700"
                    >
                      삭제
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
              엣지 ({edges.length})
            </h3>
            <Button 
              variant="primary" 
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreateEdgeModal(true)} // 엣지 추가 버튼
            >
              엣지 추가
            </Button>
          </div>

          {edges.length === 0 ? (
            <Card className="p-12 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">엣지를 찾을 수 없습니다.</h4>
              <p className="text-gray-500 mb-6">
                엣지는 노드를 연결하여 워크플로우 경로를 만듭니다.
              </p>
              <Button 
                variant="primary"
                onClick={() => setShowCreateEdgeModal(true)} // 첫 엣지 추가 버튼
              >
                첫 엣지 추가
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {edges.map((edge) => (
                <Card key={edge.edgeTemplate.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary-100">
                        <Target className="w-6 h-6 text-secondary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{edge.edgeTemplate.name}</h4>
                        <p className="text-sm text-gray-500">{edge.edgeTemplate.edgeId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant={edge.edgeTemplate.released ? 'success' : 'warning'} size="sm">
                        {edge.edgeTemplate.released ? '릴리스됨' : '초안'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">{edge.edgeTemplate.description || '설명 없음'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">시퀀스:</span>
                        <span className="ml-1 font-medium">{edge.edgeTemplate.sequenceId}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">시작 노드:</span>
                        <span className="ml-1 font-medium">{edge.edgeTemplate.startNodeId}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">종료 노드:</span>
                        <span className="ml-1 font-medium">{edge.edgeTemplate.endNodeId}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">액션:</span>
                        <span className="ml-1 font-medium">{edge.actions?.length || 0}</span>
                      </div>
                    </div>

                    {edge.actions && edge.actions.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">액션:</p>
                        <div className="flex flex-wrap gap-1">
                          {edge.actions.slice(0, 3).map((action: any, index: number) => (
                            <Badge key={index} variant="info" size="sm">
                              {action.actionType}
                            </Badge>
                          ))}
                          {edge.actions.length > 3 && (
                            <Badge variant="secondary" size="sm">
                              +{edge.actions.length - 3}개 더보기
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
                    <Button variant="outline" size="sm" leftIcon={<Edit className="w-3 h-3" />}>
                      편집
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      leftIcon={<Trash2 className="w-3 h-3" />}
                      // TODO: 엣지 삭제 핸들러 구현
                      className="text-error-600 hover:text-error-700"
                    >
                      삭제
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Node Modal */}
      <CreateNodeModal
        isOpen={showCreateNodeModal}
        onClose={() => setShowCreateNodeModal(false)}
        onSave={handleCreateNode}
        isLoading={isLoading}
      />

      {/* Create Edge Modal */}
      {/* 이 모달은 다음 단계에서 새 파일로 추가될 것입니다. */}
      {showCreateEdgeModal && (
        <CreateEdgeModal
          isOpen={showCreateEdgeModal}
          onClose={() => setShowCreateEdgeModal(false)}
          onSave={handleCreateEdge}
          isLoading={isLoading}
          nodes={nodes} // 엣지 생성을 위해 현재 노드 목록을 전달합니다.
        />
      )}
    </div>
  )
}

export default TemplateDetail