
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './hooks/useAuth.tsx';

// Initialize theme from localStorage with light as default
const initializeTheme = () => {
  if (localStorage.theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    // Default to light theme
    document.documentElement.classList.remove('dark');
    if (!localStorage.theme) {
      localStorage.setItem('theme', 'light');
    }
  }
};

// Initialize theme before rendering
initializeTheme();

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
