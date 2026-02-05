import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import { YjsProvider } from './context/YjsProvider'
import { AuthProvider } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { ProtectedLayout } from './components/layout/ProtectedLayout'
import { TimetableGrid } from './components/TimetableGrid'
import { AdminDashboard } from './components/admin/AdminDashboard'
import { DebugPanel } from './components/DebugPanel'

function App() {
  return (
    <Router>
      <YjsProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<TimetableGrid />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
          <DebugPanel />
        </AuthProvider>
      </YjsProvider>
    </Router>
  )
}

export default App
