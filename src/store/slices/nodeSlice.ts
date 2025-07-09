// src/store/slices/nodeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { nodesApi, CreateNodeRequest, UpdateNodeRequest } from '@/api/nodes'
import { NodeTemplate } from '@/types/order'

interface NodeState {
  nodes: NodeTemplate[]
  selectedNode: NodeTemplate | null
  isLoading: boolean
  error: string | null
  pagination: {
    limit: number
    offset: number
    total: number
  }
}

const initialState: NodeState = {
  nodes: [],
  selectedNode: null,
  isLoading: false,
  error: null,
  pagination: {
    limit: 10,
    offset: 0,
    total: 0,
  },
}

// 비동기 Thunk
export const fetchNodes = createAsyncThunk(
  'nodes/fetchNodes',
  async (params?: { limit?: number; offset?: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await nodesApi.getNodes(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '노드 목록을 불러오지 못했습니다.')
    }
  }
)

export const fetchNodeById = createAsyncThunk(
  'nodes/fetchNodeById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await nodesApi.getNodeById(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '특정 노드를 불러오지 못했습니다.')
    }
  }
)

export const createNode = createAsyncThunk(
  'nodes/createNode',
  async (nodeData: CreateNodeRequest, { rejectWithValue }) => {
    try {
      const response = await nodesApi.createNode(nodeData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '노드 생성에 실패했습니다.')
    }
  }
)

export const updateNode = createAsyncThunk(
  'nodes/updateNode',
  async ({ id, data }: { id: number; data: UpdateNodeRequest }, { rejectWithValue }) => {
    try {
      const response = await nodesApi.updateNode(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '노드 수정에 실패했습니다.')
    }
  }
)

export const deleteNode = createAsyncThunk(
  'nodes/deleteNode',
  async (id: number, { rejectWithValue }) => {
    try {
      await nodesApi.deleteNode(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '노드 삭제에 실패했습니다.')
    }
  }
)

const nodeSlice = createSlice({
  name: 'nodes',
  initialState,
  reducers: {
    setSelectedNode: (state, action: PayloadAction<NodeTemplate | null>) => {
      state.selectedNode = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // fetchNodes (목록 조회)
    builder
      .addCase(fetchNodes.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchNodes.fulfilled, (state, action) => {
        state.isLoading = false
        state.nodes = Array.isArray(action.payload.nodes) ? action.payload.nodes : []
        state.pagination.total = action.payload.count
        state.error = null
      })
      .addCase(fetchNodes.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // fetchNodeById (특정 노드 조회)
    builder
      .addCase(fetchNodeById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNodeById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedNode = action.payload;
        state.error = null;
      })
      .addCase(fetchNodeById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

    // createNode (노드 추가)
    builder
      .addCase(createNode.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createNode.fulfilled, (state, action) => {
        state.isLoading = false
        state.nodes.unshift(action.payload)
        state.pagination.total += 1
        state.error = null
      })
      .addCase(createNode.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // updateNode (노드 수정)
    builder
      .addCase(updateNode.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateNode.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.nodes.findIndex(node => node.id === action.payload.id)
        if (index !== -1) {
          state.nodes[index] = action.payload
        }
        if (state.selectedNode?.id === action.payload.id) {
          state.selectedNode = action.payload;
        }
        state.error = null
      })
      .addCase(updateNode.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // deleteNode (노드 삭제)
    builder
      .addCase(deleteNode.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteNode.fulfilled, (state, action) => {
        state.isLoading = false
        state.nodes = state.nodes.filter(node => node.id !== action.payload)
        state.pagination.total -= 1
        state.error = null
      })
      .addCase(deleteNode.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setSelectedNode, clearError } = nodeSlice.actions
export default nodeSlice.reducer