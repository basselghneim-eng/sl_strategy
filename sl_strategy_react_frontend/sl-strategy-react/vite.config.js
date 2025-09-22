import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: change 'sl-strategy' to *your repo name*
export default defineConfig({
  plugins: [react()],
  base: '/sl-strategy/',
  server: {
    allowedHosts: [
      '592cb113c102.ngrok-free.app',
      'c46e05acc511.ngrok-free.app',
      'f98f090540a4.ngrok-free.app',
  '3c04e0506669.ngrok-free.app',
  'ffb69e61f2ed.ngrok-free.app',
  '5728a8a6b330.ngrok-free.app'
    ]
  }
})
