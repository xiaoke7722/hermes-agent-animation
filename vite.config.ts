import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 生产部署时设置 base 路径（如需部署到子目录，修改此处）
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 图片大于此值的不内联为 base64
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // 稳定文件名，方便缓存
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
})
