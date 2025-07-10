// Order template types
export interface OrderTemplate {
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface OrderTemplateWithDetails {
  orderTemplate: OrderTemplate
  nodesWithActions: NodeWithActions[]
  edgesWithActions: EdgeWithActions[]
}

// Node and Edge types for templates
export interface NodeTemplate {
  id: number
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
  mapId?: string
  actionTemplateIds: string
  createdAt: string
  updatedAt: string
}
export interface EdgeTemplate {
  id: number
  edgeId: string
  name: string
  description: string
  sequenceId: number
  released: boolean
  startNodeId: string
  endNodeId: string
  actionTemplateIds: string // JSON array
  createdAt: string
  updatedAt: string
}

export interface ActionTemplate {
  id: number
  actionType: string
  actionId: string
  blockingType: string
  actionDescription: string
  createdAt: string
  updatedAt: string
  parameters: ActionParameterTemplate[]
}

export interface ActionParameterTemplate {
  id: number
  actionTemplateId: number
  key: string
  value: string // JSON string
  valueType: string // "string", "number", "boolean", "object"
}

export interface NodeWithActions {
  nodeTemplate: NodeTemplate
  actions: ActionTemplate[]
}

export interface EdgeWithActions {
  edgeTemplate: EdgeTemplate
  actions: ActionTemplate[]
}

// Order execution types
export interface OrderExecution {
  id: number
  orderId: string
  orderTemplateId?: number
  serialNumber: string
  orderUpdateId: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
  startedAt?: string
  completedAt?: string
  errorMessage?: string
}

export enum OrderStatus {
  CREATED = 'CREATED',
  SENT = 'SENT',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  EXECUTING = 'EXECUTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// MQTT order message types (for actual robot communication)
export interface NodePosition {
  x: number
  y: number
  theta: number
  allowedDeviationXY: number
  allowedDeviationTheta: number
  mapId: string
}

export interface ActionParameter {
  key: string
  value: any
}

export interface Action {
  actionType: string
  actionId: string
  blockingType: string
  actionParameters: ActionParameter[]
  actionDescription?: string
}

export interface Node {
  nodeId: string
  description: string
  sequenceId: number
  released: boolean
  nodePosition: NodePosition
  actions: Action[]
}

export interface Edge {
  edgeId: string
  sequenceId: number
  released: boolean
  startNodeId: string
  endNodeId: string
  actions: Action[]
}

export interface OrderMessage {
  headerId: number
  timestamp: string
  version: string
  manufacturer: string
  serialNumber: string
  orderId: string
  orderUpdateId: number
  nodes: Node[]
  edges: Edge[]
}

// Request/Response types
export interface CreateOrderTemplateRequest {
  name: string
  description?: string
  nodeIds?: string[]
  edgeIds?: string[]
}

export interface NodeTemplateRequest {
  nodeId: string
  name: string
  description: string
  sequenceId: number
  released: boolean
  position: NodePositionRequest
  actions: ActionTemplateRequest[]
}

export interface NodePositionRequest {
  x: number
  y: number
  theta: number
  allowedDeviationXY: number
  allowedDeviationTheta: number
  mapId: string
}

export interface EdgeTemplateRequest {
  edgeId: string
  name: string
  description: string
  sequenceId: number
  released: boolean
  startNodeId: string
  endNodeId: string
  actions: ActionTemplateRequest[]
}

export interface ActionTemplateRequest {
  actionType: string
  actionId: string
  blockingType: string
  actionDescription: string
  parameters: ActionParameterTemplateRequest[]
}

export interface ActionParameterTemplateRequest {
  key: string
  value: any
  valueType: string
}

export interface ExecuteOrderRequest {
  templateId: number
  serialNumber: string
  parameterOverrides?: Record<string, any>
}

export interface OrderExecutionResponse {
  orderId: string
  status: string
  serialNumber: string
  orderTemplateId?: number
  createdAt: string
}

// Filter and query types
export interface OrderFilter {
  status?: OrderStatus[]
  serialNumber?: string
  templateId?: number
  dateRange?: {
    from: string
    to: string
  }
  hasErrors?: boolean
}

export interface OrderStatistics {
  totalOrders: number
  completedOrders: number
  failedOrders: number
  activeOrders: number
  cancelledOrders: number
  averageExecutionTime: number // in seconds
  successRate: number // percentage
  todayOrders: number
  weekOrders: number
  monthOrders: number
}

// Order events and updates
export interface OrderEvent {
  id: string
  orderId: string
  eventType: 'created' | 'started' | 'completed' | 'failed' | 'cancelled' | 'error'
  timestamp: string
  data: any
  message?: string
}

export interface OrderUpdate {
  orderId: string
  status: OrderStatus
  timestamp: string
  message?: string
  progress?: number // 0-100
  currentNodeId?: string
  errorDetails?: any
}

// Batch operations
export interface BatchOrderOperation {
  orderIds: string[]
  operation: 'cancel' | 'retry' | 'delete'
  reason?: string
}

export interface BatchOrderResult {
  successCount: number
  errorCount: number
  results: Array<{
    orderId: string
    status: 'success' | 'error'
    message: string
  }>
}

// Export types
export type {
  OrderTemplate,
  OrderExecution,
  OrderMessage,
  Node,
  Edge,
  Action,
  NodePosition,
  ActionParameter,
  OrderFilter,
  OrderStatistics,
  OrderEvent,
  OrderUpdate
}