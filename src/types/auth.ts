// User interface
export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  role: UserRole
  permissions: Permission[]
  avatar?: string
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  isActive: boolean
}

// User roles
export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
  TECHNICIAN = 'technician'
}

// Permissions
export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description?: string
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute'
}

export enum ResourceType {
  ROBOT = 'robot',
  ORDER = 'order',
  TEMPLATE = 'template',
  USER = 'user',
  SYSTEM = 'system'
}

// Authentication requests/responses
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  confirmPassword: string
  firstName?: string
  lastName?: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
  expiresIn: number
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ResetPasswordRequest {
  email: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  avatar?: string
}

// Auth state
export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  permissions: Permission[]
}

// Session info
export interface SessionInfo {
  id: string
  userId: string
  device: string
  browser: string
  ip: string
  location?: string
  createdAt: string
  lastAccessAt: string
  isActive: boolean
}

// API key management
export interface ApiKey {
  id: string
  name: string
  key: string
  permissions: Permission[]
  expiresAt?: string
  createdAt: string
  lastUsedAt?: string
  isActive: boolean
}

export interface CreateApiKeyRequest {
  name: string
  permissions: string[]
  expiresAt?: string
}

// Two-factor authentication
export interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export interface TwoFactorVerification {
  code: string
}

// Security settings
export interface SecuritySettings {
  twoFactorEnabled: boolean
  sessionTimeout: number
  allowMultipleSessions: boolean
  passwordExpireDays?: number
  requirePasswordChange: boolean
}

// Audit log
export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  details: Record<string, any>
  ip: string
  userAgent: string
  timestamp: string
}

export type {
  User,
  Permission,
  LoginCredentials,
  RegisterRequest,
  AuthResponse,
  AuthState,
  SessionInfo,
  ApiKey,
  CreateApiKeyRequest,
  TwoFactorSetup,
  SecuritySettings,
  AuditLog
}