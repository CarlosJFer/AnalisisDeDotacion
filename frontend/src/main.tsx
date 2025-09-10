import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Monitor INP metric if web-vitals is available
(window as any).webVitals?.onINP(console.log)

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Check if it's the extension error we want to ignore
  if (event.reason?.message?.includes('message channel closed')) {
    console.warn('Extension communication error (safe to ignore):', event.reason.message);
    event.preventDefault(); // Prevent the error from being logged as uncaught
    return;
  }
  
  // Log other unhandled rejections normally
  console.error('Unhandled promise rejection:', event.reason);
});

// Global error handler for runtime errors
window.addEventListener('error', (event) => {
  // Check if it's the extension error we want to ignore
  if (event.message?.includes('message channel closed')) {
    console.warn('Extension communication error (safe to ignore):', event.message);
    event.preventDefault();
    return;
  }
  
  // Log other errors normally
  console.error('Runtime error:', event.error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
