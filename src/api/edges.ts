// src/api/edges.ts
import { api, buildQueryString, ApiResponse, ApiListResponse } from './client'
import { EdgeTemplate, ActionTemplate } from '@/types/order'

// API 요청/응답을 위한 인터페이스 (README.md 기반)
export interface CreateEdgeRequest {
  edgeId: string
  name: string
  description?: string
  sequenceId: number
  released: boolean
  startNodeId: string
  endNodeId: string
  actions: ActionTemplate[] // ActionTemplate 타입은 types/order.ts에 정의되어 있음
}

export interface UpdateEdgeRequest extends Partial<CreateEdgeRequest> {}

export interface EdgeListResponse { // README.md의 GET /edges 응답 구조에 맞춤
  edges: EdgeTemplate[]
  count: number
}

// Edge Management API
export const edgesApi = {
  // 엣지 생성
  createEdge: (data: CreateEdgeRequest): Promise<ApiResponse<EdgeTemplate>> =>
    api.post('/edges', data),

  // 엣지 목록 조회
  getEdges: (params?: { 
    limit?: number; 
    offset?: number; 
    search?: string; // README에 명시된 필터는 없지만, 확장성을 위해 추가 가능
  }): Promise<EdgeListResponse> => { 
    const queryString = params ? `?${buildQueryString(params)}` : ''
    return api.get(`/edges${queryString}`)
  },

  // 특정 엣지 조회 (Database ID)
  getEdgeById: (id: number): Promise<ApiResponse<EdgeTemplate>> =>
    api.get(`/edges/${id}`),

  // 특정 엣지 조회 (Edge ID)
  getEdgeByEdgeId: (edgeId: string): Promise<ApiResponse<EdgeTemplate>> =>
    api.get(`/edges/by-edge-id/${edgeId}`),

  // 엣지 수정
  updateEdge: (id: number, data: UpdateEdgeRequest): Promise<ApiResponse<EdgeTemplate>> =>
    api.put(`/edges/${id}`, data),

  // 엣지 삭제
  deleteEdge: (id: number): Promise<ApiResponse> =>
    api.delete(`/edges/${id}`),
}

export default edgesApi