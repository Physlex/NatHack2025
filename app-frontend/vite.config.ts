import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowbiteReact from "flowbite-react/plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  server: {
    proxy: {
      // Proxy all /api requests to your Django backend
      '/api': {
        target: 'https://brain-box-68c92647e146.herokuapp.com', // Your Django server
        changeOrigin: true,
        secure: false,
      },
      // If you have other backend endpoints, add them here
      '/admin': {
        target: 'https://brain-box-68c92647e146.herokuapp.com/admin/',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})