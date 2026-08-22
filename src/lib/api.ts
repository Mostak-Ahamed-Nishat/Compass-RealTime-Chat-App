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

export const users = {
  search: (q: string) => apiCall(`/users/search?q=${encodeURIComponent(q)}`),
}

export const conversations = {
  list: () => apiCall('/conversations'),

  startDirect: (userId: string) =>
    apiCall('/conversations', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  getMessages: (conversationId: string, limit = 20, before?: string) => {
    let url = `/conversations/${conversationId}/messages?limit=${limit}`
    if (before) url += `&before=${before}`
    return apiCall(url)
  },

  createGroup: (name: string, participantIds: string[]) =>
    apiCall('/conversations/group', {
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
    apiCall('/messages', {
      method: 'POST',
      body: JSON.stringify({ conversationId, text }),
    }),
}
