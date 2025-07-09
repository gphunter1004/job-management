// src/api/actions.ts
import { api, buildQueryString, ApiResponse, ApiListResponse } from './client'
import { ActionTemplate, ActionParameterTemplate } from '@/types/order'

// API 요청/응답을 위한 인터페이스 (README.md 기반)
export interface CreateActionRequest {
  actionType: string
  actionId: string
  blockingType: string
  actionDescription?: string
  parameters?: Array<{ key: string; value: any; valueType: string }>
}

export interface UpdateActionRequest extends Partial<CreateActionRequest> {}

// getActions API의 새로운 응답 구조 (ApiResponse<T> 안에 items와 count가 있는 형태)
export interface GetActionsResponseData {
  items: ActionTemplate[]
  count: number
  limit?: number
  offset?: number
}

export interface CloneActionRequest {
  newActionId: string
}

// Action Template Management API
export const actionsApi = {
  // 액션 템플릿 생성
  createAction: (data: CreateActionRequest): Promise<ApiResponse<ActionTemplate>> =>
    api.post('/actions', data).then(response => response.data as ApiResponse<ActionTemplate>), // api.post는 AxiosResponse<T>를 반환하도록 가정

  // 액션 템플릿 목록 조회
  // 이제 Promise<AxiosResponse<GetActionsResponseData>>로 변경하고, .then에서 data 속성에 접근
  getActions: (params?: { 
    limit?: number; 
    offset?: number; 
    actionType?: string; 
    blockingType?: string; 
    search?: string 
  }): Promise<ApiResponse<GetActionsResponseData>> => { 
    const queryString = params ? `?${buildQueryString(params)}` : ''
    // api.get이 AxiosResponse<T>를 반환하므로, .then에서 response.data를 추출
    return api.get<ApiResponse<GetActionsResponseData>>(`/actions${queryString}`).then(response => response as ApiResponse<GetActionsResponseData>)
  },

  // 특정 액션 템플릿 조회 (Database ID)
  getActionById: (id: number): Promise<ApiResponse<ActionTemplate>> =>
    api.get<ApiResponse<ActionTemplate>>(`/actions/${id}`).then(response => response as ApiResponse<ActionTemplate>),

  // 특정 액션 템플릿 조회 (Action ID)
  getActionByActionId: (actionId: string): Promise<ApiResponse<ActionTemplate>> =>
    api.get<ApiResponse<ActionTemplate>>(`/actions/by-action-id/${actionId}`).then(response => response as ApiResponse<ActionTemplate>),

  // 액션 템플릿 수정
  updateAction: (id: number, data: UpdateActionRequest): Promise<ApiResponse<ActionTemplate>> =>
    api.put(`/actions/${id}`, data).then(response => response.data as ApiResponse<ActionTemplate>),

  // 액션 템플릿 삭제
  deleteAction: (id: number): Promise<ApiResponse> =>
    api.delete(`/actions/${id}`).then(response => response.data as ApiResponse),

  // 액션 템플릿 복제
  cloneAction: (id: number, data: CloneActionRequest): Promise<ApiResponse<{ clonedAction: ActionTemplate; message: string }>> =>
    api.post(`/actions/${id}/clone`, data).then(response => response.data as ApiResponse<{ clonedAction: ActionTemplate; message: string }>),

  // 액션 템플릿 검증 (TODO: 필요시 상세 구현)
  validateAction: (data: { actionType: string; parameters: any[]; serialNumber: string }): Promise<ApiResponse<any>> =>
    api.post('/actions/validate', data).then(response => response.data as ApiResponse<any>),

  // 액션 템플릿 일괄 삭제 (TODO: 필요시 상세 구현)
  bulkDeleteActions: (actionIds: number[]): Promise<ApiResponse<any>> =>
    api.post('/actions/bulk/delete', { actionIds }).then(response => response.data as ApiResponse<any>),

  // 액션 템플릿 일괄 복제 (TODO: 필요시 상세 구현)
  bulkCloneActions: (actionIds: number[], prefix: string): Promise<ApiResponse<any>> =>
    api.post('/actions/bulk/clone', { actionIds, prefix }).then(response => response.data as ApiResponse<any>),
}

export default actionsApi