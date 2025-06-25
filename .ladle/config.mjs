
export default {
  stories: "src/**/*.stories.{js,jsx,ts,tsx}",
  addons: {
    theme: {
      enabled: true,
      defaultTheme: "light",
    },
    control: {
      enabled: true,
    },
    source: {
      enabled: true,
    },
  },
  viteConfig: (config) => {
    // Ensure Ladle uses the same alias configuration as your main app
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": new URL("../src", import.meta.url).pathname,
    };
    return config;
  },
};
