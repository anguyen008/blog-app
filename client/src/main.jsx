/**
 * main.jsx - Application Entry Point
 * 
 * Initializes the React application by:
 * - Creating the root DOM node
 * - Rendering the main App component
 * - Adding the ToastContainer for notifications
 * - Wrapping in StrictMode for development warnings
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastContainer } from './components/UI.jsx'
import {BrowserRouter} from "react-router-dom"
import "prosemirror-view/style/prosemirror.css"; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>    
      <App />
      <ToastContainer /> 
    </BrowserRouter>

  </StrictMode>,
)
