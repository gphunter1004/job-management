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
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'

import { useAuth } from '@/hooks/useAuth'
import { useWebSocket } from '@/hooks/useWebSocket'
import LoadingSpinner from '@/components/ui/Loading'
import ErrorBoundary from '@/components/common/ErrorBoundary'

function App() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const { connect, disconnect } = useWebSocket()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to WebSocket when authenticated
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [isAuthenticated, user, connect, disconnect])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ErrorBoundary>
    )
  }

  // Main application routes
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