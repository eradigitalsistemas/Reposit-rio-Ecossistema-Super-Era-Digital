import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './main.css'
import { CoreAuthProvider } from './hooks/use-auth'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CoreAuthProvider>
      <App />
    </CoreAuthProvider>
  </StrictMode>,
)