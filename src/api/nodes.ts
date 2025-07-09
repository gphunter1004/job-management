// src/api/nodes.ts
import { api, buildQueryString, ApiResponse, ApiListResponse } from './client'
import { NodeTemplate, NodePosition, ActionTemplate, NodeWithActions } from '@/types/order'

// API 요청/응답을 위한 인터페이스 (README.md 기반)
export interface CreateNodeRequest {
  nodeId: string
  name: string
  description?: string
  sequenceId: number
  released: boolean
  position: NodePosition // NodePosition 타입은 types/order.ts에 정의되어 있음
  actions: ActionTemplate[] // ActionTemplate 타입은 types/order.ts에 정의되어 있음
}

export interface UpdateNodeRequest extends Partial<CreateNodeRequest> {}

export interface NodeListResponse { // README.md의 GET /nodes 응답 구조에 맞춤
  nodes: NodeTemplate[]
  count: number
}

// Node Management API
export const nodesApi = {
  // 노드 생성
  createNode: (data: CreateNodeRequest): Promise<ApiResponse<NodeTemplate>> =>
    api.post('/nodes', data),

  // 노드 목록 조회
  getNodes: (params?: { 
    limit?: number; 
    offset?: number; 
    search?: string; // README에 명시된 필터는 없지만, 확장성을 위해 추가 가능
  }): Promise<NodeListResponse> => { 
    const queryString = params ? `?${buildQueryString(params)}` : ''
    return api.get(`/nodes${queryString}`)
  },

  // 특정 노드 조회 (Database ID)
  getNodeById: (id: number): Promise<ApiResponse<NodeTemplate>> =>
    api.get(`/nodes/${id}`),

  // 특정 노드 조회 (Node ID)
  getNodeByNodeId: (nodeId: string): Promise<ApiResponse<NodeTemplate>> =>
    api.get(`/nodes/by-node-id/${nodeId}`),

  // 노드 수정
  updateNode: (id: number, data: UpdateNodeRequest): Promise<ApiResponse<NodeTemplate>> =>
    api.put(`/nodes/${id}`, data),

  // 노드 삭제
  deleteNode: (id: number): Promise<ApiResponse> =>
    api.delete(`/nodes/${id}`),
}

export default nodesApi