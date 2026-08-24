import { demoApi, isDemoMode } from './demo-mode'

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export interface ApiError {
  error: {
    message: string
    code: string
    details?: Array<{ path: string; message: string }>
  }
}

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error: ApiError = await response.json()
    throw error
  }

  return response.json()
}

export const auth = {
  login: (phone: string, name: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, name }),
    }),

  me: () => apiCall('/auth/me'),
}

// The live API's /users/search is case-sensitive AND prefix-only — confirmed
// directly against the server: "Nishat"/"Nish" match a user named "Nishat",
// but "nishat"/"nish" (lowercase) return nothing, and even a correctly-cased
// mid-string substring like "isha" matches nothing. Since that's a backend
// limitation we can't fix, query the common case variants of what the user
// typed in parallel and merge the results so search feels case-insensitive.
function getCaseVariants(q: string): string[] {
  const trimmed = q.trim()
  return Array.from(
    new Set([
      trimmed,
      trimmed.toLowerCase(),
      trimmed.toUpperCase(),
      trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase(),
    ])
  )
}

export const users = {
  search: async (q: string) => {
    if (isDemoMode()) return demoApi.users.search(q)

    const results = await Promise.all(
      getCaseVariants(q).map((variant) =>
        apiCall<any[]>(`/users/search?q=${encodeURIComponent(variant)}`).catch(
          () => []
        )
      )
    )
    const merged = new Map<string, any>()
    for (const list of results) {
      for (const user of list ?? []) {
        merged.set(user._id, user)
      }
    }
    return Array.from(merged.values())
  },
}

export const conversations = {
  list: () => (isDemoMode() ? demoApi.conversations.list() : apiCall('/conversations')),

  startDirect: (userId: string) =>
    isDemoMode()
      ? demoApi.conversations.startDirect(userId)
      : apiCall('/conversations', {
          method: 'POST',
          body: JSON.stringify({ userId }),
        }),

  getMessages: (conversationId: string, limit = 20, before?: string) => {
    if (isDemoMode()) return demoApi.conversations.getMessages(conversationId)
    let url = `/conversations/${conversationId}/messages?limit=${limit}`
    if (before) url += `&before=${before}`
    return apiCall(url)
  },

  createGroup: (name: string, participantIds: string[]) =>
    isDemoMode()
      ? demoApi.conversations.createGroup(name, participantIds)
      : apiCall('/conversations/group', {
          method: 'POST',
          body: JSON.stringify({ name, participantIds }),
        }),

  addParticipants: (conversationId: string, userIds: string[]) =>
    apiCall(`/conversations/${conversationId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    }),

  removeParticipant: (conversationId: string, userId: string) =>
    apiCall(`/conversations/${conversationId}/participants/${userId}`, {
      method: 'DELETE',
    }),

  promoteAdmin: (conversationId: string, userId: string) =>
    apiCall(`/conversations/${conversationId}/admins`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  rename: (conversationId: string, name: string) =>
    apiCall(`/conversations/${conversationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),
}

export const messages = {
  send: (conversationId: string, text: string) =>
    isDemoMode()
      ? demoApi.messages.send(conversationId, text)
      : apiCall('/messages', {
          method: 'POST',
          body: JSON.stringify({ conversationId, text }),
        }),
}
