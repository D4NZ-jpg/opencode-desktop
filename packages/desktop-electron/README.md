# OpenCode Desktop Electron

Electron desktop app for this fork.

## Development

From the repo root:

```bash
bun install --frozen-lockfile
bun run dev:desktop
```

Or run it directly from the package:

```bash
bun run --cwd packages/desktop-electron dev
```

This runs `electron-vite dev`, opens the desktop window, and prepares the embedded server bundle used by Electron.

- Renderer changes use Vite HMR.
- Main and preload changes rebuild and restart Electron.

## Build

To create the production Electron bundles:

```bash
bun run build:desktop
```

Or directly:

```bash
bun run --cwd packages/desktop-electron build
```

## Package

To create a packaged desktop app for the current platform:

```bash
bun run package:desktop
```

For a macOS package specifically:

```bash
bun run --cwd packages/desktop-electron package:mac
```

## Prerequisites

You only need Bun and the normal workspace dependencies for local Electron development. Tauri/Rust setup is not required for this package.
