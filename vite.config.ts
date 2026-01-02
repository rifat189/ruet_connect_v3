import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '')

  return {
    /**
     * REQUIRED for GitHub Pages and static hosting
     * Prevents broken JS/CSS paths
     */
    base: './',

    /**
     * Dev server configuration
     */
    server: {
      port: 3000,
      host: true,
    },

    /**
     * React plugin
     */
    plugins: [react()],

    /**
     * Path aliases
     * Usage: import Something from "@/components/Something"
     */
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    /**
     * Optional: define global constants
     * (Only if you really need them globally)
     */
    define: {
      __GEMINI_API_KEY__: JSON.stringify(env.VITE_GEMINI_API_KEY),
    },

    /**
     * Build configuration
     */
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  }
})
