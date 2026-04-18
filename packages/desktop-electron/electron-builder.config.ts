import { execFile } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

import type { Configuration } from "electron-builder"

import { APP_IDS, APP_NAMES, FORK_REPO, PRODUCT_NAME, PROTOCOL_SCHEME } from "./branding"

const execFileAsync = promisify(execFile)
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const signScript = path.join(rootDir, "script", "sign-windows.ps1")

async function signWindows(configuration: { path: string }) {
  if (process.platform !== "win32") return
  if (process.env.GITHUB_ACTIONS !== "true") return

  await execFileAsync(
    "pwsh",
    ["-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", signScript, configuration.path],
    { cwd: rootDir },
  )
}

const channel = (() => {
  const raw = process.env.OPENCODE_CHANNEL
  if (raw === "dev" || raw === "beta" || raw === "prod") return raw
  return "dev"
})()

const repo = (process.env.GH_REPO ?? process.env.GITHUB_REPOSITORY ?? FORK_REPO).trim()
const [publishOwner, publishRepo] = repo.split("/")

if (!publishOwner || !publishRepo) {
  throw new Error(`Invalid GitHub repository slug: ${repo}`)
}

const getBase = (): Configuration => ({
  artifactName: "opencode-desktop-${os}-${arch}.${ext}",
  directories: {
    output: "dist",
    buildResources: "resources",
  },
  files: ["out/**/*", "resources/**/*"],
  extraResources: [
    {
      from: "native/",
      to: "native/",
      filter: ["index.js", "index.d.ts", "build/Release/mac_window.node", "swift-build/**"],
    },
  ],
  mac: {
    category: "public.app-category.developer-tools",
    icon: `resources/icons/icon.icns`,
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: "resources/entitlements.plist",
    entitlementsInherit: "resources/entitlements.plist",
    notarize: true,
    target: ["dmg", "zip"],
  },
  dmg: {
    sign: true,
  },
  protocols: {
    name: PRODUCT_NAME,
    schemes: [PROTOCOL_SCHEME],
  },
  win: {
    icon: `resources/icons/icon.ico`,
    signtoolOptions: {
      sign: signWindows,
    },
    target: ["nsis"],
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    installerIcon: `resources/icons/icon.ico`,
    installerHeaderIcon: `resources/icons/icon.ico`,
  },
  linux: {
    icon: `resources/icons`,
    category: "Development",
    target: ["AppImage", "deb", "rpm"],
  },
})

function getConfig() {
  const base = getBase()

  switch (channel) {
    case "dev": {
      return {
        ...base,
        appId: APP_IDS.dev,
        productName: APP_NAMES.dev,
        rpm: { packageName: "opencode-desktop-dev" },
      }
    }
    case "beta": {
      return {
        ...base,
        appId: APP_IDS.beta,
        productName: APP_NAMES.beta,
        protocols: { name: APP_NAMES.beta, schemes: [PROTOCOL_SCHEME] },
        publish: { provider: "github", owner: publishOwner, repo: publishRepo, channel: "latest" },
        rpm: { packageName: "opencode-desktop-beta" },
      }
    }
    case "prod": {
      return {
        ...base,
        appId: APP_IDS.prod,
        productName: APP_NAMES.prod,
        protocols: { name: APP_NAMES.prod, schemes: [PROTOCOL_SCHEME] },
        publish: { provider: "github", owner: publishOwner, repo: publishRepo, channel: "latest" },
        rpm: { packageName: "opencode-desktop" },
      }
    }
  }
}

export default getConfig()
