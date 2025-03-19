import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import '@/i18n/config'; // Φορτώνουμε τις μεταφράσεις
import { initGA } from './lib/analytics'; // Εισάγουμε το analytics

// Αρχικοποίηση του Google Analytics
initGA();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
