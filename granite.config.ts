import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'mindjelly',
  brand: {
    displayName: '마음젤리',
    primaryColor: '#FFD1DC',
    icon: 'https://static.toss.im/appsintoss/41387/11283758-3397-4a75-97ba-435fac3337e8.png',
  },
  webViewProps: {
    type: 'partner',
    overScrollMode: 'never',
    bounces: false,
  },
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
  },
  web: {
    host: 'localhost',
    port: 3000,
    commands: {
      dev: 'next dev',
      build: 'next build',
    },
  },
  outdir: 'out', // Next.js static export output directory
  permissions: [],
});
