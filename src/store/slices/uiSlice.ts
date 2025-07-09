import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// UI state interfaces
interface Notification {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  duration?: number
  persistent?: boolean
  actions?: Array<{
    label: string
    action: string
    variant?: 'primary' | 'secondary'
  }>
}

interface Modal {
  id: string
  type: string
  title?: string
  data?: any
  options?: {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    closable?: boolean
    backdrop?: boolean
    centered?: boolean
  }
}

interface Sidebar {
  isOpen: boolean
  isCollapsed: boolean
  activeSection?: string
}

interface Theme {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

interface Layout {
  sidebarWidth: number
  headerHeight: number
  contentPadding: number
  compactMode: boolean
}

interface UIState {
  // Navigation and layout
  sidebar: Sidebar
  theme: Theme
  layout: Layout
  
  // Loading states
  globalLoading: boolean
  loadingStates: Record<string, boolean>
  
  // Notifications and messages
  notifications: Notification[]
  maxNotifications: number
  
  // Modals and dialogs
  modals: Modal[]
  
  // Form states
  unsavedChanges: Record<string, boolean>
  
  // View preferences
  viewModes: Record<string, 'grid' | 'list' | 'card'>
  itemsPerPage: Record<string, number>
  sortPreferences: Record<string, { field: string; direction: 'asc' | 'desc' }>
  
  // Responsive
  isMobile: boolean
  isTablet: boolean
  screenWidth: number
  screenHeight: number
  
  // Feature flags
  features: Record<string, boolean>
  
  // User preferences
  preferences: {
    language: string
    timezone: string
    dateFormat: string
    timeFormat: '12h' | '24h'
    autoRefresh: boolean
    refreshInterval: number
    soundEnabled: boolean
    animationsEnabled: boolean
    compactTables: boolean
    showHelpTips: boolean
  }
}

const initialState: UIState = {
  sidebar: {
    isOpen: true,
    isCollapsed: false,
    activeSection: undefined,
  },
  theme: {
    mode: 'light',
    primaryColor: '#2563eb',
    colorScheme: 'blue',
  },
  layout: {
    sidebarWidth: 256,
    headerHeight: 64,
    contentPadding: 24,
    compactMode: false,
  },
  globalLoading: false,
  loadingStates: {},
  notifications: [],
  maxNotifications: 10,
  modals: [],
  unsavedChanges: {},
  viewModes: {},
  itemsPerPage: {},
  sortPreferences: {},
  isMobile: false,
  isTablet: false,
  screenWidth: 1920,
  screenHeight: 1080,
  features: {
    notificationsEnabled: true,
    analyticsEnabled: false,
    debugMode: false,
  },
  preferences: {
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '24h',
    autoRefresh: true,
    refreshInterval: 30,
    soundEnabled: true,
    animationsEnabled: true,
    compactTables: false,
    showHelpTips: true,
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isOpen = action.payload
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebar.isCollapsed = !state.sidebar.isCollapsed
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isCollapsed = action.payload
    },
    setActiveSidebarSection: (state, action: PayloadAction<string | undefined>) => {
      state.sidebar.activeSection = action.payload
    },

    // Theme actions
    setThemeMode: (state, action: PayloadAction<Theme['mode']>) => {
      state.theme.mode = action.payload
    },
    setColorScheme: (state, action: PayloadAction<Theme['colorScheme']>) => {
      state.theme.colorScheme = action.payload
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.theme.primaryColor = action.payload
    },

    // Layout actions
    setLayout: (state, action: PayloadAction<Partial<Layout>>) => {
      state.layout = { ...state.layout, ...action.payload }
    },
    toggleCompactMode: (state) => {
      state.layout.compactMode = !state.layout.compactMode
    },

    // Loading actions
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload
    },
    setLoadingState: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      const { key, loading } = action.payload
      if (loading) {
        state.loadingStates[key] = true
      } else {
        delete state.loadingStates[key]
      }
    },
    clearLoadingStates: (state) => {
      state.loadingStates = {}
    },

    // Notification actions
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      }
      
      state.notifications.unshift(notification)
      
      // Limit number of notifications
      if (state.notifications.length > state.maxNotifications) {
        state.notifications = state.notifications.slice(0, state.maxNotifications)
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        // Mark as read (could add a 'read' property to the interface)
      }
    },

    // Modal actions
    openModal: (state, action: PayloadAction<Omit<Modal, 'id'>>) => {
      const modal: Modal = {
        ...action.payload,
        id: `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }
      state.modals.push(modal)
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(m => m.id !== action.payload)
    },
    closeAllModals: (state) => {
      state.modals = []
    },
    updateModal: (state, action: PayloadAction<{ id: string; updates: Partial<Modal> }>) => {
      const { id, updates } = action.payload
      const modalIndex = state.modals.findIndex(m => m.id === id)
      if (modalIndex !== -1) {
        state.modals[modalIndex] = { ...state.modals[modalIndex], ...updates }
      }
    },

    // Form state actions
    setUnsavedChanges: (state, action: PayloadAction<{ formId: string; hasChanges: boolean }>) => {
      const { formId, hasChanges } = action.payload
      if (hasChanges) {
        state.unsavedChanges[formId] = true
      } else {
        delete state.unsavedChanges[formId]
      }
    },
    clearUnsavedChanges: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) {
        delete state.unsavedChanges[action.payload]
      } else {
        state.unsavedChanges = {}
      }
    },

    // View preference actions
    setViewMode: (state, action: PayloadAction<{ page: string; mode: 'grid' | 'list' | 'card' }>) => {
      const { page, mode } = action.payload
      state.viewModes[page] = mode
    },
    setItemsPerPage: (state, action: PayloadAction<{ page: string; count: number }>) => {
      const { page, count } = action.payload
      state.itemsPerPage[page] = count
    },
    setSortPreference: (state, action: PayloadAction<{ 
      page: string
      field: string
      direction: 'asc' | 'desc'
    }>) => {
      const { page, field, direction } = action.payload
      state.sortPreferences[page] = { field, direction }
    },

    // Responsive actions
    setScreenSize: (state, action: PayloadAction<{ width: number; height: number }>) => {
      const { width, height } = action.payload
      state.screenWidth = width
      state.screenHeight = height
      state.isMobile = width < 768
      state.isTablet = width >= 768 && width < 1024
    },

    // Feature flag actions
    setFeature: (state, action: PayloadAction<{ feature: string; enabled: boolean }>) => {
      const { feature, enabled } = action.payload
      state.features[feature] = enabled
    },
    setFeatures: (state, action: PayloadAction<Record<string, boolean>>) => {
      state.features = { ...state.features, ...action.payload }
    },

    // User preference actions
    setPreferences: (state, action: PayloadAction<Partial<UIState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload }
    },
    resetPreferences: (state) => {
      state.preferences = initialState.preferences
    },

    // Utility actions
    resetUI: (state) => {
      // Reset to initial state but preserve some user preferences
      const preservedPreferences = state.preferences
      const preservedTheme = state.theme
      return {
        ...initialState,
        preferences: preservedPreferences,
        theme: preservedTheme,
      }
    },
  },
})

export const {
  // Sidebar
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  setActiveSidebarSection,
  
  // Theme
  setThemeMode,
  setColorScheme,
  setPrimaryColor,
  
  // Layout
  setLayout,
  toggleCompactMode,
  
  // Loading
  setGlobalLoading,
  setLoadingState,
  clearLoadingStates,
  
  // Notifications
  addNotification,
  removeNotification,
  clearNotifications,
  markNotificationAsRead,
  
  // Modals
  openModal,
  closeModal,
  closeAllModals,
  updateModal,
  
  // Forms
  setUnsavedChanges,
  clearUnsavedChanges,
  
  // Views
  setViewMode,
  setItemsPerPage,
  setSortPreference,
  
  // Responsive
  setScreenSize,
  
  // Features
  setFeature,
  setFeatures,
  
  // Preferences
  setPreferences,
  resetPreferences,
  
  // Utility
  resetUI,
} = uiSlice.actions

export default uiSlice.reducer