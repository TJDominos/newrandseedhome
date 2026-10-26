// Suppress external browser extension injection errors (e.g. MetaMask inpage.js)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const msg = (typeof reason === 'string' ? reason : reason?.message || reason?.stack || '') + '';
    if (
      msg.includes('MetaMask') ||
      msg.includes('nkbihfbeogaeaoehlefnkodbefgpgknn') ||
      msg.includes('chrome-extension://') ||
      msg.includes('moz-extension://')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener(
    'error',
    (event) => {
      const msg = event?.message || '';
      const filename = event?.filename || '';
      if (
        msg.includes('MetaMask') ||
        filename.includes('chrome-extension://') ||
        filename.includes('moz-extension://') ||
        filename.includes('nkbihfbeogaeaoehlefnkodbefgpgknn')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
