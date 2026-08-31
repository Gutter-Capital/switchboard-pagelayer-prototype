import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sites } from '@openai/sites-vite-plugin'
import { defineConfig } from 'vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(async () => {
  const { cloudflare } = await import('@cloudflare/vite-plugin')

  return {
    plugins: [
      react(),
      tailwindcss(),
      sites(),
      cloudflare({
        config: {
          name: 'server',
          main: './worker/index.ts',
          compatibility_date: '2026-08-31',
          compatibility_flags: ['nodejs_compat'],
          assets: {
            binding: 'ASSETS',
            not_found_handling: 'single-page-application',
          },
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
