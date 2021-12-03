const {
  contextBridge,
  ipcRenderer
} = require('electron')

contextBridge.exposeInMainWorld(
  'api', {
    send: (channel, data) => {
      ipcRenderer.send(channel, data)
    },
    invoke: (channel, data) => {
      return ipcRenderer.invoke(channel, data)
    }
  }
)
