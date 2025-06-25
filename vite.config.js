import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    host: true, 
    port: 5173, 
  },build: {
    rollupOptions: {
      // Ensure ethers is bundled and not treated as external
      external: [],
    },
  },
})
