import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ordersApi } from '@/api/orders'

// Dashboard statistics interfaces
interface DashboardMetrics {
  totalRobots: number
  onlineRobots: number
  offlineRobots: number
  robotsWithErrors: number
  averageBatteryLevel: number
  totalOrders: number
  activeOrders: number
  completedOrders: number
  failedOrders: number
  orderSuccessRate: number
  averageOrderTime: number
  systemUptime: number
  lastUpdated: string
}

interface SystemAlert {
  id: string
  type: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
  robotId?: string
  orderId?: string
}

interface RealtimeData {
  timestamp: string
  robotCount: number
  onlineRobots: number
  averageBattery: number
  activeOrders: number
  errorCount: number
}

interface DashboardState {
  metrics: DashboardMetrics
  alerts: SystemAlert[]
  realtimeData: RealtimeData[]
  isLoading: boolean
  metricsLoading: boolean
  error: string | null
  refreshInterval: number // in seconds
  lastRefresh: string | null
  selectedTimeRange: '1h' | '6h' | '24h' | '7d' | '30d'
  autoRefresh: boolean
}

const initialState: DashboardState = {
  metrics: {
    totalRobots: 0,
    onlineRobots: 0,
    offlineRobots: 0,
    robotsWithErrors: 0,
    averageBatteryLevel: 0,
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    failedOrders: 0,
    orderSuccessRate: 0,
    averageOrderTime: 0,
    systemUptime: 0,
    lastUpdated: new Date().toISOString(),
  },
  alerts: [],
  realtimeData: [],
  isLoading: false,
  metricsLoading: false,
  error: null,
  refreshInterval: 30,
  lastRefresh: null,
  selectedTimeRange: '24h',
  autoRefresh: true,
}

// Async thunks
export const fetchDashboardMetrics = createAsyncThunk(
  'dashboard/fetchMetrics',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { dashboard: DashboardState }
      const timeRange = state.dashboard.selectedTimeRange

      // Calculate date range based on selected time
      const endDate = new Date()
      const startDate = new Date()
      
      switch (timeRange) {
        case '1h':
          startDate.setHours(startDate.getHours() - 1)
          break
        case '6h':
          startDate.setHours(startDate.getHours() - 6)
          break
        case '24h':
          startDate.setDate(startDate.getDate() - 1)
          break
        case '7d':
          startDate.setDate(startDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(startDate.getDate() - 30)
          break
      }

      try {
        // Try to fetch from API first
        const orderStats = await ordersApi.getOrderStatistics({
          dateFrom: startDate.toISOString(),
          dateTo: endDate.toISOString(),
        })

        const metrics: DashboardMetrics = {
          totalRobots: 0, // Will be populated from robot state
          onlineRobots: 0, // Will be populated from robot state
          offlineRobots: 0, // Will be populated from robot state
          robotsWithErrors: 0, // Will be populated from robot state
          averageBatteryLevel: 0, // Will be populated from robot state
          totalOrders: orderStats.data?.totalOrders || 0,
          activeOrders: orderStats.data?.activeOrders || 0,
          completedOrders: orderStats.data?.completedOrders || 0,
          failedOrders: orderStats.data?.failedOrders || 0,
          orderSuccessRate: orderStats.data?.totalOrders > 0 
            ? Math.round((orderStats.data?.completedOrders || 0) / orderStats.data.totalOrders * 100)
            : 0,
          averageOrderTime: orderStats.data?.averageExecutionTime || 0,
          systemUptime: Date.now() - new Date('2024-01-01').getTime(),
          lastUpdated: new Date().toISOString(),
        }

        return metrics
      } catch (apiError) {
        // If API fails, return mock data
        console.warn('API not available, using mock data')
        
        const metrics: DashboardMetrics = {
          totalRobots: 0, // Will be populated from robot state
          onlineRobots: 0, // Will be populated from robot state
          offlineRobots: 0, // Will be populated from robot state
          robotsWithErrors: 0, // Will be populated from robot state
          averageBatteryLevel: 0, // Will be populated from robot state
          totalOrders: 0,
          activeOrders: 0,
          completedOrders: 0,
          failedOrders: 0,
          orderSuccessRate: 0,
          averageOrderTime: 0,
          systemUptime: Date.now() - new Date('2024-01-01').getTime(),
          lastUpdated: new Date().toISOString(),
        }

        return metrics
      }
    } catch (error: any) {
      return rejectWithValue('Failed to fetch dashboard metrics')
    }
  }
)

export const fetchSystemAlerts = createAsyncThunk(
  'dashboard/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      // This would typically come from a dedicated alerts API
      // For now, we'll return mock alerts
      const alerts: SystemAlert[] = [
        {
          id: '1',
          type: 'warning',
          title: 'Low Battery Alert',
          message: 'Robot R003 battery level is below 15%',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          acknowledged: false,
          robotId: 'R003',
        },
        {
          id: '2',
          type: 'error',
          title: 'Robot Connection Lost',
          message: 'Robot R005 has lost connection',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          acknowledged: false,
          robotId: 'R005',
        },
        {
          id: '3',
          type: 'info',
          title: 'Order Completed',
          message: 'Order ORD-2024-001 has been completed successfully',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          acknowledged: true,
          orderId: 'ORD-2024-001',
        },
      ]

      return alerts
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch system alerts')
    }
  }
)

export const fetchRealtimeData = createAsyncThunk(
  'dashboard/fetchRealtimeData',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { dashboard: DashboardState }
      const timeRange = state.dashboard.selectedTimeRange

      // Generate mock realtime data points
      const now = new Date()
      const dataPoints: RealtimeData[] = []
      const intervals = timeRange === '1h' ? 60 : timeRange === '6h' ? 36 : timeRange === '24h' ? 24 : 48

      for (let i = intervals; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * (timeRange === '1h' ? 60000 : timeRange === '6h' ? 600000 : 3600000))
        
        dataPoints.push({
          timestamp: timestamp.toISOString(),
          robotCount: Math.floor(Math.random() * 10) + 15,
          onlineRobots: Math.floor(Math.random() * 8) + 12,
          averageBattery: Math.floor(Math.random() * 40) + 50,
          activeOrders: Math.floor(Math.random() * 5) + 2,
          errorCount: Math.floor(Math.random() * 3),
        })
      }

      return dataPoints
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch realtime data')
    }
  }
)

export const acknowledgeAlert = createAsyncThunk(
  'dashboard/acknowledgeAlert',
  async (alertId: string, { rejectWithValue }) => {
    try {
      // This would typically make an API call to acknowledge the alert
      // For now, we'll just return the alertId
      return alertId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to acknowledge alert')
    }
  }
)

export const dismissAlert = createAsyncThunk(
  'dashboard/dismissAlert',
  async (alertId: string, { rejectWithValue }) => {
    try {
      // This would typically make an API call to dismiss the alert
      // For now, we'll just return the alertId
      return alertId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to dismiss alert')
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateMetricsFromRobotData: (state, action: PayloadAction<{
      totalRobots: number
      onlineRobots: number
      robotsWithErrors: number
      averageBatteryLevel: number
    }>) => {
      const { totalRobots, onlineRobots, robotsWithErrors, averageBatteryLevel } = action.payload
      state.metrics.totalRobots = totalRobots
      state.metrics.onlineRobots = onlineRobots
      state.metrics.offlineRobots = totalRobots - onlineRobots
      state.metrics.robotsWithErrors = robotsWithErrors
      state.metrics.averageBatteryLevel = averageBatteryLevel
      state.metrics.lastUpdated = new Date().toISOString()
    },
    addRealtimeDataPoint: (state, action: PayloadAction<RealtimeData>) => {
      state.realtimeData.push(action.payload)
      // Keep only last 100 data points to prevent memory issues
      if (state.realtimeData.length > 100) {
        state.realtimeData = state.realtimeData.slice(-100)
      }
    },
    addSystemAlert: (state, action: PayloadAction<Omit<SystemAlert, 'id' | 'timestamp' | 'acknowledged'>>) => {
      const newAlert: SystemAlert = {
        ...action.payload,
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      }
      state.alerts.unshift(newAlert)
      // Keep only last 50 alerts
      if (state.alerts.length > 50) {
        state.alerts = state.alerts.slice(0, 50)
      }
    },
    setTimeRange: (state, action: PayloadAction<DashboardState['selectedTimeRange']>) => {
      state.selectedTimeRange = action.payload
    },
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefresh = action.payload
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    markRefresh: (state) => {
      state.lastRefresh = new Date().toISOString()
    },
    clearAlerts: (state) => {
      state.alerts = []
    },
    clearRealtimeData: (state) => {
      state.realtimeData = []
    },
  },
  extraReducers: (builder) => {
    // Fetch dashboard metrics
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.metricsLoading = true
        state.error = null
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.metricsLoading = false
        state.metrics = { ...state.metrics, ...action.payload }
        state.lastRefresh = new Date().toISOString()
        state.error = null
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.metricsLoading = false
        state.error = action.payload as string
      })

    // Fetch system alerts
    builder
      .addCase(fetchSystemAlerts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSystemAlerts.fulfilled, (state, action) => {
        state.isLoading = false
        state.alerts = action.payload
        state.error = null
      })
      .addCase(fetchSystemAlerts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch realtime data
    builder
      .addCase(fetchRealtimeData.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchRealtimeData.fulfilled, (state, action) => {
        state.isLoading = false
        state.realtimeData = action.payload
        state.error = null
      })
      .addCase(fetchRealtimeData.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Acknowledge alert
    builder
      .addCase(acknowledgeAlert.fulfilled, (state, action) => {
        const alertIndex = state.alerts.findIndex(alert => alert.id === action.payload)
        if (alertIndex !== -1) {
          state.alerts[alertIndex].acknowledged = true
        }
      })
      .addCase(acknowledgeAlert.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Dismiss alert
    builder
      .addCase(dismissAlert.fulfilled, (state, action) => {
        state.alerts = state.alerts.filter(alert => alert.id !== action.payload)
      })
      .addCase(dismissAlert.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const {
  updateMetricsFromRobotData,
  addRealtimeDataPoint,
  addSystemAlert,
  setTimeRange,
  setAutoRefresh,
  setRefreshInterval,
  clearError,
  markRefresh,
  clearAlerts,
  clearRealtimeData,
} = dashboardSlice.actions

export default dashboardSlice.reducer