import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(() => {
  const openAiKey = process.env.OPEN_AI_KEY || ''

  if (!openAiKey) {
    console.warn('[vite] 未检测到环境变量 OPEN_AI_KEY，/api/chat 请求将失败。')
  }

  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api/chat': {
          target: 'https://dashscope.aliyuncs.com',
          changeOrigin: true,
          rewrite: () => '/compatible-mode/v1/chat/completions',
          configure(proxy) {
            proxy.on('proxyReq', (proxyReq) => {
              if (openAiKey) {
                proxyReq.setHeader('Authorization', `Bearer ${openAiKey}`)
              }
            })
          },
        },
        '/api/image/generate': {
          target: 'https://dashscope.aliyuncs.com',
          changeOrigin: true,
          rewrite: () => '/api/v1/services/aigc/text2image/image-synthesis',
          configure(proxy) {
            proxy.on('proxyReq', (proxyReq) => {
              if (openAiKey) {
                proxyReq.setHeader('Authorization', `Bearer ${openAiKey}`)
              }
              proxyReq.setHeader('X-DashScope-Async', 'enable')
            })
          },
        },
        '/api/image/task': {
          target: 'https://dashscope.aliyuncs.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/image\/task/, '/api/v1/tasks'),
          configure(proxy) {
            proxy.on('proxyReq', (proxyReq) => {
              if (openAiKey) {
                proxyReq.setHeader('Authorization', `Bearer ${openAiKey}`)
              }
            })
          },
        },
      },
    },
  }
})
