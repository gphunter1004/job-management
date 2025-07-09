import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'

import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Robots from '@/pages/Robots'
import RobotDetail from '@/pages/RobotDetail'
import Orders from '@/pages/Orders'
import OrderDetail from '@/pages/OrderDetail'
import Templates from '@/pages/Templates'
import TemplateDetail from '@/pages/TemplateDetail'
import Settings from '@/pages/Settings'
import NotFound from '@/pages/NotFound'

import { useWebSocket } from '@/hooks/useWebSocket'
import ErrorBoundary from '@/components/common/ErrorBoundary'

function App() {
  const { connect, disconnect } = useWebSocket()

  useEffect(() => {
    // Connect to WebSocket on app start
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Main application routes - no auth required
  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Robot Routes */}
          <Route path="/robots" element={<Robots />} />
          <Route path="/robots/:serialNumber" element={<RobotDetail />} />
          
          {/* Order Routes */}
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<OrderDetail />} />
          
          {/* Template Routes */}
          <Route path="/templates" element={<Templates />} />
          <Route path="/templates/:templateId" element={<TemplateDetail />} />
          
          {/* Settings */}
          <Route path="/settings" element={<Settings />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  )
}

export default App