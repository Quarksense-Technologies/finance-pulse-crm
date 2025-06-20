
import { useState, useEffect } from 'react';

interface AppSettings {
  appName: string;
  appDescription: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo: string;
  favicon: string;
  theme: 'light' | 'dark' | 'system';
}

interface LayoutSettings {
  sidebarWidth: string;
  headerHeight: string;
  cardRadius: string;
  spacing: 'tight' | 'normal' | 'relaxed';
  density: 'compact' | 'comfortable' | 'spacious';
}

export const useUISettings = () => {
  const [appSettings, setAppSettings] = useState<AppSettings>({
    appName: 'Business Management System',
    appDescription: 'Comprehensive business management and project tracking',
    primaryColor: '#3b82f6',
    secondaryColor: '#f1f5f9',
    accentColor: '#10b981',
    logo: '',
    favicon: '',
    theme: 'light'
  });

  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>({
    sidebarWidth: '256px',
    headerHeight: '64px',
    cardRadius: '8px',
    spacing: 'normal',
    density: 'comfortable'
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedAppSettings = localStorage.getItem('appSettings');
    const savedLayoutSettings = localStorage.getItem('layoutSettings');

    if (savedAppSettings) {
      setAppSettings(JSON.parse(savedAppSettings));
    }

    if (savedLayoutSettings) {
      setLayoutSettings(JSON.parse(savedLayoutSettings));
    }
  }, []);

  const updateAppSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...appSettings, ...newSettings };
    setAppSettings(updated);
    localStorage.setItem('appSettings', JSON.stringify(updated));
  };

  const updateLayoutSettings = (newSettings: Partial<LayoutSettings>) => {
    const updated = { ...layoutSettings, ...newSettings };
    setLayoutSettings(updated);
    localStorage.setItem('layoutSettings', JSON.stringify(updated));
  };

  const applyCustomStyles = () => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', appSettings.primaryColor);
    root.style.setProperty('--secondary-color', appSettings.secondaryColor);
    root.style.setProperty('--accent-color', appSettings.accentColor);
    root.style.setProperty('--sidebar-width', layoutSettings.sidebarWidth);
    root.style.setProperty('--header-height', layoutSettings.headerHeight);
    root.style.setProperty('--card-radius', layoutSettings.cardRadius);
  };

  useEffect(() => {
    applyCustomStyles();
  }, [appSettings, layoutSettings]);

  return {
    appSettings,
    layoutSettings,
    updateAppSettings,
    updateLayoutSettings,
    applyCustomStyles
  };
};
