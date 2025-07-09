import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { OrderExecution, OrderTemplate, OrderStatus } from '@/types/order'
import { ordersApi } from '@/api/orders'

interface OrdersState {
  orders: OrderExecution[]
  templates: OrderTemplate[]
  selectedOrder: OrderExecution | null
  selectedTemplate: OrderTemplate | null
  isLoading: boolean
  templatesLoading: boolean
  error: string | null
  pagination: {
    limit: number
    offset: number
    total: number
  }
}

const initialState: OrdersState = {
  orders: [],
  templates: [],
  selectedOrder: null,
  selectedTemplate: null,
  isLoading: false,
  templatesLoading: false,
  error: null,
  pagination: {
    limit: 20,
    offset: 0,
    total: 0,
  },
}

// Async thunks for order executions
export const fetchOrderExecutions = createAsyncThunk(
  'orders/fetchOrderExecutions',
  async (params?: { limit?: number; offset?: number; status?: string; serialNumber?: string }, { rejectWithValue }) => {
    try {
      const response = await ordersApi.getOrderExecutions(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders')
    }
  }
)

export const fetchOrderExecution = createAsyncThunk(
  'orders/fetchOrderExecution',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await ordersApi.getOrderExecution(orderId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order')
    }
  }
)

export const executeOrder = createAsyncThunk(
  'orders/executeOrder',
  async (data: { templateId: number; serialNumber: string; parameterOverrides?: Record<string, any> }, { rejectWithValue }) => {
    try {
      const response = await ordersApi.executeOrder(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to execute order')
    }
  }
)

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await ordersApi.cancelOrder(orderId)
      return { orderId, response: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order')
    }
  }
)

// Async thunks for order templates
export const fetchOrderTemplates = createAsyncThunk(
  'orders/fetchOrderTemplates',
  async (params?: { limit?: number; offset?: number }, { rejectWithValue }) => {
    try {
      const response = await ordersApi.getOrderTemplates(params)
      console.log('[fetchOrderTemplates] API 응답:', response)
      return response
    } catch (error: any) {
      console.error('[fetchOrderTemplates] API 오류:', error)
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch templates')
    }
  }
)

export const fetchOrderTemplate = createAsyncThunk(
  'orders/fetchOrderTemplate',
  async (templateId: number, { rejectWithValue }) => {
    try {
      const response = await ordersApi.getOrderTemplate(templateId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch template')
    }
  }
)

export const createOrderTemplate = createAsyncThunk(
  'orders/createOrderTemplate',
  async (data: { name: string; description?: string; nodeIds?: string[]; edgeIds?: string[] }, { rejectWithValue }) => {
    try {
      const response = await ordersApi.createOrderTemplate(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create template')
    }
  }
)

export const updateOrderTemplate = createAsyncThunk(
  'orders/updateOrderTemplate',
  async ({ id, data }: { id: number; data: { name: string; description?: string; nodeIds?: string[]; edgeIds?: string[] } }, { rejectWithValue }) => {
    try {
      const response = await ordersApi.updateOrderTemplate(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update template')
    }
  }
)

export const deleteOrderTemplate = createAsyncThunk(
  'orders/deleteOrderTemplate',
  async (templateId: number, { rejectWithValue }) => {
    try {
      await ordersApi.deleteOrderTemplate(templateId)
      return templateId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete template')
    }
  }
)

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setSelectedOrder: (state, action: PayloadAction<OrderExecution | null>) => {
      state.selectedOrder = action.payload
    },
    setSelectedTemplate: (state, action: PayloadAction<OrderTemplate | null>) => {
      state.selectedTemplate = action.payload
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: OrderStatus; errorMessage?: string }>) => {
      const { orderId, status, errorMessage } = action.payload
      const orderIndex = state.orders.findIndex(order => order.orderId === orderId)
      if (orderIndex !== -1) {
        state.orders[orderIndex].status = status
        if (errorMessage) {
          state.orders[orderIndex].errorMessage = errorMessage
        }
        if (status === OrderStatus.COMPLETED || status === OrderStatus.FAILED || status === OrderStatus.CANCELLED) {
          state.orders[orderIndex].completedAt = new Date().toISOString()
        }
      }
      if (state.selectedOrder?.orderId === orderId) {
        state.selectedOrder.status = status
        if (errorMessage) {
          state.selectedOrder.errorMessage = errorMessage
        }
      }
    },
    clearError: (state) => {
      state.error = null
    },
    setPagination: (state, action: PayloadAction<{ limit?: number; offset?: number }>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    // Fetch order executions
    builder
      .addCase(fetchOrderExecutions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOrderExecutions.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = action.payload.items
        state.pagination.total = action.payload.count
        state.error = null
      })
      .addCase(fetchOrderExecutions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch single order execution
    builder
      .addCase(fetchOrderExecution.fulfilled, (state, action) => {
        state.selectedOrder = action.payload
        const existingIndex = state.orders.findIndex(order => order.orderId === action.payload.orderId)
        if (existingIndex !== -1) {
          state.orders[existingIndex] = action.payload
        } else {
          state.orders.unshift(action.payload)
        }
      })
      .addCase(fetchOrderExecution.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Execute order
    builder
      .addCase(executeOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(executeOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders.unshift(action.payload)
        state.error = null
      })
      .addCase(executeOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Cancel order
    builder
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const { orderId } = action.payload
        const orderIndex = state.orders.findIndex(order => order.orderId === orderId)
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = OrderStatus.CANCELLED
          state.orders[orderIndex].completedAt = new Date().toISOString()
        }
        if (state.selectedOrder?.orderId === orderId) {
          state.selectedOrder.status = OrderStatus.CANCELLED
          state.selectedOrder.completedAt = new Date().toISOString()
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Fetch order templates - 여기가 수정된 부분입니다!
    builder
      .addCase(fetchOrderTemplates.pending, (state) => {
        state.templatesLoading = true
        state.error = null
        console.log('[fetchOrderTemplates] Pending 상태')
      })
      .addCase(fetchOrderTemplates.fulfilled, (state, action) => {
        state.templatesLoading = false
        console.log('[fetchOrderTemplates] Fulfilled 상태. Action payload:', action.payload)
        
        // 백엔드 응답 구조에 맞게 수정: data.items를 사용
        const responseData = action.payload.data || action.payload
        const templateItems = responseData.items || []
        
        console.log('[fetchOrderTemplates] 추출된 템플릿 배열:', templateItems)
        
        state.templates = Array.isArray(templateItems) ? templateItems : []
        state.pagination.total = responseData.count || 0
        state.error = null
        
        console.log('[fetchOrderTemplates] Redux 상태 업데이트 완료. 템플릿 개수:', state.templates.length)
      })
      .addCase(fetchOrderTemplates.rejected, (state, action) => {
        state.templatesLoading = false
        state.error = action.payload as string
        console.error('[fetchOrderTemplates] Rejected 상태:', action.payload)
      })

    // Fetch single order template
    builder
      .addCase(fetchOrderTemplate.fulfilled, (state, action) => {
        state.selectedTemplate = action.payload
        const existingIndex = state.templates.findIndex(template => template.id === action.payload.id)
        if (existingIndex !== -1) {
          state.templates[existingIndex] = action.payload
        } else {
          state.templates.push(action.payload)
        }
      })
      .addCase(fetchOrderTemplate.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Create order template
    builder
      .addCase(createOrderTemplate.pending, (state) => {
        state.templatesLoading = true
        state.error = null
      })
      .addCase(createOrderTemplate.fulfilled, (state, action) => {
        state.templatesLoading = false
        state.templates.unshift(action.payload)
        state.selectedTemplate = action.payload
        state.error = null
      })
      .addCase(createOrderTemplate.rejected, (state, action) => {
        state.templatesLoading = false
        state.error = action.payload as string
      })

    // Update order template
    builder
      .addCase(updateOrderTemplate.fulfilled, (state, action) => {
        const templateIndex = state.templates.findIndex(template => template.id === action.payload.id)
        if (templateIndex !== -1) {
          state.templates[templateIndex] = action.payload
        }
        if (state.selectedTemplate?.id === action.payload.id) {
          state.selectedTemplate = action.payload
        }
      })
      .addCase(updateOrderTemplate.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Delete order template
    builder
      .addCase(deleteOrderTemplate.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteOrderTemplate.fulfilled, (state, action) => {
        state.isLoading = false
        const templateId = action.payload
        state.templates = state.templates.filter(template => template.id !== templateId)
        if (state.selectedTemplate?.id === templateId) {
          state.selectedTemplate = null
        }
      })
      .addCase(deleteOrderTemplate.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  setSelectedOrder,
  setSelectedTemplate,
  updateOrderStatus,
  clearError,
  setPagination,
} = orderSlice.actions

export default orderSlice.reducer