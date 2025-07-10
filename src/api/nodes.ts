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

// 백엔드 API가 NodePosition을 플랫 구조로 받는 경우를 위한 인터페이스
export interface CreateNodeRequestFlat {
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

export interface UpdateNodeRequest extends Partial<CreateNodeRequestFlat> {}

export interface NodeListResponse { // README.md의 GET /nodes 응답 구조에 맞춤
  nodes: NodeTemplate[]
  count: number
}

// Node Management API
export const nodesApi = {
  // 노드 생성
  createNode: (data: CreateNodeRequest | CreateNodeRequestFlat): Promise<ApiResponse<NodeTemplate>> => {
    console.log('[nodesApi.createNode] 요청 데이터:', data)
    
    // position 객체가 있으면 플랫 구조로 변환
    let requestData: CreateNodeRequestFlat
    if ('position' in data && data.position) {
      requestData = {
        nodeId: data.nodeId,
        name: data.name,
        description: data.description,
        sequenceId: data.sequenceId,
        released: data.released,
        x: data.position.x,
        y: data.position.y,
        theta: data.position.theta,
        allowedDeviationXY: data.position.allowedDeviationXY,
        allowedDeviationTheta: data.position.allowedDeviationTheta,
        mapId: data.position.mapId,
        actions: data.actions
      }
    } else {
      requestData = data as CreateNodeRequestFlat
    }
    
    console.log('[nodesApi.createNode] 변환된 요청 데이터:', requestData)
    return api.post('/nodes', requestData)
  },

  // 노드 목록 조회 - 수정된 부분
  getNodes: (params?: { 
    limit?: number; 
    offset?: number; 
    search?: string;
  }): Promise<NodeListResponse> => { 
    const queryString = params ? `?${buildQueryString(params)}` : ''
    console.log(`[nodesApi.getNodes] API 호출: /nodes${queryString}`)
    
    return api.get(`/nodes${queryString}`)
      .then(response => {
        console.log('[nodesApi.getNodes] API 응답:', response)
        
        if (response.data && response.data.items) {
          return {
            nodes: response.data.items,
            count: response.data.count || 0
          }
        } else if (Array.isArray(response)) {
          return {
            nodes: response,
            count: response.length
          }
        } else if (response.nodes) {
          return response
        } else {
          console.warn('[nodesApi.getNodes] 예상치 못한 응답 구조:', response)
          return {
            nodes: [],
            count: 0
          }
        }
      })
      .catch(error => {
        console.error('[nodesApi.getNodes] API 오류:', error)
        throw error
      })
  },

  // 특정 노드 조회 (Database ID)
  getNodeById: (id: number): Promise<ApiResponse<NodeTemplate>> => {
    console.log(`[nodesApi.getNodeById] API 호출: /nodes/${id}`)
    return api.get(`/nodes/${id}`)
      .then(response => {
        console.log('[nodesApi.getNodeById] API 응답:', response)
        return response
      })
      .catch(error => {
        console.error('[nodesApi.getNodeById] API 오류:', error)
        throw error
      })
  },

  // 특정 노드 조회 (Node ID)
  getNodeByNodeId: (nodeId: string): Promise<ApiResponse<NodeTemplate>> => {
    console.log(`[nodesApi.getNodeByNodeId] API 호출: /nodes/by-node-id/${nodeId}`)
    return api.get(`/nodes/by-node-id/${nodeId}`)
      .then(response => {
        console.log('[nodesApi.getNodeByNodeId] API 응답:', response)
        return response
      })
      .catch(error => {
        console.error('[nodesApi.getNodeByNodeId] API 오류:', error)
        throw error
      })
  },

  // 노드 수정
  updateNode: (id: number, data: UpdateNodeRequest): Promise<ApiResponse<NodeTemplate>> => {
    console.log(`[nodesApi.updateNode] API 호출: /nodes/${id}`, data)
    
    // position 객체가 있으면 플랫 구조로 변환
    let requestData: UpdateNodeRequest
    if ('position' in data && data.position) {
      const { position, ...rest } = data as any
      requestData = {
        ...rest,
        x: position.x,
        y: position.y,
        theta: position.theta,
        allowedDeviationXY: position.allowedDeviationXY,
        allowedDeviationTheta: position.allowedDeviationTheta,
        mapId: position.mapId,
      }
    } else {
      requestData = data
    }
    
    console.log('[nodesApi.updateNode] 변환된 요청 데이터:', requestData)
    
    return api.put(`/nodes/${id}`, requestData)
      .then(response => {
        console.log('[nodesApi.updateNode] API 응답:', response)
        return response
      })
      .catch(error => {
        console.error('[nodesApi.updateNode] API 오류:', error)
        throw error
      })
  },

  // 노드 삭제
  deleteNode: (id: number): Promise<ApiResponse> => {
    console.log(`[nodesApi.deleteNode] API 호출: /nodes/${id}`)
    return api.delete(`/nodes/${id}`)
      .then(response => {
        console.log('[nodesApi.deleteNode] API 응답:', response)
        return response
      })
      .catch(error => {
        console.error('[nodesApi.deleteNode] API 오류:', error)
        throw error
      })
  },
}

export default nodesApi