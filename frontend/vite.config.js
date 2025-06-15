import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',       // 👈 Cho phép các máy khác truy cập qua LAN
    port: 5173,
    cors: true,            // 👈 Cho phép gửi cookie từ đúng origin
    origin: 'http://192.168.1.10:5173', // 👈 Đảm bảo trùng origin phía server
  }
})
