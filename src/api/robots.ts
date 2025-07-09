import { api, buildQueryString, ApiResponse, ApiListResponse } from './client'
import type { Robot, RobotState, RobotHealth, RobotCapabilities, RobotConnectionHistory } from '@/types/robot'

export interface RobotsQueryParams {
  limit?: number
  offset?: number
  status?: string
  manufacturer?: string
  search?: string
}

export interface SendOrderRequest {
  orderId: string
  orderUpdateId: number
  nodes: any[]
  edges: any[]
}

export interface SendActionRequest {
  actions: any[]
}

export interface InferenceOrderRequest {
  inferenceName: string
  position?: {
    x: number
    y: number
    theta: number
    allowedDeviationXY: number
    allowedDeviationTheta: number
    mapId: string
  }
}

export interface TrajectoryOrderRequest {
  trajectoryName: string
  arm: string
  position?: {
    x: number
    y: number
    theta: number
    allowedDeviationXY: number
    allowedDeviationTheta: number
    mapId: string
  }
}

export interface CustomInferenceOrderRequest extends InferenceOrderRequest {
  actionType?: string
  actionDescription?: string
  blockingType?: string
  customParameters?: Record<string, any>
  description?: string
  sequenceId?: number
  released?: boolean
  edges?: any[]
}

export interface CustomTrajectoryOrderRequest extends TrajectoryOrderRequest {
  actionType?: string
  actionDescription?: string
  blockingType?: string
  customParameters?: Record<string, any>
  description?: string
  sequenceId?: number
  released?: boolean
  edges?: any[]
}

export interface DynamicOrderRequest {
  orderUpdateId: number
  nodes: any[]
  edges: any[]
}

// Robot management API
export const robotsApi = {
  // Get all connected robots
  getConnectedRobots: (): Promise<ApiResponse<{ connectedRobots: string[], count: number }>> =>
    api.get('/robots'),

  // Get robot state
  getRobotState: (serialNumber: string): Promise<ApiResponse<RobotState>> =>
    api.get(`/robots/${serialNumber}/state`),

  // Get robot health
  getRobotHealth: (serialNumber: string): Promise<ApiResponse<RobotHealth>> =>
    api.get(`/robots/${serialNumber}/health`),

  // Get robot capabilities
  getRobotCapabilities: (serialNumber: string): Promise<ApiResponse<RobotCapabilities>> =>
    api.get(`/robots/${serialNumber}/capabilities`),

  // Get robot connection history
  getRobotConnectionHistory: (serialNumber: string, params?: { limit?: number, offset?: number }): Promise<ApiListResponse<RobotConnectionHistory>> => {
    const queryString = params ? `?${buildQueryString(params)}` : ''
    return api.get(`/robots/${serialNumber}/history${queryString}`)
  },

  // Basic robot control
  sendOrder: (serialNumber: string, orderData: SendOrderRequest): Promise<ApiResponse> =>
    api.post(`/robots/${serialNumber}/order`, orderData),

  sendCustomAction: (serialNumber: string, actionData: SendActionRequest): Promise<ApiResponse> =>
    api.post(`/robots/${serialNumber}/action`, actionData),

  // Multi-transport robot control
  sendOrderWithTransport: (serialNumber: string, orderData: SendOrderRequest, transport: string): Promise<ApiResponse> =>
    api.post(`/robots/${serialNumber}/order/transport?transport=${transport}`, orderData),

  sendActionWithTransport: (serialNumber: string, actionData: SendActionRequest, transport: string): Promise<ApiResponse> =>
    api.post(`/robots/${serialNumber}/action/transport?transport=${transport}`, actionData),

  sendOrderViaHTTP: (serialNumber: string, orderData: SendOrderRequest): Promise<ApiResponse> =>
    api.post(`/robots/${serialNumber}/order/http`, orderData),

  sendOrderViaWebSocket: (serialNumber: string, orderData: SendOrderRequest): Promise<ApiResponse> =>
    api.post(`/robots/${serialNumber}/order/websocket`, orderData),

  sendActionViaHTTP: (serialNumber: string, actionData: SendActionRequest): Promise<ApiResponse> =>
    api.post(`/robots/${serialNumber}/action/http`, actionData),

  // Enhanced robot control - Simple
  sendInferenceOrder: (serialNumber: string, inferenceData: InferenceOrderRequest): Promise<ApiResponse> =>
    api.post(`/robots/${serialNumber}/inference`, inferenceData),

  sendTrajectoryOrder: (serialNumber: string, trajectoryData: TrajectoryOrderRequest): Promise<ApiResponse> =>
    api.post(`/robots/${serialNumber}/trajectory`, trajectoryData),

  sendInferenceOrderWithTransport: (serialNumber: string, inferenceData: InferenceOrderRequest, transport: string): Promise<ApiResponse> =>
    api.post(`/robots/${serialNumber}/inference/transport?transport=${transport}`, inferenceData),

  sendTrajectoryOrderWithTransport: (serialNumber: string, trajectoryData: TrajectoryOrderRequest, transport: string): Promise<ApiResponse> =>
    api.post(`/robots/${serialNumber}/trajectory/transport?transport=${transport}`, trajectoryData),

  // Enhanced robot control - With Position
  sendInferenceOrderWithPosition: (serialNumber: string, inferenceData: InferenceOrderRequest): Promise<ApiResponse> =>
    api.post(`/robots/${serialNumber}/inference/with-position`, inferenceData),

  sendTrajectoryOrderWithPosition: (serialNumber: string, trajectoryData: TrajectoryOrderRequest): Promise<ApiResponse> =>
    api.post(`/robots/${serialNumber}/trajectory/with-position`, trajectoryData),

  // Enhanced robot control - Fully Customizable
  sendCustomInferenceOrder: (serialNumber: string, inferenceData: CustomInferenceOrderRequest): Promise<ApiResponse> =>
    api.post(`/robots/${serialNumber}/inference/custom`, inferenceData),

  sendCustomTrajectoryOrder: (serialNumber: string, trajectoryData: CustomTrajectoryOrderRequest): Promise<ApiResponse> =>
    api.post(`/robots/${serialNumber}/trajectory/custom`, trajectoryData),

  sendDynamicOrder: (serialNumber: string, orderData: DynamicOrderRequest): Promise<ApiResponse> =>
    api.post(`/robots/${serialNumber}/order/dynamic`, orderData),
}

export default robotsApi