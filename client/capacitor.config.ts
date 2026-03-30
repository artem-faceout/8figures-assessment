import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eightfigures.portfolio',
  appName: '8Figures Portfolio',
  webDir: 'dist/client/browser',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#030304',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
