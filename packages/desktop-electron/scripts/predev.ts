import { $ } from "bun"
import { existsSync } from "node:fs"

if (!existsSync("node_modules/electron/path.txt")) {
  await $`node ./node_modules/electron/install.js`
}

await $`bun ./scripts/copy-icons.ts ${process.env.OPENCODE_CHANNEL ?? "dev"}`

await $`cd ../opencode && bun script/build-node.ts`
