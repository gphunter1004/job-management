// src/store/slices/actionSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { actionsApi, CreateActionRequest, UpdateActionRequest } from '@/api/actions'
import { ActionTemplate } from '@/types/order'

interface ActionState {
  actions: ActionTemplate[]
  selectedAction: ActionTemplate | null
  isLoading: boolean
  error: string | null
  filters: {
    actionType: string
    blockingType: string
    search: string
  }
  pagination: {
    limit: number
    offset: number
    total: number
  }
}

const initialState: ActionState = {
  actions: [],
  selectedAction: null,
  isLoading: false,
  error: null,
  filters: {
    actionType: 'all',
    blockingType: 'all',
    search: '',
  },
  pagination: {
    limit: 10,
    offset: 0,
    total: 0,
  },
}

// 비동기 Thunk
export const fetchActions = createAsyncThunk(
  'action/fetchActions',
  async (params?: { limit?: number; offset?: number; actionType?: string; blockingType?: string; search?: string }, { rejectWithValue }) => {
    try {
      const response = await actionsApi.getActions(params)
      // 여기가 수정된 부분입니다: response.data에 실제 목록이 있습니다.
      return response.data // response는 이제 ApiResponse<GetActionsResponseData> 타입입니다.
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '액션 템플릿 목록을 불러오지 못했습니다.')
    }
  }
)

export const fetchActionById = createAsyncThunk(
  'action/fetchActionById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await actionsApi.getActionById(id)
      return response.data // response는 이제 ApiResponse<ActionTemplate> 타입입니다.
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '특정 액션 템플릿을 불러오지 못했습니다.')
    }
  }
)

export const createAction = createAsyncThunk(
  'action/createAction',
  async (actionData: CreateActionRequest, { rejectWithValue }) => {
    try {
      const response = await actionsApi.createAction(actionData)
      return response.data // response는 이제 ApiResponse<ActionTemplate> 타입입니다.
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '액션 템플릿 생성에 실패했습니다.')
    }
  }
)

export const updateAction = createAsyncThunk(
  'action/updateAction',
  async ({ id, data }: { id: number; data: UpdateActionRequest }, { rejectWithValue }) => {
    try {
      const response = await actionsApi.updateAction(id, data)
      return response.data // response는 이제 ApiResponse<ActionTemplate> 타입입니다.
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '액션 템플릿 수정에 실패했습니다.')
    }
  }
)

export const deleteAction = createAsyncThunk(
  'action/deleteAction',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await actionsApi.deleteAction(id) // response는 이제 ApiResponse<any> 타입입니다.
      // 삭제 성공 시에는 ID만 반환하도록 수정했습니다.
      return id 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '액션 템플릿 삭제에 실패했습니다.')
    }
  }
)

const actionSlice = createSlice({
  name: 'action',
  initialState,
  reducers: {
    setSelectedAction: (state, action: PayloadAction<ActionTemplate | null>) => {
      state.selectedAction = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action: PayloadAction<Partial<ActionState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setPagination: (state, action: PayloadAction<Partial<ActionState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    // fetchActions (목록 조회)
    builder
      .addCase(fetchActions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchActions.fulfilled, (state, action) => {
        state.isLoading = false
        // 여기가 수정된 부분입니다: action.payload.data.items를 사용합니다.
        state.actions = Array.isArray(action.payload.items) ? action.payload.items : []
        state.pagination.total = action.payload.count
        state.error = null
      })
      .addCase(fetchActions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // fetchActionById (특정 액션 조회)
    builder
      .addCase(fetchActionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedAction = action.payload;
        state.error = null;
      })
      .addCase(fetchActionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

    // createAction (액션 추가)
    builder
      .addCase(createAction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createAction.fulfilled, (state, action) => {
        state.isLoading = false
        state.actions.unshift(action.payload)
        state.pagination.total += 1
        state.error = null
      })
      .addCase(createAction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // updateAction (액션 수정)
    builder
      .addCase(updateAction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateAction.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.actions.findIndex(act => act.id === action.payload.id)
        if (index !== -1) {
          state.actions[index] = action.payload
        }
        if (state.selectedAction?.id === action.payload.id) {
          state.selectedAction = action.payload;
        }
        state.error = null
      })
      .addCase(updateAction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // deleteAction (액션 삭제)
    builder
      .addCase(deleteAction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteAction.fulfilled, (state, action) => {
        state.isLoading = false
        state.actions = state.actions.filter(act => act.id !== action.payload)
        state.pagination.total -= 1
        state.error = null
      })
      .addCase(deleteAction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setSelectedAction, clearError, setFilters, setPagination } = actionSlice.actions
export default actionSlice.reducer