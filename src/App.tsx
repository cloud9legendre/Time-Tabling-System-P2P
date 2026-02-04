import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { YjsProvider } from './context/YjsProvider'
import { AuthProvider } from './context/AuthContext'
import { ConnectionStatus } from './components/ConnectionStatus'
import { RegistrationModal } from './components/RegistrationModal'

function App() {
  const [count, setCount] = useState(0)

  return (
    <YjsProvider>
      <AuthProvider>
        <div className="relative min-h-screen">
          <RegistrationModal />
          <div>
            <a href="https://vite.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
          <h1>Vite + React + Yjs</h1>
          <div className="card">
            <button onClick={() => setCount((count) => count + 1)}>
              count is {count}
            </button>
            <p>
              Edit <code>src/App.tsx</code> and save to test HMR
            </p>
          </div>
          <p className="read-the-docs">
            Click on the Vite and React logos to learn more
          </p>
          <ConnectionStatus />
        </div>
      </AuthProvider>
    </YjsProvider>
  )
}

export default App
