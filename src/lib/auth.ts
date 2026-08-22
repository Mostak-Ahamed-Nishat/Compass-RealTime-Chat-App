export const auth = {
  getToken: () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  },

  setToken: (token: string) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('token', token)
  },

  clearToken: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('token')
  },

  isAuthenticated: () => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('token')
  },
}
