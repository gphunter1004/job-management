// src/store/slices/edgeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { edgesApi, CreateEdgeRequest, UpdateEdgeRequest } from '@/api/edges'
import { EdgeTemplate } from '@/types/order'

interface EdgeState {
  edges: EdgeTemplate[]
  selectedEdge: EdgeTemplate | null
  isLoading: boolean
  error: string | null
  pagination: {
    limit: number
    offset: number
    total: number
  }
}

const initialState: EdgeState = {
  edges: [],
  selectedEdge: null,
  isLoading: false,
  error: null,
  pagination: {
    limit: 10,
    offset: 0,
    total: 0,
  },
}

// 비동기 Thunk
export const fetchEdges = createAsyncThunk(
  'edges/fetchEdges',
  async (params?: { limit?: number; offset?: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await edgesApi.getEdges(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '엣지 목록을 불러오지 못했습니다.')
    }
  }
)

export const fetchEdgeById = createAsyncThunk(
  'edges/fetchEdgeById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await edgesApi.getEdgeById(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '특정 엣지를 불러오지 못했습니다.')
    }
  }
)

export const createEdge = createAsyncThunk(
  'edges/createEdge',
  async (edgeData: CreateEdgeRequest, { rejectWithValue }) => {
    try {
      const response = await edgesApi.createEdge(edgeData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '엣지 생성에 실패했습니다.')
    }
  }
)

export const updateEdge = createAsyncThunk(
  'edges/updateEdge',
  async ({ id, data }: { id: number; data: UpdateEdgeRequest }, { rejectWithValue }) => {
    try {
      const response = await edgesApi.updateEdge(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '엣지 수정에 실패했습니다.')
    }
  }
)

export const deleteEdge = createAsyncThunk(
  'edges/deleteEdge',
  async (id: number, { rejectWithValue }) => {
    try {
      await edgesApi.deleteEdge(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '엣지 삭제에 실패했습니다.')
    }
  }
)

const edgeSlice = createSlice({
  name: 'edges',
  initialState,
  reducers: {
    setSelectedEdge: (state, action: PayloadAction<EdgeTemplate | null>) => {
      state.selectedEdge = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // fetchEdges (목록 조회)
    builder
      .addCase(fetchEdges.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchEdges.fulfilled, (state, action) => {
        state.isLoading = false
        state.edges = Array.isArray(action.payload.edges) ? action.payload.edges : []
        state.pagination.total = action.payload.count
        state.error = null
      })
      .addCase(fetchEdges.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // fetchEdgeById (특정 엣지 조회)
    builder
      .addCase(fetchEdgeById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEdgeById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedEdge = action.payload;
        state.error = null;
      })
      .addCase(fetchEdgeById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

    // createEdge (엣지 추가)
    builder
      .addCase(createEdge.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createEdge.fulfilled, (state, action) => {
        state.isLoading = false
        state.edges.unshift(action.payload)
        state.pagination.total += 1
        state.error = null
      })
      .addCase(createEdge.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // updateEdge (엣지 수정)
    builder
      .addCase(updateEdge.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateEdge.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.edges.findIndex(edge => edge.id === action.payload.id)
        if (index !== -1) {
          state.edges[index] = action.payload
        }
        if (state.selectedEdge?.id === action.payload.id) {
          state.selectedEdge = action.payload;
        }
        state.error = null
      })
      .addCase(updateEdge.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // deleteEdge (엣지 삭제)
    builder
      .addCase(deleteEdge.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteEdge.fulfilled, (state, action) => {
        state.isLoading = false
        state.edges = state.edges.filter(edge => edge.id !== action.payload)
        state.pagination.total -= 1
        state.error = null
      })
      .addCase(deleteEdge.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setSelectedEdge, clearError } = edgeSlice.actions
export default edgeSlice.reducer