// Persisted, best-effort cache for instant reload — the in-memory
// revalidation logic in chat.tsx avoids redundant network calls while the
// tab is open, but a hard reload wipes React state entirely. This layer
// lets the UI hydrate from the last-known snapshot immediately, then the
// normal fetch/revalidation flow silently corrects it in the background
// (stale-while-revalidate), instead of every reload showing a blank
// "Loading conversations…" screen.
const NAMESPACE = 'compass-chat:v1'

export function conversationsCacheKey(userId: string): string {
  return `${NAMESPACE}:conversations:${userId}`
}

export function messagesCacheKey(userId: string, conversationId: string): string {
  return `${NAMESPACE}:messages:${userId}:${conversationId}`
}

export function loadCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function saveCache(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded (image-heavy conversations can be large) or storage
    // disabled (private browsing) — caching is strictly a nice-to-have,
    // never worth crashing or surfacing an error over.
  }
}

export function removeCache(key: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // best effort, see saveCache
  }
}
