import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Initialize SDK when ready
const initializeSDK = () => {
  if (typeof avt !== 'undefined' && avt.interface) {
    // Set window size to 800x500
    avt.interface.setWindow({
      width: '800px',
      height: '500px',
    });
    console.log('SDK initialized - Window size set to 800x500');
  } else {
    console.warn('Auravant SDK not available');
  }
};

// Listen for SDK ready event
window.addEventListener('readySDK', () => {
  console.log('Auravant SDK Ready');
  initializeSDK();
});

// Also try to initialize if SDK is already loaded
if (typeof avt !== 'undefined') {
  initializeSDK();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);