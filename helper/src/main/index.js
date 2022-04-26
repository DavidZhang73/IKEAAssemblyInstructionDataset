const createWindow = require('./create-window.js')
const initService = require('./service/index.js')
const { app, session } = require('electron')
const contextMenu = require('electron-context-menu')
const path = require('path')
const { ElectronBlocker } = require('@cliqz/adblocker-electron')
const fetch = require('node-fetch')

ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
  blocker.enableBlockingInSession(session.defaultSession);
});

try {
  require('electron-reloader')(module, { watchRenderer: false })
} catch { }

contextMenu({
  showSearchWithGoogle: false,
  showCopyImage: false,
  prepend: (defaultActions, params, browserWindow) => [
    {
      label: 'Jiahao Zhang'
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
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true
    }
  })

  mainWindow.once('close', () => {
    mainWindow = null
  })

  const port = process.env.PORT || 3000
  if (isDev) {
    loadVitePage(port)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile('dist/index.html')
  }

  mainWindow.once('ready-to-show', () => {
    initService()
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
