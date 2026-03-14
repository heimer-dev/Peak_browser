# Peak Browser

A secure Electron-based browser with a hand-drawn sketchy UI, built with React and TypeScript.

---

## Installation

### Option 1: Flatpak (recommended)

Install via Flatpak for a sandboxed, system-independent setup.

#### From Flathub (coming soon)

```bash
flatpak install flathub io.github.heimerdev.PeakBrowser
```

#### Manual Flatpak build

**Prerequisites:**
- `flatpak`
- `flatpak-builder`
- Flatpak runtime: `org.freedesktop.Platform//24.08`
- Flatpak SDK: `org.freedesktop.Sdk//24.08`
- Base app: `org.electronjs.Electron2.BaseApp//24.08`

```bash
# Add Flathub remote (if not already added)
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo

# Install required runtimes
flatpak install flathub org.freedesktop.Platform//24.08 org.freedesktop.Sdk//24.08
flatpak install flathub org.electronjs.Electron2.BaseApp//24.08

# Build and install
flatpak-builder --user --install --force-clean build-dir io.github.heimerdev.PeakBrowser.yml

# Run
flatpak run io.github.heimerdev.PeakBrowser
```

---

### Option 2: Native (from source)

Build and run Peak Browser directly on your system without sandboxing.

**Prerequisites:**
- Node.js >= 18
- npm

```bash
# Clone the repository
git clone https://github.com/heimer-dev/Peak_browser.git
cd Peak_browser

# Install dependencies
npm install

# Start in development mode
npm run dev
```

#### Build a native package

```bash
# Build the app
npm run build

# Package (creates a distributable in out/)
npm run package

# Or create a .deb package
npm run make
```

The built packages will be in the `out/` directory.

#### Run without packaging

After `npm run build`, you can run the compiled app directly with Electron:

```bash
npx electron build/main/main.js
```

---

## Development

```bash
npm run dev       # Start dev server with hot reload
npm run build     # Compile TypeScript + Vite bundles
npm run package   # Package into distributable
npm run make      # Build .deb / .zip packages
```

---

## Tech Stack

- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [electron-vite](https://electron-vite.org/)
- [Rough.js](https://roughjs.com/) (sketchy UI rendering)
- [Zustand](https://zustand-demo.pmnd.rs/) (state management)

---

## License

ISC
