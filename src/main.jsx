import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initPWAEnhancements } from './pwa-enhancements.js'
import { initIncognitoHandling } from './utils/incognito-detector.js'

// Initialiser les améliorations PWA
initPWAEnhancements();

// Initialiser la gestion du mode incognito
initIncognitoHandling().then(isIncognito => {
  if (isIncognito) {
    console.warn('🕵️ Mode incognito détecté - Certaines fonctionnalités peuvent être limitées');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
