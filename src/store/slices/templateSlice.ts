import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ordersApi } from '@/api/orders'
import { OrderTemplate, NodeWithActions, EdgeWithActions } from '@/types/order'

interface TemplatesState {
  templates: OrderTemplate[]
  templateDetails: Record<number, {
    template: OrderTemplate
    nodes: NodeWithActions[]
    edges: EdgeWithActions[]
  }>
  selectedTemplate: OrderTemplate | null
  selectedTemplateDetails: {
    template: OrderTemplate | null
    nodes: NodeWithActions[]
    edges: EdgeWithActions[]
  } | null
  isLoading: boolean
  error: string | null
  filters: {
    search: string
    sortBy: 'name' | 'createdAt' | 'updatedAt'
    sortOrder: 'asc' | 'desc'
  }
  pagination: {
    limit: number
    offset: number
    total: number
  }
}

const initialState: TemplatesState = {
  templates: [],
  templateDetails: {},
  selectedTemplate: null,
  selectedTemplateDetails: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    limit: 10,
    offset: 0,
    total: 0,
  },
}

// 비동기 Thunk
export const fetchTemplates = createAsyncThunk(
  'templates/fetchTemplates',
  async (params?: { limit?: number; offset?: number }, { rejectWithValue }) => {
    try {
      console.log('[fetchTemplates Thunk] API 호출 시작. Params:', params)
      const response = await ordersApi.getOrderTemplates(params)
      console.log('[fetchTemplates Thunk] API 응답 수신:', response)
      return response
    } catch (error: any) {
      console.error('[fetchTemplates Thunk] API 오류:', error)
      return rejectWithValue(error.response?.data?.message || '템플릿 목록을 불러오지 못했습니다.')
    }
  }
)

export const fetchTemplateDetails = createAsyncThunk(
  'templates/fetchTemplateDetails',
  async (templateId: number, { rejectWithValue }) => {
    console.log(`[fetchTemplateDetails Thunk] 호출됨 - ID: ${templateId}`);
    try {
      const apiResponse = await ordersApi.getOrderTemplateWithDetails(templateId) 
      
      const actualData = apiResponse.data;

      if (actualData === null || actualData === undefined) {
        console.warn(`[fetchTemplateDetails Thunk] API 응답 데이터 (actualData)가 null/undefined:`, actualData);
        throw new Error('템플릿 상세 정보 API 응답 데이터가 비어 있거나 올바르지 않습니다.');
      }
      console.log(`[fetchTemplateDetails Thunk] API 응답 데이터 수신 (actualData):`, actualData);

      const mappedData = {
        template: actualData.orderTemplate ?? null,
        nodes: actualData.nodesWithActions ?? [],
        edges: actualData.edgesWithActions ?? []
      };
      console.log(`[fetchTemplateDetails Thunk] 데이터 매핑 완료:`, mappedData);

      return {
        templateId,
        details: mappedData
      };
    } catch (error: any) {
      console.error(`[fetchTemplateDetails Thunk] 오류 발생:`, error);
      return rejectWithValue(error.message || '템플릿 상세 정보를 불러오지 못했습니다.')
    }
  }
)

export const createTemplate = createAsyncThunk(
  'templates/createTemplate',
  async (data: { name: string; description?: string; nodeIds?: string[]; edgeIds?: string[] }, { rejectWithValue }) => {
    try {
      const response = await ordersApi.createOrderTemplate(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create template')
    }
  }
)

export const updateTemplate = createAsyncThunk(
  'templates/updateTemplate',
  async ({ id, data }: { id: number; data: { name: string; description?: string; nodeIds?: string[]; edgeIds?: string[] } }, { rejectWithValue }) => {
    try {
      const response = await ordersApi.updateOrderTemplate(id, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update template')
    }
  }
)

export const deleteTemplate = createAsyncThunk(
  'templates/deleteTemplate',
  async (templateId: number, { rejectWithValue }) => {
    try {
      await ordersApi.deleteOrderTemplate(templateId)
      return templateId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete template')
    }
  }
)

export const duplicateTemplate = createAsyncThunk(
  'templates/duplicateTemplate',
  async ({ templateId, newName }: { templateId: number; newName: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { templates: TemplatesState }
      const templates = state.templates.templates || []
      const template = templates.find(t => t.id === templateId)
      
      if (!template) {
        throw new Error('Template not found')
      }

      const response = await ordersApi.createOrderTemplate({
        name: newName,
        description: `Copy of ${template.description || template.name}`,
      })
      
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to duplicate template')
    }
  }
)

export const associateNodesWithTemplate = createAsyncThunk(
  'templates/associateNodes',
  async ({ templateId, nodeIds }: { templateId: number; nodeIds: string[] }, { rejectWithValue }) => {
    try {
      const response = await ordersApi.associateNodes(templateId, { nodeIds })
      return { templateId, nodeIds, response: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to associate nodes')
    }
  }
)

export const associateEdgesWithTemplate = createAsyncThunk(
  'templates/associateEdges',
  async ({ templateId, edgeIds }: { templateId: number; edgeIds: string[] }, { rejectWithValue }) => {
    try {
      const response = await ordersApi.associateEdges(templateId, { edgeIds })
      return { templateId, edgeIds, response: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to associate edges')
    }
  }
)

const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    setSelectedTemplate: (state, action: PayloadAction<OrderTemplate | null>) => {
      state.selectedTemplate = action.payload
    },
    setSelectedTemplateDetails: (state, action: PayloadAction<{
      template: OrderTemplate | null
      nodes: NodeWithActions[]
      edges: EdgeWithActions[]
    } | null>) => {
      state.selectedTemplateDetails = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<TemplatesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
    clearSelectedTemplate: (state) => {
      state.selectedTemplate = null
      state.selectedTemplateDetails = null
    },
    // Local template editing actions
    updateLocalTemplate: (state, action: PayloadAction<Partial<OrderTemplate>>) => {
      if (state.selectedTemplate) {
        state.selectedTemplate = { ...state.selectedTemplate, ...action.payload }
      }
    },
    addNodeToTemplate: (state, action: PayloadAction<NodeWithActions>) => {
      if (state.selectedTemplateDetails) {
        state.selectedTemplateDetails.nodes.push(action.payload)
      }
    },
    removeNodeFromTemplate: (state, action: PayloadAction<string>) => {
      if (state.selectedTemplateDetails) {
        state.selectedTemplateDetails.nodes = state.selectedTemplateDetails.nodes.filter(
          node => node.nodeTemplate.nodeId !== action.payload
        )
      }
    },
    updateNodeInTemplate: (state, action: PayloadAction<{ nodeId: string; updates: Partial<NodeWithActions> }>) => {
      if (state.selectedTemplateDetails) {
        const nodeIndex = state.selectedTemplateDetails.nodes.findIndex(
          node => node.nodeTemplate.nodeId === action.payload.nodeId
        )
        if (nodeIndex !== -1) {
          state.selectedTemplateDetails.nodes[nodeIndex] = {
            ...state.selectedTemplateDetails.nodes[nodeIndex],
            ...action.payload.updates
          }
        }
      }
    },
    addEdgeToTemplate: (state, action: PayloadAction<EdgeWithActions>) => {
      if (state.selectedTemplateDetails) {
        state.selectedTemplateDetails.edges.push(action.payload)
      }
    },
    removeEdgeFromTemplate: (state, action: PayloadAction<string>) => {
      if (state.selectedTemplateDetails) {
        state.selectedTemplateDetails.edges = state.selectedTemplateDetails.edges.filter(
          edge => edge.edgeTemplate.edgeId !== action.payload
        )
      }
    },
    updateEdgeInTemplate: (state, action: PayloadAction<{ edgeId: string; updates: Partial<EdgeWithActions> }>) => {
      if (state.selectedTemplateDetails) {
        const edgeIndex = state.selectedTemplateDetails.edges.findIndex(
          edge => edge.edgeTemplate.edgeId === action.payload.edgeId
        )
        if (edgeIndex !== -1) {
          state.selectedTemplateDetails.edges[edgeIndex] = {
            ...state.selectedTemplateDetails.edges[edgeIndex],
            ...action.payload.updates
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    // fetchTemplates (목록 조회) - 여기가 수정된 부분입니다!
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.isLoading = true
        state.error = null
        console.log('[templateSlice] fetchTemplates.pending')
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.isLoading = false
        console.log('[templateSlice] fetchTemplates.fulfilled. Action payload:', action.payload)
        
        // 백엔드 응답 구조에 맞게 수정: data.items를 사용
        const responseData = action.payload.data || action.payload
        const templateItems = responseData.items || []
        
        console.log('[templateSlice] 추출된 템플릿 배열:', templateItems)
        
        state.templates = Array.isArray(templateItems) ? templateItems : []
        state.pagination.total = responseData.count || 0
        state.error = null
        
        console.log('[templateSlice] Redux 상태 업데이트 완료. 템플릿 개수:', state.templates.length)
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        console.error('[templateSlice] fetchTemplates.rejected:', action.payload)
      })

    // fetchTemplateDetails (상세 조회)
    builder
      .addCase(fetchTemplateDetails.pending, (state) => {
        console.log('[fetchTemplateDetails Reducer] Pending 상태 진입');
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTemplateDetails.fulfilled, (state, action) => {
        console.log('[fetchTemplateDetails Reducer] Fulfilled 상태 진입. Payload:', action.payload);
        state.isLoading = false
        const { templateId, details } = action.payload
        state.templateDetails[templateId] = details
        state.selectedTemplateDetails = details
        state.error = null
      })
      .addCase(fetchTemplateDetails.rejected, (state, action) => {
        console.error('[fetchTemplateDetails Reducer] Rejected 상태 진입. 오류:', action.payload);
        state.isLoading = false
        state.error = action.payload as string
      })

    // createTemplate (생성)
    builder
      .addCase(createTemplate.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.isLoading = false
        const currentTemplates = state.templates || []
        state.templates = [action.payload, ...currentTemplates]
        state.selectedTemplate = action.payload
        state.error = null
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // updateTemplate (수정)
    builder
      .addCase(updateTemplate.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.isLoading = false
        const templates = state.templates || []
        const templateIndex = templates.findIndex(t => t.id === action.payload.id)
        if (templateIndex !== -1) {
          state.templates[templateIndex] = action.payload
        }
        if (state.selectedTemplate?.id === action.payload.id) {
          state.selectedTemplate = action.payload
        }
        state.error = null
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // deleteTemplate (삭제)
    builder
      .addCase(deleteTemplate.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.isLoading = false
        const templateId = action.payload
        const templates = state.templates || []
        state.templates = templates.filter(t => t.id !== templateId)
        delete state.templateDetails[templateId]
        if (state.selectedTemplate?.id === templateId) {
          state.selectedTemplate = null
          state.selectedTemplateDetails = null
        }
        state.error = null
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // duplicateTemplate (복제)
    builder
      .addCase(duplicateTemplate.fulfilled, (state, action) => {
        const currentTemplates = state.templates || []
        state.templates = [action.payload, ...currentTemplates]
        state.selectedTemplate = action.payload
      })
      .addCase(duplicateTemplate.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // associateNodesWithTemplate (노드 연결)
    builder
      .addCase(associateNodesWithTemplate.fulfilled, (state, action) => {
        state.error = null
      })
      .addCase(associateNodesWithTemplate.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // associateEdgesWithTemplate (엣지 연결)
    builder
      .addCase(associateEdgesWithTemplate.fulfilled, (state, action) => {
        state.error = null
      })
      .addCase(associateEdgesWithTemplate.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const {
  setSelectedTemplate,
  setSelectedTemplateDetails,
  setFilters,
  clearError,
  clearSelectedTemplate,
  updateLocalTemplate,
  addNodeToTemplate,
  removeNodeFromTemplate,
  updateNodeInTemplate,
  addEdgeToTemplate,
  removeEdgeFromTemplate,
  updateEdgeInTemplate,
} = templateSlice.actions

export default templateSlice.reducer