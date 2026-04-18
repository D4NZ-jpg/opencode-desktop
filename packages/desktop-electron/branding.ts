export const FORK_REPO = "D4NZ-jpg/opencode-desktop"
export const FORK_REPO_URL = `https://github.com/${FORK_REPO}`
export const PRODUCT_NAME = "OpenCode Desktop"
export const PROTOCOL_SCHEME = "opencode-desktop"

export const APP_NAMES = {
  dev: `${PRODUCT_NAME} Dev`,
  beta: `${PRODUCT_NAME} Beta`,
  prod: PRODUCT_NAME,
} as const

export const APP_IDS = {
  dev: "io.github.d4nzjpg.opencode_desktop.dev",
  beta: "io.github.d4nzjpg.opencode_desktop.beta",
  prod: "io.github.d4nzjpg.opencode_desktop",
} as const
