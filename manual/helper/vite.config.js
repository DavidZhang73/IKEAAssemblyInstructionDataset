import vue from '@vitejs/plugin-vue'
import path from 'path'

const rootPath = path.resolve(__dirname)
const srcPath = path.resolve(__dirname, 'src', 'renderer')

module.exports = {
  server: {
    open: false, // do not open the browser as we use electron
    port: process.env.PORT || 3000
  },
  root: './src/renderer',
  build: {
    outDir: path.join(rootPath, 'dist')
  },
  resolve: {
    alias: [
      {
        find: '~',
        replacement: srcPath
      }
    ]
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag === 'webview'
        }
      }
    })
  ],
  optimizeDeps: {
    // exclude path and electron-window-state as we are using the node runtime inside the browser
    // and don't want vite to complain. If you have any issues importing node packages and vite complains,
    // add them here
    exclude: ['path', 'electron-window-state']
  }
}
