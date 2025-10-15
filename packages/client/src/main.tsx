import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

// Configure status bar on mobile
if (Capacitor.isNativePlatform()) {
  // Apply status bar styling with a delay to ensure it works
  setTimeout(() => {
    StatusBar.setStyle({ style: 'LIGHT' }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#1a1a1a' }).catch(() => {});
    StatusBar.show().catch(() => {});
  }, 100);
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
