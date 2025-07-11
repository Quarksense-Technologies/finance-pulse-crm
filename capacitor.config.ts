
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d57acd1ddfc446949601f81cd7d28b50',
  appName: 'finance-pulse-crm',
  webDir: 'dist',
  // Remove server config for production APK - this should only be used for development
  // server: {
  //   url: 'https://d57acd1d-dfc4-4694-9601-f81cd7d28b50.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false
    },
    StatusBar: {
      style: "light",
      backgroundColor: "#3b82f6"
    }
  }
};

export default config;
