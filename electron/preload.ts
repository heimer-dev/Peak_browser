import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('peakAPI', {
  toggleJS: (origin: string, enabled: boolean) =>
    ipcRenderer.invoke('security:toggle-js', { origin, enabled }),

  getBlockedCount: () =>
    ipcRenderer.invoke('security:blocked-count'),

  openExternal: (url: string) =>
    ipcRenderer.invoke('shell:open-external', url),
})
