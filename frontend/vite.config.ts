import { defineConfig } from 'vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  envDir: '..',
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), tanstackStart(), nitro(), viteReact()],
  server: {
    proxy: {
      '/dashboard/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})

export default config
