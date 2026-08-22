// Mock presence and read receipt data
// In a real app, this would come from Socket.io or a presence API

// Map of user IDs to their presence status
const mockPresence: Record<string, boolean> = {
  // Users are randomly online/offline for demo purposes
  // You can hardcode specific user IDs here to set their presence
}

// Get mock presence status for a user
export const getMockPresence = (userId: string): boolean => {
  if (userId in mockPresence) {
    return mockPresence[userId]
  }
  // By default, users are online
  return true
}

// Set mock presence for a user (for testing)
export const setMockPresence = (userId: string, isOnline: boolean) => {
  mockPresence[userId] = isOnline
}

// Get last seen timestamp for offline users (mock)
export const getMockLastSeen = (userId: string): string => {
  const lastSeenMap: Record<string, string> = {
    // You can configure specific last seen times here
  }
  return lastSeenMap[userId] || 'recently'
}

// Read receipts are NOT faked here — the live API has no "seen"/"read"
// endpoint or socket event (confirmed by directly probing the server: no
// such event is ever relayed between two different accounts), so there is
// no real data to enrich messages with. See ui/read-receipt.tsx.
