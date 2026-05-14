import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'mindjelly',
  brand: {
    displayName: '마음젤리',
    primaryColor: '#FFD1DC',
    icon: '', // Empty for now, will be set from console later
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
