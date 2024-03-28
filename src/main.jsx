import React from 'react'
import ReactDOM from 'react-dom/client'
import { CookiesProvider } from 'react-cookie';
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CookiesProvider>
      <Router>
        <App />
      </Router>
    </CookiesProvider>
  </React.StrictMode>,
)
