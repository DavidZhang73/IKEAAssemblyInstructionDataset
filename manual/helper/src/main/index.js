const createWindow = require('./create-window.js')
const { app } = require('electron')
const contextMenu = require('electron-context-menu')

try {
  require('electron-reloader')(module)
} catch { }

contextMenu({
  showSearchWithGoogle: false,
  showCopyImage: false,
  prepend: (defaultActions, params, browserWindow) => [
    {
      label: 'its like magic 💥'
    }
  ]
})

const isDev = !app.isPackaged

let mainWindow

function loadVitePage (port) {
  mainWindow.loadURL(`http://localhost:${port}`).catch((err) => {
    console.log('VITE NOT READY, WILL TRY AGAIN IN 200ms')
    setTimeout(() => {
      loadVitePage(port)
    }, 200)
  })
}

function createMainWindow () {
  mainWindow = createWindow('main', {
    show: false
  })
  mainWindow.once('close', () => {
    mainWindow = null
  })

  const port = process.env.PORT || 3000
  if (isDev) {
    loadVitePage(port)
  } else {
    mainWindow.loadFile('dist/index.html')
  }

  mainWindow.once('ready-to-show', () => {
    console.log('READY')
    mainWindow.show()
    mainWindow.focus()
  })
}

app.once('ready', createMainWindow)
app.on('activate', () => {
  if (!mainWindow) {
    createMainWindow()
  }
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
