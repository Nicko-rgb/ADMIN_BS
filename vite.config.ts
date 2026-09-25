import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  // basicSsl sirve el dev server por HTTPS (cert autofirmado) — requerido para probar el
  // back_url de MercadoPago, que rechaza http:// en local.
  plugins: [react(), basicSsl()],
  server: {
    port: 5000,
    // Evita CORS en dev: el navegador ve /api como same-origin, Vite lo reenvía al backend.
    proxy: {
      '/api': 'http://localhost:5010',
    },
  },
})
