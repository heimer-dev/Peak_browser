import type { ForgeConfig } from '@electron-forge/shared-types'

const config: ForgeConfig = {
  packagerConfig: {
    name: 'peak-browser',
    executableName: 'peak-browser',
    appVersion: '0.1.0',
    icon: './resources/icon',
    asar: true,
    appBundleId: 'io.github.peak.browser',
    // electron-packager by default ignores /out/ — override to include our built files
    ignore: [
      /^\/src($|\/)/,
      /^\/electron($|\/)/,
      /^\/\.git($|\/)/,
      /^\/\.vscode($|\/)/,
      /^\/tsconfig.*\.json$/,
      /^\/electron\.vite\.config\./,
      /^\/vite\.renderer\.config\./,
      /^\/forge\.config\./,
      /^\/out($|\/)/,
      /^\/build\/flatpak($|\/)/,
      /^\/\.flatpak-builder($|\/)/,
    ],
  },

  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['linux'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          name: 'peak-browser',
          productName: 'Peak Browser',
          genericName: 'Web Browser',
          description: 'A secure browser with a hand-drawn sketchy UI',
          icon: './resources/icon.png',
          categories: ['Network', 'WebBrowser'],
        },
      },
    },
    {
      name: '@electron-forge/maker-flatpak',
      config: {
        options: {
          id: 'io.github.peak.browser',
          productName: 'Peak Browser',
          genericName: 'Web Browser',
          description: 'A secure browser with a hand-drawn sketchy UI',
          icon: './resources/icon.png',
          categories: ['Network', 'WebBrowser'],
          mimeType: ['x-scheme-handler/http', 'x-scheme-handler/https'],
          runtimeVersion: '23.08',
          baseVersion: '23.08',
          branch: 'stable',
          buildOptions: {
            'prepend-path': '/home/julian/bin:/usr/bin',
          },
          finishArgs: [
            '--share=ipc',
            '--share=network',
            '--socket=x11',
            '--socket=wayland',
            '--socket=pulseaudio',
            '--device=dri',
            '--filesystem=home',
            '--talk-name=org.freedesktop.Notifications',
          ],
        },
      },
    },
  ],
}

export default config
