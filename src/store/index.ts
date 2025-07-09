import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'

import authSlice from './slices/authSlice'
import robotSlice from './slices/robotSlice'
import orderSlice from './slices/orderSlice'
import templateSlice from './slices/templateSlice' // 경로 수정: './slices/slices/templateSlice' -> './slices/templateSlice'
import dashboardSlice from './slices/dashboardSlice'
import uiSlice from './slices/uiSlice'
import actionSlice from './slices/actionSlice'
import nodeSlice from './slices/nodeSlice'
import edgeSlice from './slices/edgeSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    robots: robotSlice,
    orders: orderSlice,
    templates: templateSlice,
    dashboard: dashboardSlice,
    ui: uiSlice,
    action: actionSlice,
    nodes: nodeSlice,
    edges: edgeSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: import.meta.env.DEV,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store