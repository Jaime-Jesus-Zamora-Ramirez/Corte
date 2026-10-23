import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages sirve el sitio en https://<usuario>.github.io/Corte/
  // (en desarrollo se queda en "/")
  base: command === 'build' ? '/Corte/' : '/',
  plugins: [react(), tailwindcss()],
}))
