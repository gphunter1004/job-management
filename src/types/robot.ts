// Robot base interface
export interface Robot {
  serialNumber: string
  manufacturer: string
  isOnline: boolean
  lastSeen: string
  version?: string
}

// Robot state interface matching the MQTT Bridge API
export interface RobotState {
  actionStates: ActionState[]
  agvPosition: AgvPosition
  batteryState: BatteryState
  distanceSinceLastNode: number
  driving: boolean
  edgeStates: any[]
  errors: any[]
  headerId: number
  information: any[]
  lastNodeId: string
  lastNodeSequenceId: number
  manufacturer: string
  newBaseRequest: boolean
  operatingMode: string
  orderId: string
  orderUpdateId: number
  paused: boolean
  safetyState: SafetyState
  serialNumber: string
  timestamp: string
  velocity: Velocity
  version: string
}

export interface ActionState {
  actionDescription: string
  actionId: string
  actionStatus: string
  actionType: string
  resultDescription: string
}

export interface AgvPosition {
  deviationRange: number
  localizationScore: number
  mapDescription: string
  mapId: string
  positionInitialized: boolean
  theta: number
  x: number
  y: number
}

export interface BatteryState {
  batteryCharge: number
  batteryHealth: number
  batteryVoltage: number
  charging: boolean
  reach: number
}

export interface SafetyState {
  eStop: string
  fieldViolation: boolean
}

export interface Velocity {
  omega: number
  vx: number
  vy: number
}

// Robot health interface
export interface RobotHealth {
  serialNumber: string
  isOnline: boolean
  batteryCharge: number
  batteryVoltage: number
  isCharging: boolean
  positionInitialized: boolean
  hasErrors: boolean
  errorCount: number
  operatingMode: string
  isPaused: boolean
  isDriving: boolean
  lastUpdate: string
}

// Robot capabilities interface
export interface RobotCapabilities {
  serialNumber: string
  physicalParameters: PhysicalParameters
  typeSpecification: TypeSpecification
  availableActions: AvailableAction[]
}

export interface PhysicalParameters {
  id: number
  serialNumber: string
  accelerationMax: number
  decelerationMax: number
  heightMax: number
  heightMin: number
  length: number
  speedMax: number
  speedMin: number
  width: number
  createdAt: string
  updatedAt: string
}

export interface TypeSpecification {
  id: number
  serialNumber: string
  agvClass: string
  agvKinematics: string
  localizationTypes: string
  maxLoadMass: number
  navigationTypes: string
  seriesDescription: string
  seriesName: string
  createdAt: string
  updatedAt: string
}

export interface AvailableAction {
  id: number
  serialNumber: string
  actionType: string
  actionDescription: string
  actionScopes: string
  resultDescription: string
  createdAt: string
  updatedAt: string
  parameters: ActionParameter[]
}

export interface ActionParameter {
  id: number
  agvActionId: number
  key: string
  description: string
  isOptional: boolean
  valueDataType: string
}

// Robot connection history
export interface RobotConnectionHistory {
  id: number
  serialNumber: string
  connectionState: string
  headerId: number
  timestamp: string
  version: string
  manufacturer: string
  createdAt: string
  updatedAt: string
}

// Connection states
export enum ConnectionState {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE'
}

// Operating modes
export enum OperatingMode {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
  MAINTENANCE = 'MAINTENANCE',
  ERROR = 'ERROR',
  IDLE = 'IDLE',
  CHARGING = 'CHARGING'
}

// Robot status derived from state
export interface RobotStatus {
  serialNumber: string
  connectionState: ConnectionState
  operatingMode: OperatingMode
  batteryLevel: number
  isCharging: boolean
  hasErrors: boolean
  errorCount: number
  currentOrder?: string
  lastActivity: string
  positionInitialized: boolean
  isDriving: boolean
  isPaused: boolean
}

// Filter and query types
export interface RobotFilter {
  status?: ConnectionState
  manufacturer?: string
  hasErrors?: boolean
  batteryLevel?: {
    min?: number
    max?: number
  }
  search?: string
}

export interface RobotMetrics {
  totalRobots: number
  onlineRobots: number
  offlineRobots: number
  robotsWithErrors: number
  averageBatteryLevel: number
  activeOrders: number
}

// Robot command types
export interface RobotCommand {
  type: 'order' | 'action' | 'emergency_stop' | 'pause' | 'resume'
  payload: any
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  timeout?: number
}

export interface EmergencyStopCommand {
  type: 'emergency_stop'
  reason: string
  immediate: boolean
}

export interface PauseResumeCommand {
  type: 'pause' | 'resume'
  reason?: string
}

// Real-time updates
export interface RobotStateUpdate {
  serialNumber: string
  timestamp: string
  changes: Partial<RobotState>
}

export interface RobotEvent {
  id: string
  serialNumber: string
  eventType: 'connection' | 'state_change' | 'error' | 'order_update' | 'battery_alert'
  timestamp: string
  data: any
  severity: 'info' | 'warning' | 'error' | 'critical'
}

// Robot performance metrics
export interface RobotPerformanceMetrics {
  serialNumber: string
  uptime: number // in hours
  totalOrders: number
  completedOrders: number
  failedOrders: number
  averageOrderTime: number // in minutes
  averageBatteryLife: number // in hours
  errorFrequency: number // errors per hour
  lastMaintenanceDate?: string
  nextMaintenanceDate?: string
}

// Robot location and navigation
export interface RobotLocation {
  serialNumber: string
  currentPosition: {
    x: number
    y: number
    theta: number
  }
  targetPosition?: {
    x: number
    y: number
    theta: number
  }
  mapId: string
  zone?: string
  floor?: string
  building?: string
}

// Robot sensor data
export interface RobotSensorData {
  serialNumber: string
  timestamp: string
  sensors: {
    lidar?: number[]
    camera?: boolean
    ultrasonic?: number[]
    imu?: {
      acceleration: { x: number, y: number, z: number }
      gyroscope: { x: number, y: number, z: number }
    }
    temperature?: number
    humidity?: number
  }
}

// Export all types
export type {
  Robot,
  RobotState,
  RobotHealth,
  RobotCapabilities,
  RobotConnectionHistory,
  RobotStatus,
  RobotFilter,
  RobotMetrics,
  RobotCommand,
  RobotStateUpdate,
  RobotEvent,
  RobotPerformanceMetrics,
  RobotLocation,
  RobotSensorData,
  ActionState,
  AgvPosition,
  BatteryState,
  SafetyState,
  Velocity,
  PhysicalParameters,
  TypeSpecification,
  AvailableAction,
  ActionParameter
}