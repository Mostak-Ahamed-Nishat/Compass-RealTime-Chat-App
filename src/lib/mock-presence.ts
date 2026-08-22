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

// Mock read receipt data: track which messages have been seen
// In a real app, this would come from the API
const mockSeenMessages: Set<string> = new Set()

// Mark a message as seen
export const markMessageAsSeen = (messageId: string) => {
  mockSeenMessages.add(messageId)
}

// Check if a message has been seen
export const isMessageSeen = (messageId: string): boolean => {
  // By default, messages are marked as seen after a short delay
  return mockSeenMessages.has(messageId)
}

// Simulate message delivery (mark messages as seen)
export const initializeMockReadReceipts = () => {
  // Mark all messages as seen on load (simulating delivery)
  // In a real app, you'd listen to Socket.io events for read receipts
  if (typeof window !== 'undefined') {
    const timer = setTimeout(() => {
      // This would be populated by actual Socket.io events
      // For now, all messages are seen by default
    }, 500)
    return () => clearTimeout(timer)
  }
}

// Helper to enrich messages with mock seen status
// For demo purposes: all messages are marked as seen by default
export const enrichMessagesWithSeenStatus = (messages: any[]) => {
  return messages.map((msg, index) => ({
    ...msg,
    // For demo: mark all messages except the last one as seen
    seen: index < messages.length - 1,
  }))
}
