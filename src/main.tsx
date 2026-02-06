import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Suppress benign connection errors common in P2P mesh churn
const originalError = console.error;
console.error = (...args) => {
  if (
    (typeof args[0] === 'string' && args[0].includes('InvalidStateError')) ||
    (args[0] && args[0].message && args[0].message.includes('Still in CONNECTING state')) ||
    (typeof args[0] === 'string' && args[0].includes('ERR_CONNECTION_REFUSED'))
  ) {
    return;
  }
  originalError.apply(console, args);
};

window.addEventListener('error', (event) => {
  if (event.message.includes('InvalidStateError') || event.message.includes('Still in CONNECTING state')) {
    event.preventDefault(); // Prevent standard error logging
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
