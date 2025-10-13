// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'
// import { BrowserRouter } from 'react-router-dom'
// import { TrafficProvider } from './context/TrafficContext.jsx'
// import { AuthProvider } from './context/AuthContext.jsx'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <AuthProvider>
//         <TrafficProvider>
//           <App />
//         </TrafficProvider>
//       </AuthProvider>
//     </BrowserRouter>
//   </React.StrictMode>,
// )


import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { TrafficProvider } from './context/TrafficContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { VehicleProvider } from './context/VehicleContext.jsx'

// Error boundary for the entire app
const RootErrorBoundary = ({ children }) => {
  return (
    <React.StrictMode>
      {children}
    </React.StrictMode>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))

try {
  root.render(
    <RootErrorBoundary>
      <BrowserRouter>
      <VehicleProvider>
        <AuthProvider>
          <TrafficProvider>
            <App />
          </TrafficProvider>
        </AuthProvider>
        </VehicleProvider>
      </BrowserRouter>
    </RootErrorBoundary>
  )
} catch (error) {
  console.error('Failed to render the app:', error)
  
  // Fallback UI in case of rendering failure
  const fallbackUI = (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#1a202c',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>🚦 Application Error</h1>
        <p>Sorry, something went wrong while loading the app.</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </div>
    </div>
  )
  
  root.render(fallbackUI)
}