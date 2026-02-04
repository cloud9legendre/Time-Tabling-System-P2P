import './App.css'
import { YjsProvider } from './context/YjsProvider'
import { AuthProvider } from './context/AuthContext'
import { ConnectionStatus } from './components/ConnectionStatus'
import { RegistrationModal } from './components/RegistrationModal'
import { TimetableGrid } from './components/TimetableGrid'
import { DebugPanel } from './components/DebugPanel'

function App() {
  return (
    <YjsProvider>
      <AuthProvider>
        <div className="relative min-h-screen bg-[#1a1a1a]">
          <RegistrationModal />
          <TimetableGrid />
          <ConnectionStatus />
          <DebugPanel />
        </div>
      </AuthProvider>
    </YjsProvider>
  )
}

export default App
