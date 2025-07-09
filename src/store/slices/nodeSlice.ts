// src/store/slices/nodeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { nodesApi, CreateNodeRequest, UpdateNodeRequest, CreateNodeRequestFlat } from '@/api/nodes'
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
      console.log('[fetchNodes Thunk] API 호출 시작. Params:', params)
      const response = await nodesApi.getNodes(params)
      console.log('[fetchNodes Thunk] API 응답 수신:', response)
      return response
    } catch (error: any) {
      console.error('[fetchNodes Thunk] API 오류:', error)
      return rejectWithValue(error.response?.data?.message || '노드 목록을 불러오지 못했습니다.')
    }
  }
)

export const fetchNodeById = createAsyncThunk(
  'nodes/fetchNodeById',
  async (id: number, { rejectWithValue }) => {
    try {
      console.log('[fetchNodeById Thunk] API 호출 시작. ID:', id)
      const response = await nodesApi.getNodeById(id)
      console.log('[fetchNodeById Thunk] API 응답 수신:', response)
      return response.data
    } catch (error: any) {
      console.error('[fetchNodeById Thunk] API 오류:', error)
      return rejectWithValue(error.response?.data?.message || '특정 노드를 불러오지 못했습니다.')
    }
  }
)

export const createNode = createAsyncThunk(
  'nodes/createNode',
  async (nodeData: CreateNodeRequest | CreateNodeRequestFlat, { rejectWithValue }) => {
    try {
      console.log('[createNode Thunk] API 호출 시작. Data:', nodeData)
      const response = await nodesApi.createNode(nodeData)
      console.log('[createNode Thunk] API 응답 수신:', response)
      return response.data
    } catch (error: any) {
      console.error('[createNode Thunk] API 오류:', error)
      return rejectWithValue(error.response?.data?.message || '노드 생성에 실패했습니다.')
    }
  }
)

export const updateNode = createAsyncThunk(
  'nodes/updateNode',
  async ({ id, data }: { id: number; data: UpdateNodeRequest }, { rejectWithValue }) => {
    try {
      console.log('[updateNode Thunk] API 호출 시작. ID:', id, 'Data:', data)
      const response = await nodesApi.updateNode(id, data)
      console.log('[updateNode Thunk] API 응답 수신:', response)
      return response.data
    } catch (error: any) {
      console.error('[updateNode Thunk] API 오류:', error)
      return rejectWithValue(error.response?.data?.message || '노드 수정에 실패했습니다.')
    }
  }
)

export const deleteNode = createAsyncThunk(
  'nodes/deleteNode',
  async (id: number, { rejectWithValue }) => {
    try {
      console.log('[deleteNode Thunk] API 호출 시작. ID:', id)
      await nodesApi.deleteNode(id)
      console.log('[deleteNode Thunk] API 호출 성공')
      return id
    } catch (error: any) {
      console.error('[deleteNode Thunk] API 오류:', error)
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
      console.log('[nodeSlice] 선택된 노드 설정:', action.payload)
    },
    clearError: (state) => {
      state.error = null
    },
    clearSelectedNode: (state) => {
      state.selectedNode = null
    },
  },
  extraReducers: (builder) => {
    // fetchNodes (목록 조회)
    builder
      .addCase(fetchNodes.pending, (state) => {
        state.isLoading = true
        state.error = null
        console.log('[nodeSlice] fetchNodes.pending')
      })
      .addCase(fetchNodes.fulfilled, (state, action) => {
        state.isLoading = false
        console.log('[nodeSlice] fetchNodes.fulfilled. Action payload:', action.payload)
        
        // 백엔드 응답 구조에 맞게 처리
        const responseData = action.payload
        const nodeItems = responseData.nodes || []
        
        console.log('[nodeSlice] 추출된 노드 배열:', nodeItems)
        
        state.nodes = Array.isArray(nodeItems) ? nodeItems : []
        state.pagination.total = responseData.count || 0
        state.error = null
        
        console.log('[nodeSlice] Redux 상태 업데이트 완료. 노드 개수:', state.nodes.length)
      })
      .addCase(fetchNodes.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        console.error('[nodeSlice] fetchNodes.rejected:', action.payload)
      })

    // fetchNodeById (특정 노드 조회)
    builder
      .addCase(fetchNodeById.pending, (state) => {
        state.isLoading = true
        state.error = null
        console.log('[nodeSlice] fetchNodeById.pending')
      })
      .addCase(fetchNodeById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedNode = action.payload
        state.error = null
        console.log('[nodeSlice] fetchNodeById.fulfilled:', action.payload)
        
        // 목록에서도 업데이트
        const existingIndex = state.nodes.findIndex(node => node.id === action.payload.id)
        if (existingIndex !== -1) {
          state.nodes[existingIndex] = action.payload
        }
      })
      .addCase(fetchNodeById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        console.error('[nodeSlice] fetchNodeById.rejected:', action.payload)
      })

    // createNode (노드 추가)
    builder
      .addCase(createNode.pending, (state) => {
        state.isLoading = true
        state.error = null
        console.log('[nodeSlice] createNode.pending')
      })
      .addCase(createNode.fulfilled, (state, action) => {
        state.isLoading = false
        state.nodes.unshift(action.payload)
        state.pagination.total += 1
        state.error = null
        console.log('[nodeSlice] createNode.fulfilled:', action.payload)
      })
      .addCase(createNode.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        console.error('[nodeSlice] createNode.rejected:', action.payload)
      })

    // updateNode (노드 수정)
    builder
      .addCase(updateNode.pending, (state) => {
        state.isLoading = true
        state.error = null
        console.log('[nodeSlice] updateNode.pending')
      })
      .addCase(updateNode.fulfilled, (state, action) => {
        state.isLoading = false
        const updatedNode = action.payload
        console.log('[nodeSlice] updateNode.fulfilled:', updatedNode)
        
        // 목록에서 업데이트
        const index = state.nodes.findIndex(node => node.id === updatedNode.id)
        if (index !== -1) {
          state.nodes[index] = updatedNode
          console.log(`[nodeSlice] 노드 목록에서 인덱스 ${index} 업데이트됨`)
        } else {
          console.warn('[nodeSlice] 업데이트할 노드를 목록에서 찾을 수 없음. ID:', updatedNode.id)
        }
        
        // 선택된 노드도 업데이트
        if (state.selectedNode?.id === updatedNode.id) {
          state.selectedNode = updatedNode
          console.log('[nodeSlice] 선택된 노드도 업데이트됨')
        }
        
        state.error = null
      })
      .addCase(updateNode.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        console.error('[nodeSlice] updateNode.rejected:', action.payload)
      })

    // deleteNode (노드 삭제)
    builder
      .addCase(deleteNode.pending, (state) => {
        state.isLoading = true
        state.error = null
        console.log('[nodeSlice] deleteNode.pending')
      })
      .addCase(deleteNode.fulfilled, (state, action) => {
        state.isLoading = false
        const deletedId = action.payload
        state.nodes = state.nodes.filter(node => node.id !== deletedId)
        state.pagination.total -= 1
        
        // 선택된 노드가 삭제된 노드면 클리어
        if (state.selectedNode?.id === deletedId) {
          state.selectedNode = null
        }
        
        state.error = null
        console.log('[nodeSlice] deleteNode.fulfilled. 삭제된 ID:', deletedId)
      })
      .addCase(deleteNode.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        console.error('[nodeSlice] deleteNode.rejected:', action.payload)
      })
  },
})

export const { setSelectedNode, clearError, clearSelectedNode } = nodeSlice.actions
export default nodeSlice.reducer