import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { StateProvider } from './context/StateContext.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <StateProvider>
          <App />
        </StateProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
)
