import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { OrderTemplate, NodeWithActions, EdgeWithActions } from '@/types/order'
import { ordersApi } from '@/api/orders'

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
}

const initialState: TemplatesState = {
  templates: [], // 빈 배열로 초기화
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
}

// Async thunks
export const fetchTemplates = createAsyncThunk(
  'templates/fetchTemplates',
  async (params?: { limit?: number; offset?: number }, { rejectWithValue }) => {
    try {
      const response = await ordersApi.getOrderTemplates(params)
      // 응답이 배열인지 확인하고, 아니면 빈 배열 반환
      const templates = response.items
      return Array.isArray(templates) ? templates : []
    } catch (error: any) {
      console.warn('Failed to fetch templates, using empty array:', error)
      // API 실패 시에도 빈 배열 반환하여 오류 방지
      return []
    }
  }
)

export const fetchTemplateDetails = createAsyncThunk(
  'templates/fetchTemplateDetails',
  async (templateId: number, { rejectWithValue }) => {
    try {
      const response = await ordersApi.getOrderTemplateWithDetails(templateId)
      return { templateId, details: response.data }
    } catch (error: any) {
      console.warn('Failed to fetch template details, using mock data:', error)
      // API 실패 시 모의 데이터 반환
      return {
        templateId,
        details: {
          template: {
            id: templateId,
            name: `Template ${templateId}`,
            description: 'Mock template for development',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          nodes: [],
          edges: []
        }
      }
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
  async ({ id, data }: { 
    id: number
    data: { name: string; description?: string; nodeIds?: string[]; edgeIds?: string[] }
  }, { rejectWithValue }) => {
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
    // Fetch templates
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.isLoading = false
        // 항상 배열인지 확인
        state.templates = Array.isArray(action.payload) ? action.payload : []
        state.error = null
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        // 실패해도 빈 배열 유지
        state.templates = []
      })

    // Fetch template details
    builder
      .addCase(fetchTemplateDetails.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTemplateDetails.fulfilled, (state, action) => {
        state.isLoading = false
        const { templateId, details } = action.payload
        state.templateDetails[templateId] = details
        state.selectedTemplateDetails = details
        state.error = null
      })
      .addCase(fetchTemplateDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create template
    builder
      .addCase(createTemplate.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.isLoading = false
        // 안전한 배열 추가
        const currentTemplates = state.templates || []
        state.templates = [action.payload, ...currentTemplates]
        state.selectedTemplate = action.payload
        state.error = null
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update template
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

    // Delete template
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

    // Duplicate template
    builder
      .addCase(duplicateTemplate.fulfilled, (state, action) => {
        const currentTemplates = state.templates || []
        state.templates = [action.payload, ...currentTemplates]
        state.selectedTemplate = action.payload
      })
      .addCase(duplicateTemplate.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Associate nodes
    builder
      .addCase(associateNodesWithTemplate.fulfilled, (state, action) => {
        // Handle successful node association
        state.error = null
      })
      .addCase(associateNodesWithTemplate.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // Associate edges
    builder
      .addCase(associateEdgesWithTemplate.fulfilled, (state, action) => {
        // Handle successful edge association
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