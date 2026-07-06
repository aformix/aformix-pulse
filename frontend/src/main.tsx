import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/index.css';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '';

const app = (
  <React.StrictMode>
    {GOOGLE_CLIENT_ID ? (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <ThemeProvider defaultTheme="system" storageKey="aformix-theme">
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    ) : (
      <ThemeProvider defaultTheme="system" storageKey="aformix-theme">
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    )}
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('root')!).render(app);
