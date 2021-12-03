const { app, screen, BrowserWindow } = require('electron')
const windowStateKeeper = require('electron-window-state')

const isProd = app.isPackaged

module.exports = function createWindow (windowName = 'main', options = {}) {
  const winOptions = {
    minWidth: 1280,
    minHeight: 720,
    // titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    ...options,
    webPreferences: {
      contextIsolation: true,
      devTools: !isProd,
      spellcheck: false,
      nodeIntegration: false,
      ...(options.webPreferences || {})
    }
  }

  let windowState = windowStateKeeper({
    defaultWidth: winOptions.minWidth,
    defaultHeight: winOptions.minHeight
  })

  let win = new BrowserWindow({
    ...winOptions,
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height
  })
  windowState.manage(win)

  return win
}
