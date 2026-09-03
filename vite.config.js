import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Serve clean extensionless URLs for a few static pages during `vite dev`
// (e.g. /exzi -> public/exzi.html). Production uses vercel.json rewrites.
const cleanUrls = {
  name: 'clean-urls',
  configureServer(server) {
    const map = { '/exzi': '/exzi.html', '/exzi/': '/exzi.html', '/': '/learning-ecosystem.html' }
    server.middlewares.use((req, _res, next) => {
      const q = req.url.indexOf('?')
      const path = q === -1 ? req.url : req.url.slice(0, q)
      if (map[path]) req.url = map[path] + (q === -1 ? '' : req.url.slice(q))
      next()
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [cleanUrls, react(), tailwindcss()],
  assetsInclude: ['**/*.lottie'],
  server: {
    host: '0.0.0.0',
    port: 3000, // 👈 Force port 3000s
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // This should match your backend server URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})
