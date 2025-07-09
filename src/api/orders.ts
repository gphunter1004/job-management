import { api, buildQueryString, ApiResponse, ApiListResponse } from './client'
import type { Order, OrderExecution, OrderTemplate } from '@/types/order'

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
  getOrderTemplates: (params?: { limit?: number, offset?: number }): Promise<ApiListResponse<OrderTemplate>> => {
    const queryString = params ? `?${buildQueryString(params)}` : ''
    return api.get(`/order-templates${queryString}`)
  },

  // Get order template by ID
  getOrderTemplate: (id: number): Promise<ApiResponse<OrderTemplate>> =>
    api.get(`/order-templates/${id}`),

  // Get order template with details (nodes and edges)
  getOrderTemplateWithDetails: (id: number): Promise<ApiResponse<any>> =>
    api.get(`/order-templates/${id}/details`),

  // Create new order template
  createOrderTemplate: (data: CreateOrderTemplateRequest): Promise<ApiResponse<OrderTemplate>> =>
    api.post('/order-templates', data),

  // Update order template
  updateOrderTemplate: (id: number, data: CreateOrderTemplateRequest): Promise<ApiResponse<OrderTemplate>> =>
    api.put(`/order-templates/${id}`, data),

  // Delete order template
  deleteOrderTemplate: (id: number): Promise<ApiResponse> =>
    api.delete(`/order-templates/${id}`),

  // Associate nodes with template
  associateNodes: (templateId: number, data: AssociateNodesRequest): Promise<ApiResponse> =>
    api.post(`/order-templates/${templateId}/associate-nodes`, data),

  // Associate edges with template
  associateEdges: (templateId: number, data: AssociateEdgesRequest): Promise<ApiResponse> =>
    api.post(`/order-templates/${templateId}/associate-edges`, data),
}

// Order Execution API
export const orderExecutionsApi = {
  // Execute an order
  executeOrder: (data: ExecuteOrderRequest): Promise<ApiResponse<OrderExecution>> =>
    api.post('/orders/execute', data),

  // Execute order by template ID and robot
  executeOrderByTemplate: (templateId: number, serialNumber: string, parameterOverrides?: Record<string, any>): Promise<ApiResponse<OrderExecution>> =>
    api.post(`/orders/execute/template/${templateId}/robot/${serialNumber}`, { parameterOverrides }),

  // Get all order executions
  getOrderExecutions: (params?: OrdersQueryParams): Promise<ApiListResponse<OrderExecution>> => {
    const queryString = params ? `?${buildQueryString(params)}` : ''
    return api.get(`/orders${queryString}`)
  },

  // Get order execution by ID
  getOrderExecution: (orderId: string): Promise<ApiResponse<OrderExecution>> =>
    api.get(`/orders/${orderId}`),

  // Get order executions for specific robot
  getRobotOrderExecutions: (serialNumber: string, params?: { limit?: number, offset?: number }): Promise<ApiListResponse<OrderExecution>> => {
    const queryString = params ? `?${buildQueryString(params)}` : ''
    return api.get(`/robots/${serialNumber}/orders${queryString}`)
  },

  // Cancel order execution
  cancelOrder: (orderId: string): Promise<ApiResponse> =>
    api.post(`/orders/${orderId}/cancel`),

  // Update order status (internal use)
  updateOrderStatus: (orderId: string, status: string, errorMessage?: string): Promise<ApiResponse> =>
    api.patch(`/orders/${orderId}/status`, { status, errorMessage }),
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
    return api.get(`/orders/statistics${queryString}`)
  },

  // Get recent orders
  getRecentOrders: (limit: number = 10): Promise<ApiListResponse<OrderExecution>> =>
    api.get(`/orders?limit=${limit}&orderBy=createdAt&order=desc`),

  // Get orders by status
  getOrdersByStatus: (status: string, params?: { limit?: number, offset?: number }): Promise<ApiListResponse<OrderExecution>> => {
    const queryParams = { status, ...params }
    const queryString = `?${buildQueryString(queryParams)}`
    return api.get(`/orders${queryString}`)
  },

  // Batch operations
  batchCancelOrders: (orderIds: string[]): Promise<ApiResponse<{
    successCount: number
    errorCount: number
    results: Array<{ orderId: string, status: 'success' | 'error', message: string }>
  }>> =>
    api.post('/orders/batch/cancel', { orderIds }),

  // Export orders
  exportOrders: (params?: OrdersQueryParams & { format?: 'csv' | 'excel' | 'json' }): Promise<Blob> => {
    const queryString = params ? `?${buildQueryString(params)}` : ''
    return api.get(`/orders/export${queryString}`, { responseType: 'blob' })
  },
}

export default ordersApi