import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initPWAEnhancements } from './pwa-enhancements.js'

// Initialiser les améliorations PWA
initPWAEnhancements();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
