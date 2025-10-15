import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.octadecimal.spacer',
  appName: 'Spacer',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
