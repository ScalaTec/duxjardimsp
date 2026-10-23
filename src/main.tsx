import '@fontsource-variable/inter/wght.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';

window.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') document.documentElement.classList.add('kbd');
});

// HashRouter: o app roda via file:// no Electron empacotado.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
