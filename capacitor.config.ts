import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sagradas.escrituras',
  appName: 'As Sagradas Escrituras',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
