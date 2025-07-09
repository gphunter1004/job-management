import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { Robot, RobotState, RobotHealth, RobotCapabilities } from '@/types/robot'
import { robotsApi } from '@/api/robots'

interface RobotsState {
  connectedRobots: string[]
  robotStates: Record<string, RobotState>
  robotHealth: Record<string, RobotHealth>
  robotCapabilities: Record<string, RobotCapabilities>
  selectedRobot: string | null
  isLoading: boolean
  error: string | null
}

const initialState: RobotsState = {
  connectedRobots: [], // 빈 배열로 초기화
  robotStates: {},
  robotHealth: {},
  robotCapabilities: {},
  selectedRobot: null,
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchConnectedRobots = createAsyncThunk(
  'robots/fetchConnectedRobots',
  async (_, { rejectWithValue }) => {
    try {
      const response = await robotsApi.getConnectedRobots()
      // 응답이 배열인지 확인하고, 아니면 빈 배열 반환
      const robots = response.data?.connectedRobots
      return Array.isArray(robots) ? robots : []
    } catch (error: any) {
      console.warn('Failed to fetch connected robots, using empty array:', error)
      // API 실패 시에도 빈 배열 반환하여 오류 방지
      return []
    }
  }
)

export const fetchRobotState = createAsyncThunk(
  'robots/fetchRobotState',
  async (serialNumber: string, { rejectWithValue }) => {
    try {
      const response = await robotsApi.getRobotState(serialNumber)
      return { serialNumber, state: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch robot state')
    }
  }
)

export const fetchRobotHealth = createAsyncThunk(
  'robots/fetchRobotHealth',
  async (serialNumber: string, { rejectWithValue }) => {
    try {
      const response = await robotsApi.getRobotHealth(serialNumber)
      return { serialNumber, health: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch robot health')
    }
  }
)

export const fetchRobotCapabilities = createAsyncThunk(
  'robots/fetchRobotCapabilities',
  async (serialNumber: string, { rejectWithValue }) => {
    try {
      const response = await robotsApi.getRobotCapabilities(serialNumber)
      return { serialNumber, capabilities: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch robot capabilities')
    }
  }
)

export const sendRobotOrder = createAsyncThunk(
  'robots/sendOrder',
  async ({ serialNumber, orderData }: { serialNumber: string, orderData: any }, { rejectWithValue }) => {
    try {
      const response = await robotsApi.sendOrder(serialNumber, orderData)
      return { serialNumber, response: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send order')
    }
  }
)

export const sendRobotAction = createAsyncThunk(
  'robots/sendAction',
  async ({ serialNumber, actionData }: { serialNumber: string, actionData: any }, { rejectWithValue }) => {
    try {
      const response = await robotsApi.sendCustomAction(serialNumber, actionData)
      return { serialNumber, response: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send action')
    }
  }
)

const robotSlice = createSlice({
  name: 'robots',
  initialState,
  reducers: {
    setSelectedRobot: (state, action: PayloadAction<string | null>) => {
      state.selectedRobot = action.payload
    },
    updateRobotState: (state, action: PayloadAction<{ serialNumber: string, state: RobotState }>) => {
      const { serialNumber, state: robotState } = action.payload
      state.robotStates[serialNumber] = robotState
    },
    updateRobotHealth: (state, action: PayloadAction<{ serialNumber: string, health: RobotHealth }>) => {
      const { serialNumber, health } = action.payload
      state.robotHealth[serialNumber] = health
    },
    clearError: (state) => {
      state.error = null
    },
    removeRobot: (state, action: PayloadAction<string>) => {
      const serialNumber = action.payload
      // 안전한 필터링
      state.connectedRobots = (state.connectedRobots || []).filter(robot => robot !== serialNumber)
      delete state.robotStates[serialNumber]
      delete state.robotHealth[serialNumber]
      delete state.robotCapabilities[serialNumber]
      
      if (state.selectedRobot === serialNumber) {
        state.selectedRobot = null
      }
    },
    addRobot: (state, action: PayloadAction<string>) => {
      const serialNumber = action.payload
      // 안전한 추가
      const currentRobots = state.connectedRobots || []
      if (!currentRobots.includes(serialNumber)) {
        state.connectedRobots = [...currentRobots, serialNumber]
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch connected robots
    builder
      .addCase(fetchConnectedRobots.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchConnectedRobots.fulfilled, (state, action) => {
        state.isLoading = false
        // 항상 배열인지 확인
        state.connectedRobots = Array.isArray(action.payload) ? action.payload : []
        state.error = null
      })
      .addCase(fetchConnectedRobots.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        // 실패해도 빈 배열 유지
        state.connectedRobots = []
      })

    // Fetch robot state
    builder
      .addCase(fetchRobotState.fulfilled, (state, action) => {
        const { serialNumber, state: robotState } = action.payload
        state.robotStates[serialNumber] = robotState
      })
      .addCase(fetchRobotState.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Fetch robot health
    builder
      .addCase(fetchRobotHealth.fulfilled, (state, action) => {
        const { serialNumber, health } = action.payload
        state.robotHealth[serialNumber] = health
      })
      .addCase(fetchRobotHealth.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Fetch robot capabilities
    builder
      .addCase(fetchRobotCapabilities.fulfilled, (state, action) => {
        const { serialNumber, capabilities } = action.payload
        state.robotCapabilities[serialNumber] = capabilities
      })
      .addCase(fetchRobotCapabilities.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Send robot order
    builder
      .addCase(sendRobotOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendRobotOrder.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(sendRobotOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Send robot action
    builder
      .addCase(sendRobotAction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendRobotAction.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(sendRobotAction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  setSelectedRobot,
  updateRobotState,
  updateRobotHealth,
  clearError,
  removeRobot,
  addRobot,
} = robotSlice.actions

export default robotSlice.reducer