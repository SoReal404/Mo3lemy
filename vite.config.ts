import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'src/chemistry-lab',
  base: '/chemistry-lab/',
  build: {
    outDir: '../../public/chemistry-lab',
    emptyOutDir: true,
    sourcemap: false,
  },
});
