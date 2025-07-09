// src/api/orders.ts
import { api, buildQueryString, ApiResponse, ApiListResponse } from './client'
import type { Order, OrderExecution, OrderTemplate } from '@/types/order'
import { AxiosResponse } from 'axios'

export interface OrdersQueryParams {
  limit?: number
  offset?: number
  status?: string
  serialNumber?: string
  templateId?: number
  dateFrom?: string
  dateTo?: string
}

export interface CreateOrderTemplateRequest {
  name: string
  description?: string
  nodeIds?: string[]
  edgeIds?: string[]
}

export interface ExecuteOrderRequest {
  templateId: number
  serialNumber: string
  parameterOverrides?: Record<string, any>
}

export interface AssociateNodesRequest {
  nodeIds: string[]
}

export interface AssociateEdgesRequest {
  edgeIds: string[]
}

// Order Template Management API
export const orderTemplatesApi = {
  // Get all order templates
  // 여기가 수정된 부분입니다: 반환 타입이 Promise<ApiResponse<...>>로 변경되고, .data 속성에 접근하도록 합니다.
  getOrderTemplates: (params?: { limit?: number, offset?: number }): Promise<ApiResponse<{ templates: OrderTemplate[]; count: number; limit?: number; offset?: number; }>> => {
    const queryString = params ? `?${buildQueryString(params)}` : ''
    // api.get이 AxiosResponse<T>를 반환하므로 .then에서 response.data를 추출합니다.
    return api.get<ApiResponse<{ templates: OrderTemplate[]; count: number; limit?: number; offset?: number; }>>(`/order-templates${queryString}`).then(response => response.data);
  },

  // Get order template by ID
  getOrderTemplate: (id: number): Promise<ApiResponse<OrderTemplate>> =>
    api.get<ApiResponse<OrderTemplate>>(`/order-templates/${id}`).then(response => response.data),

  // Get order template with details (nodes and edges)
  getOrderTemplateWithDetails: (id: number): Promise<ApiResponse<any>> =>
    api.get<ApiResponse<any>>(`/order-templates/${id}/details`).then(response => response.data),

  // Create new order template
  createOrderTemplate: (data: CreateOrderTemplateRequest): Promise<ApiResponse<OrderTemplate>> =>
    api.post('/order-templates', data).then(response => response.data),

  // Update order template
  updateOrderTemplate: (id: number, data: CreateOrderTemplateRequest): Promise<ApiResponse<OrderTemplate>> =>
    api.put(`/order-templates/${id}`, data).then(response => response.data),

  // Delete order template
  deleteOrderTemplate: (id: number): Promise<ApiResponse> =>
    api.delete(`/order-templates/${id}`).then(response => response.data),

  // Associate nodes with template
  associateNodes: (templateId: number, data: AssociateNodesRequest): Promise<ApiResponse> =>
    api.post(`/order-templates/${templateId}/associate-nodes`, data).then(response => response.data),

  // Associate edges with template
  associateEdges: (templateId: number, data: AssociateEdgesRequest): Promise<ApiResponse> =>
    api.post(`/order-templates/${templateId}/associate-edges`, data).then(response => response.data),
}

// Order Execution API
export const orderExecutionsApi = {
  // Execute an order
  executeOrder: (data: ExecuteOrderRequest): Promise<ApiResponse<OrderExecution>> =>
    api.post('/orders/execute', data).then(response => response.data),

  // Execute order by template ID and robot
  executeOrderByTemplate: (templateId: number, serialNumber: string, parameterOverrides?: Record<string, any>): Promise<ApiResponse<OrderExecution>> =>
    api.post(`/orders/execute/template/${templateId}/robot/${serialNumber}`, { parameterOverrides }).then(response => response.data),

  // Get all order executions
  getOrderExecutions: (params?: OrdersQueryParams): Promise<ApiListResponse<OrderExecution>> => {
    const queryString = params ? `?${buildQueryString(params)}` : ''
    return api.get<ApiListResponse<OrderExecution>>(`/orders${queryString}`).then(response => response.data)
  },

  // Get order execution by ID
  getOrderExecution: (orderId: string): Promise<ApiResponse<OrderExecution>> =>
    api.get<ApiResponse<OrderExecution>>(`/orders/${orderId}`).then(response => response.data),

  // Get order executions for specific robot
  getRobotOrderExecutions: (serialNumber: string, params?: { limit?: number, offset?: number }): Promise<ApiListResponse<OrderExecution>> => {
    const queryString = params ? `?${buildQueryString(params)}` : ''
    return api.get<ApiListResponse<OrderExecution>>(`/robots/${serialNumber}/orders${queryString}`).then(response => response.data)
  },

  // Cancel order execution
  cancelOrder: (orderId: string): Promise<ApiResponse> =>
    api.post(`/orders/${orderId}/cancel`).then(response => response.data),

  // Update order status (internal use)
  updateOrderStatus: (orderId: string, status: string, errorMessage?: string): Promise<ApiResponse> =>
    api.patch(`/orders/${orderId}/status`, { status, errorMessage }).then(response => response.data),
}

// Combined orders API
export const ordersApi = {
  ...orderTemplatesApi,
  ...orderExecutionsApi,

  // Get order statistics
  getOrderStatistics: (params?: { 
    dateFrom?: string
    dateTo?: string 
    serialNumber?: string 
  }): Promise<ApiResponse<{
    totalOrders: number
    completedOrders: number
    failedOrders: number
    activeOrders: number
    averageExecutionTime: number
  }>> => {
    const queryString = params ? `?${buildQueryString(params)}` : ''
    return api.get<ApiResponse<any>>(`/orders/statistics${queryString}`).then(response => response.data)
  },

  // Get recent orders
  getRecentOrders: (limit: number = 10): Promise<ApiListResponse<OrderExecution>> =>
    api.get<ApiListResponse<OrderExecution>>(`/orders?limit=${limit}&orderBy=createdAt&order=desc`).then(response => response.data),

  // Get orders by status
  getOrdersByStatus: (status: string, params?: { limit?: number, offset?: number }): Promise<ApiListResponse<OrderExecution>> => {
    const queryParams = { status, ...params }
    const queryString = `?${buildQueryString(queryParams)}`
    return api.get<ApiListResponse<OrderExecution>>(`/orders${queryString}`).then(response => response.data)
  },

  // Batch operations
  batchCancelOrders: (orderIds: string[]): Promise<ApiResponse<{
    successCount: number
    errorCount: number
    results: Array<{ orderId: string, status: 'success' | 'error', message: string }>
  }>> =>
    api.post('/orders/batch/cancel', { orderIds }).then(response => response.data),

  // Export orders
  exportOrders: (params?: OrdersQueryParams & { format?: 'csv' | 'excel' | 'json' }): Promise<Blob> => {
    const queryString = params ? `?${buildQueryString(params)}` : ''
    return api.get<Blob>(`/orders/export${queryString}`, { responseType: 'blob' }).then(response => response.data)
  },
}

export default ordersApi