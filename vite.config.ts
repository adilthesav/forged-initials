import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Mock all figma: protocol imports so the project builds outside Figma Make
const figmaCompatPlugin = (): Plugin => ({
  name: 'figma-compat',
  resolveId(id) {
    if (id === 'figma:foundry-client-api') return '\0figma:foundry-client-api';
    if (id.startsWith('figma:asset/')) return '\0' + id;
  },
  load(id) {
    if (id === '\0figma:foundry-client-api') return 'export default {}';
    // Return empty string for image assets — UI components with fallbacks handle this
    if (id.startsWith('\0figma:asset/')) return 'export default ""';
  },
});

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    figmaCompatPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/app'),
    },
  },
})
