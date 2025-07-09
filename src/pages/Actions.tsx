import { useState, useEffect } from 'react'
import { Plus, Zap, Trash2, Edit, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/Loading'
import { ActionTemplate } from '@/types/order'
import { useAppSelector, useAppDispatch } from '@/store'
import { fetchActions, createAction, deleteAction, updateAction } from '@/store/slices/actionSlice'

const Actions = () => {
  const dispatch = useAppDispatch()
  const { actions, isLoading, error, filters, pagination } = useAppSelector(state => state.action)

  const [showCreateActionForm, setShowCreateActionForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentAction, setCurrentAction] = useState<ActionTemplate>({
    id: 0, 
    actionType: '',
    actionId: '',
    blockingType: 'NONE',
    actionDescription: '',
    parameters: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })

  useEffect(() => {
    dispatch(fetchActions({ 
      limit: pagination.limit, 
      offset: pagination.offset, 
      actionType: filters.actionType === 'all' ? undefined : filters.actionType,
      blockingType: filters.blockingType === 'all' ? undefined : filters.blockingType,
      search: filters.search === '' ? undefined : filters.search
    }))
  }, [dispatch, filters, pagination.limit, pagination.offset])

  const handleCreateOrUpdateAction = async () => {
    if (currentAction.actionType.trim() && currentAction.actionId.trim()) {
      try {
        if (isEditing) {
          const dataToSend = {
            ...currentAction,
            parameters: currentAction.parameters || [] 
          };
          await dispatch(updateAction({ id: currentAction.id, data: dataToSend })).unwrap()
        } else {
          await dispatch(createAction(currentAction)).unwrap()
        }
        resetForm()
        setShowCreateActionForm(false)
        setIsEditing(false)
        dispatch(fetchActions({ 
          limit: pagination.limit, offset: pagination.offset, 
          actionType: filters.actionType === 'all' ? undefined : filters.actionType,
          blockingType: filters.blockingType === 'all' ? undefined : filters.blockingType,
          search: filters.search === '' ? undefined : filters.search
        }))
      } catch (err) {
        console.error('액션 저장 실패:', err);
      }
    }
  }

  const handleDeleteAction = async (id: number) => {
    if (window.confirm('정말로 이 액션을 삭제하시겠습니까?')) {
      try {
        await dispatch(deleteAction(id)).unwrap()
        dispatch(fetchActions({ 
          limit: pagination.limit, offset: pagination.offset,
          actionType: filters.actionType === 'all' ? undefined : filters.actionType,
          blockingType: filters.blockingType === 'all' ? undefined : filters.blockingType,
          search: filters.search === '' ? undefined : filters.search
        }))
      } catch (err) {
        console.error('액션 삭제 실패:', err);
      }
    }
  }

  const handleEditAction = (action: ActionTemplate) => {
    setCurrentAction({ 
      ...action,
      parameters: action.parameters || [] 
    })
    setIsEditing(true)
    setShowCreateActionForm(true)
  }

  const resetForm = () => {
    setCurrentAction({
      id: 0,
      actionType: '',
      actionId: '',
      blockingType: 'NONE',
      actionDescription: '',
      parameters: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    setIsEditing(false)
  }

  const addParameter = () => {
    setCurrentAction(prev => ({
      ...prev,
      parameters: [
        ...prev.parameters,
        { 
          id: Date.now(), 
          actionTemplateId: prev.id, 
          key: '', 
          value: '', 
          valueType: 'string' 
        } 
      ]
    }))
  }

  const updateParameter = (index: number, field: string, value: any) => {
    const newParameters = [...currentAction.parameters]
    newParameters[index] = { ...newParameters[index], [field]: value }
    setCurrentAction(prev => ({ ...prev, parameters: newParameters }))
  }

  const removeParameter = (index: number) => {
    setCurrentAction(prev => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== index)
    }))
  }

  if (isLoading && actions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="액션 템플릿을 불러오는 중..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">액션 관리</h1>
          <p className="text-gray-600">
            재사용 가능한 액션 템플릿을 생성하고 관리합니다.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            resetForm()
            setShowCreateActionForm(true)
          }}
        >
          새 액션 생성
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

      {/* 액션 생성/수정 폼 */}
      {showCreateActionForm && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isEditing ? '액션 편집' : '새 액션 정의'}
          </h3>
          {isLoading && isEditing ? (
            <div className="flex items-center justify-center h-48">
              <LoadingSpinner size="md" text="액션 상세 정보 불러오는 중..." />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">액션 타입 *</label>
                  <select
                    value={currentAction.actionType}
                    onChange={(e) => setCurrentAction(prev => ({ ...prev, actionType: e.target.value }))}
                    className="form-input"
                    disabled={isEditing}
                  >
                    <option value="">액션 타입 선택...</option>
                    {/* value를 화면에 보이는 텍스트와 동일하게 변경합니다. */}
                    <option value="Roboligent Robin - Inference">Roboligent Robin - Inference</option>
                    <option value="Roboligent Robin - Follow Trajectory">Roboligent Robin - Follow Trajectory</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">액션 ID *</label>
                  <input
                    type="text"
                    value={currentAction.actionId}
                    onChange={(e) => setCurrentAction(prev => ({ ...prev, actionId: e.target.value }))}
                    className="form-input"
                    placeholder="예: inference_task_001"
                    disabled={isEditing}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">차단 타입</label>
                <select
                  value={currentAction.blockingType}
                  onChange={(e) => setCurrentAction(prev => ({ ...prev, blockingType: e.target.value }))}
                  className="form-input"
                >
                  <option value="HARD">하드 (차단)</option>
                  <option value="SOFT">소프트 (비차단)</option>
                  <option value="NONE">없음</option>
                </select>
              </div>

              <div>
                <label className="form-label">설명</label>
                <textarea
                  value={currentAction.actionDescription || ''}
                  onChange={(e) => setCurrentAction(prev => ({ ...prev, actionDescription: e.target.value }))}
                  className="form-input"
                  rows={2}
                  placeholder="액션에 대한 간단한 설명..."
                />
              </div>

              {/* 매개변수 섹션 */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">매개변수</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="w-3 h-3" />}
                    onClick={addParameter}
                  >
                    매개변수 추가
                  </Button>
                </div>
                {currentAction.parameters.length === 0 && (
                  <p className="text-sm text-gray-500">이 액션에 대한 매개변수가 없습니다.</p>
                )}
                {currentAction.parameters.map((param, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-1 items-center">
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={param.key}
                        onChange={(e) => updateParameter(index, 'key', e.target.value)}
                        className="form-input"
                        placeholder="키 (예: target_id)"
                      />
                    </div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => updateParameter(index, 'value', e.target.value)}
                        className="form-input"
                        placeholder="값 (예: shelf_01)"
                      />
                    </div>
                    <div className="col-span-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParameter(index)}
                        className="text-error-600 hover:text-error-700 w-full"
                        leftIcon={<Trash2 className="w-3 h-3" />}
                      >
                        제거
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setShowCreateActionForm(false)}>
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateOrUpdateAction}
              disabled={isLoading || !currentAction.actionType.trim() || !currentAction.actionId.trim()}
            >
              {isLoading ? '저장 중...' : isEditing ? '액션 수정' : '액션 생성'}
            </Button>
          </div>
        </Card>
      )}

      {/* 액션 목록 */}
      {actions.filter(action => action && typeof action.id === 'number' && typeof action.actionId === 'string').length === 0 && !isLoading ? (
        <Card className="p-12 text-center">
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">생성된 액션 없음</h3>
          <p className="text-gray-500 mb-6">
            새로운 액션을 생성하여 목록에 추가하세요.
          </p>
          <Button 
            variant="primary"
            onClick={() => {
              resetForm()
              setShowCreateActionForm(true)
            }}
          >
            첫 액션 생성
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {actions.filter(action => action && typeof action.id === 'number' && typeof action.actionId === 'string').map((action) => (
            <Card key={action.id} className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="primary">{action.actionType}</Badge>
                <span className="text-sm text-gray-500">ID: {action.actionId}</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{action.actionDescription || '설명 없음'}</h3>
              
              <div className="text-sm text-gray-600">
                <p>차단 타입: <Badge variant="secondary" size="sm">{action.blockingType}</Badge></p>
              </div>

              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  size="sm" 
                  leftIcon={<Edit className="w-3 h-3" />}
                  onClick={() => handleEditAction(action)}
                >
                  편집
                </Button>
                <Button 
                  variant="error" 
                  size="sm" 
                  leftIcon={<Trash2 className="w-3 h-3" />} 
                  onClick={() => handleDeleteAction(action.id)}
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

export default Actions