import { Routes, Route, Navigate } from 'react-router-dom'

import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Robots from '@/pages/Robots'
import RobotDetail from '@/pages/RobotDetail'
import Orders from '@/pages/Orders'
import OrderDetail from '@/pages/OrderDetail'
import Templates from '@/pages/Templates'
import TemplateDetail from '@/pages/TemplateDetail'
import Settings from '@/pages/Settings'
import Actions from '@/pages/Actions' 
import Nodes from '@/pages/Nodes' // Nodes 컴포넌트 임포트 추가
import Edges from '@/pages/Edges'   // Edges 컴포넌트 임포트 추가
import NotFound from '@/pages/NotFound'

import ErrorBoundary from '@/components/common/ErrorBoundary'

function App() {
  // Main application routes - no auth required
  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          {/* 기본 경로를 /robots로 변경합니다. */}
          <Route path="/" element={<Navigate to="/robots" replace />} /> 
          {/* Dashboard 경로는 그대로 유지됩니다. 하지만 기본 화면이 아니게 됩니다. */}
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
          
          {/* Actions Route */}
          <Route path="/actions" element={<Actions />} />
          
          {/* Nodes Route (새로 추가될 라우트) */}
          <Route path="/nodes" element={<Nodes />} /> {/* Nodes 라우트 추가 */}
          
          {/* Edges Route (새로 추가될 라우트) */}
          <Route path="/edges" element={<Edges />} /> {/* Edges 라우트 추가 */}

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