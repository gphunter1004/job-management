import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import toast from 'react-hot-toast'

import { store } from '@/store'
import { logout } from '@/store/slices/authSlice'

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const state = store.getState()
    const token = state.auth.token

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time in development
    if (import.meta.env.DEV && response.config.metadata) {
      const endTime = new Date()
      const duration = endTime.getTime() - response.config.metadata.startTime.getTime()
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`)
    }

    return response
  },
  (error) => {
    const { response, request } = error

    // Network error
    if (!response) {
      toast.error('Network error. Please check your connection.')
      return Promise.reject(error)
    }

    // HTTP errors
    switch (response.status) {
      case 401:
        // Unauthorized - logout user
        store.dispatch(logout())
        toast.error('Session expired. Please login again.')
        break

      case 403:
        toast.error('Access denied. You do not have permission for this action.')
        break

      case 404:
        toast.error('Resource not found.')
        break

      case 422:
        // Validation errors
        if (response.data?.errors) {
          const firstError = Object.values(response.data.errors)[0]
          toast.error(Array.isArray(firstError) ? firstError[0] : firstError)
        } else {
          toast.error('Validation failed.')
        }
        break

      case 429:
        toast.error('Too many requests. Please try again later.')
        break

      case 500:
        toast.error('Server error. Please try again later.')
        break

      case 503:
        toast.error('Service unavailable. Please try again later.')
        break

      default:
        // Generic error message
        const errorMessage = response.data?.message || `Request failed with status ${response.status}`
        toast.error(errorMessage)
    }

    return Promise.reject(error)
  }
)

// API response wrapper
export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  message: string
  data?: T
}

export interface ApiListResponse<T = any> extends ApiResponse<T> {
  items: T[]
  count: number
  limit?: number
  offset?: number
}

// Generic API methods
export const api = {
  // GET request
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<T>(url, config)
    return response.data
  },

  // POST request
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config)
    return response.data
  },

  // PUT request
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config)
    return response.data
  },

  // PATCH request
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config)
    return response.data
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<T>(url, config)
    return response.data
  },
}

// Utility functions for API calls
export const createApiEndpoint = (endpoint: string) => ({
  get: (id?: string | number) => api.get(`${endpoint}${id ? `/${id}` : ''}`),
  post: (data: any) => api.post(endpoint, data),
  put: (id: string | number, data: any) => api.put(`${endpoint}/${id}`, data),
  patch: (id: string | number, data: any) => api.patch(`${endpoint}/${id}`, data),
  delete: (id: string | number) => api.delete(`${endpoint}/${id}`),
})

// Query string builder
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)))
      } else {
        searchParams.set(key, String(value))
      }
    }
  })

  return searchParams.toString()
}

// File upload helper
export const uploadFile = async (url: string, file: File, onProgress?: (progress: number) => void): Promise<any> => {
  const formData = new FormData()
  formData.append('file', file)

  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    },
  })
}

// Download file helper
export const downloadFile = async (url: string, filename?: string): Promise<void> => {
  const response = await apiClient.get(url, {
    responseType: 'blob',
  })

  const blob = new Blob([response.data])
  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename || 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(downloadUrl)
}

// Request retry helper
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error as Error
      
      if (i === maxRetries) {
        throw lastError
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }

  throw lastError!
}

// Batch request helper
export const batchRequests = async <T>(
  requests: (() => Promise<T>)[],
  batchSize: number = 5
): Promise<T[]> => {
  const results: T[] = []
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(request => request()))
    results.push(...batchResults)
  }

  return results
}

export default apiClient