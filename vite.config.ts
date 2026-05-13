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
      },
    },
  }
})
