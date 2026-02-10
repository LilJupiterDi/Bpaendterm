import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Решение для __dirname в ESM
const __dirname = path.resolve(); 

export default defineConfig({
  // Замените 'имя-вашего-репозитория' на реальное название проекта
  base: '/Bpaendterm/', 
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
