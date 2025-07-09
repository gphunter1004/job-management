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
    let response: AxiosResponse<T>;
    try {
      console.log(`[client.ts - api.get] Requesting: ${url}`);
      response = await apiClient.get<T>(url, config);
      console.log(`[client.ts - api.get] Response received for ${url}. Status: ${response.status}`);
      console.log(`[client.ts - api.get] Response data type: ${typeof response.data}`);
      console.log(`[client.ts - api.get] Response data value:`, response.data);
      console.log(`[client.ts - api.get] Response headers['content-type']:`, response.headers['content-type']);
      
      // Axios가 response.data를 자동으로 파싱하지 못했을 경우를 대비하여 rawResponseText를 확인합니다.
      const rawResponseText = (response.request as any)?.responseText;
      if (rawResponseText) {
          console.log(`[client.ts - api.get] Raw response text snippet: ${rawResponseText.substring(0, Math.min(rawResponseText.length, 200))}...`);
      } else {
          console.log(`[client.ts - api.get] No raw response text available.`);
      }

    } catch (error: any) {
      console.error(`[client.ts - api.get] Request to ${url} failed in try-catch block:`, error);
      throw error; 
    }
    
    // 여기가 수정된 부분입니다: response.data가 null/undefined일 경우를 방어적으로 처리
    if ((response.status >= 200 && response.status < 300) && (response.data === null || response.data === undefined)) {
      console.warn(`[client.ts - api.get] Response data is null/undefined for URL ${url}. Status: ${response.status}. Content-Type: ${response.headers['content-type']}. Attempting manual parse if text available.`);
      
      const contentType = response.headers['content-type'];
      const rawResponseText = (response.request as any)?.responseText;
      
      if (contentType && contentType.includes('application/json') && rawResponseText) {
        try {
          console.log("[client.ts - api.get] Attempting manual JSON parse from raw text...");
          const parsedData = JSON.parse(rawResponseText);
          console.log("[client.ts - api.get] Manual JSON parse successful:", parsedData);
          return parsedData;
        } catch (e) {
          console.error("[client.ts - api.get] Manual JSON parse failed:", e);
          return {} as T;
        }
      }
      
      console.warn("[client.ts - api.get] No JSON content type or raw text available for manual parse. Returning empty object.");
      return {} as T; 
    }
    
    return response.data;
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