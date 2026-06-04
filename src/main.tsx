import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './app/context/AppContext';
import App from './app/App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
