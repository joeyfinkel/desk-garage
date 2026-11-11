import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import '@desk-garage/ui/styles.css';

import { App } from './app';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Application root is missing.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
