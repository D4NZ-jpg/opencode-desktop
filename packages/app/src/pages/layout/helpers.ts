import { getFilename } from "@opencode-ai/shared/util/path"
import { type Project, type Session } from "@opencode-ai/sdk/v2/client"

export type SidebarProjectSortOrder = "updated_at" | "created_at" | "manual"
export type SidebarThreadSortOrder = "updated_at" | "created_at"

type SessionStore = {
  session?: Session[]
  path: { directory: string }
}

export const workspaceKey = (directory: string) => {
  const value = directory.replaceAll("\\", "/")
  const drive = value.match(/^([A-Za-z]:)\/+$/)
  if (drive) return `${drive[1]}/`
  if (/^\/+$/i.test(value)) return "/"
  return value.replace(/\/+$/, "")
}

export const threadSortTimestamp = (session: Session, order: SidebarThreadSortOrder) =>
  order === "created_at" ? session.time.created : (session.time.updated ?? session.time.created)

function sortSessions(now: number, order: SidebarThreadSortOrder) {
  const oneMinuteAgo = now - 60 * 1000
  return (a: Session, b: Session) => {
    if (order === "created_at") return threadSortTimestamp(b, order) - threadSortTimestamp(a, order)

    const aUpdated = threadSortTimestamp(a, order)
    const bUpdated = threadSortTimestamp(b, order)
    const aRecent = aUpdated > oneMinuteAgo
    const bRecent = bUpdated > oneMinuteAgo
    if (aRecent && bRecent) return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
    if (aRecent && !bRecent) return -1
    if (!aRecent && bRecent) return 1
    return bUpdated - aUpdated
  }
}

const isRootVisibleSession = (session: Session, directory: string) =>
  workspaceKey(session.directory) === workspaceKey(directory) && !session.parentID && !session.time?.archived

export const roots = (store: SessionStore) =>
  (store.session ?? []).filter((session) => isRootVisibleSession(session, store.path.directory))

export const sortedRootSessions = (store: SessionStore, now: number, order: SidebarThreadSortOrder = "updated_at") =>
  roots(store).sort(sortSessions(now, order))

export const latestRootSession = (stores: SessionStore[], now: number, order: SidebarThreadSortOrder = "updated_at") =>
  stores.flatMap(roots).sort(sortSessions(now, order))[0]

export function hasProjectPermissions<T>(
  request: Record<string, T[] | undefined> | undefined,
  include: (item: T) => boolean = () => true,
) {
  return Object.values(request ?? {}).some((list) => list?.some(include))
}

export const childSessionOnPath = (sessions: Session[] | undefined, rootID: string, activeID?: string) => {
  if (!activeID || activeID === rootID) return
  const map = new Map((sessions ?? []).map((session) => [session.id, session]))
  let id = activeID

  while (id) {
    const session = map.get(id)
    if (!session?.parentID) return
    if (session.parentID === rootID) return session
    id = session.parentID
  }
}

export const displayName = (project: { name?: string; worktree: string }) =>
  project.name || getFilename(project.worktree)

const projectSortTimestamp = (
  project: { worktree: string; name?: string; time?: Partial<Project["time"]> },
  stores: SessionStore[],
  now: number,
  order: Exclude<SidebarProjectSortOrder, "manual">,
) => {
  const session = latestRootSession(stores, now, order)
  if (session) return threadSortTimestamp(session, order)
  if (order === "created_at") return project.time?.created ?? 0
  return project.time?.updated ?? project.time?.created ?? 0
}

export const sortProjectsForSidebar = <T extends { worktree: string; name?: string; time?: Partial<Project["time"]> }>(
  projects: T[],
  stores: (project: T) => SessionStore[],
  now: number,
  order: SidebarProjectSortOrder,
) => {
  if (order === "manual") return projects.slice()

  return projects.slice().sort((a, b) => {
    const bTimestamp = projectSortTimestamp(b, stores(b), now, order)
    const aTimestamp = projectSortTimestamp(a, stores(a), now, order)
    if (bTimestamp !== aTimestamp) return bTimestamp - aTimestamp

    const name = displayName(a).localeCompare(displayName(b))
    if (name !== 0) return name
    return a.worktree.localeCompare(b.worktree)
  })
}

export const errorMessage = (err: unknown, fallback: string) => {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string } }).data
    if (data?.message) return data.message
  }
  if (err instanceof Error) return err.message
  return fallback
}

export const effectiveWorkspaceOrder = (local: string, dirs: string[], persisted?: string[]) => {
  const root = workspaceKey(local)
  const live = new Map<string, string>()

  for (const dir of dirs) {
    const key = workspaceKey(dir)
    if (key === root) continue
    if (!live.has(key)) live.set(key, dir)
  }

  if (!persisted?.length) return [local, ...live.values()]

  const result = [local]
  for (const dir of persisted) {
    const key = workspaceKey(dir)
    if (key === root) continue
    const match = live.get(key)
    if (!match) continue
    result.push(match)
    live.delete(key)
  }

  return [...result, ...live.values()]
}
