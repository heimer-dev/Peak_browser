import { app, BrowserWindow, session, ipcMain, shell, WebContents, Menu } from 'electron'
import path from 'path'
import { shouldBlockUrl, incrementBlockedCount, blockedCount } from './adblock'
import { shouldRedirectToHttps, setupSecurityHeaders } from './https-enforcer'

// Per-origin JS disable tracking: origin -> blocked
const jsDisabledOrigins = new Map<string, boolean>()

function applyNetworkFilters(sess: typeof session.defaultSession): void {
  // Single combined onBeforeRequest listener (singular per session)
  sess.webRequest.onBeforeRequest(
    { urls: ['http://*/*', 'https://*/*'] },
    (details, callback) => {
      // 1. Check ad/tracker block
      if (shouldBlockUrl(details.url)) {
        incrementBlockedCount()
        callback({ cancel: true })
        return
      }
      // 2. HTTPS redirect
      const httpsUrl = shouldRedirectToHttps(details.url)
      if (httpsUrl) {
        callback({ redirectURL: httpsUrl })
        return
      }
      // 3. JS toggle: block script resources for disabled origins
      if (details.resourceType === 'script') {
        try {
          const { origin } = new URL(details.url)
          if (jsDisabledOrigins.get(origin)) {
            callback({ cancel: true })
            return
          }
        } catch { /* ignore */ }
      }
      callback({})
    }
  )

  setupSecurityHeaders(sess)
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#f5f0e8',
    icon: path.join(__dirname, '../../resources/icon.png'),
    titleBarStyle: process.platform === 'linux' ? 'default' : 'hidden',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../../build/preload/preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webviewTag: true,
    }
  })

  // Apply security filters to default session
  applyNetworkFilters(session.defaultSession)

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  return win
}

app.whenReady().then(() => {
  // Remove the default menu bar entirely
  Menu.setApplicationMenu(null)
  // Configure private in-memory session
  const privateSession = session.fromPartition('in-memory-private')
  applyNetworkFilters(privateSession)
  privateSession.cookies.on('changed', (_event, cookie, _cause, removed) => {
    if (!removed && !cookie.session) {
      privateSession.cookies.remove(
        `https://${cookie.domain.replace(/^\./, '')}`,
        cookie.name
      )
    }
  })

  // Deny sensitive permissions globally
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, permission, callback) => {
      const allowed = new Set(['clipboard-read', 'clipboard-sanitized-write'])
      callback(allowed.has(permission))
    }
  )

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// IPC: JS toggle per origin
ipcMain.handle('security:toggle-js', (_event, { origin, enabled }: { origin: string; enabled: boolean }) => {
  if (enabled) {
    jsDisabledOrigins.delete(origin)
  } else {
    jsDisabledOrigins.set(origin, true)
  }
  return { success: true }
})

// IPC: Get blocked request count
ipcMain.handle('security:blocked-count', () => blockedCount)

// IPC: Open external URL safely
ipcMain.handle('shell:open-external', (_event, url: string) => {
  const parsed = new URL(url)
  if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
    shell.openExternal(url)
  }
})

// Prevent webview from loading disallowed protocols
app.on('web-contents-created', (_event, contents: WebContents) => {
  contents.on('will-navigate', (event, url) => {
    const parsed = new URL(url)
    const allowed = new Set(['https:', 'http:', 'about:'])
    if (!allowed.has(parsed.protocol)) {
      event.preventDefault()
    }
  })
})
