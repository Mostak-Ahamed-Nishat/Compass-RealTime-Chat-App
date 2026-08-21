# Compass Chat - Project Documentation

**Project:** Real-time chat application (React/Next.js)  
**Deadline:** Aug 22, 2026 4:00 PM  
**GitHub Repo:** `compass-chat`  
**API Docs:** https://frontend-task-chatapp.onrender.com/docs/

---

## Overview

**Part 1:** Build chat app with API documentation (focus: chat panel)  
**Part 2:** Create landing page  
**Part 3:** Write-up on approach, AI tool usage, improvements  

---

## API Base URL
```
https://frontend-task-chatapp.onrender.com/api
```

All endpoints require `Authorization: Bearer {token}` except `/auth/login` and `/health`.

---

## API Endpoints Summary

### Authentication
- **POST** `/auth/login` Returns `{token, user}`
- **GET** `/auth/me` Returns current user `{_id, name, phone, createdAt}`

### Users
- **GET** `/users/search?q=query` Returns array of users `[{_id, name, phone}]`

### Conversations
- **GET** `/conversations` Returns `{data: [conversations]}`
- **POST** `/conversations` Create direct chat, body: `{recipientId}`
- **GET** `/conversations/{id}/messages` Returns `{data: [messages]}`

### Groups
- **POST** `/conversations/group` Create group, body: `{name, participantIds}`
- **POST** `/conversations/{id}/participants` Add members, body: `{participantIds}`
- **DELETE** `/conversations/{id}/participants/{userId}` Remove member
- **POST** `/conversations/{id}/admins` Promote to admin, body: `{userId}`
- **PATCH** `/conversations/{id}` Rename group, body: `{name}`

### Messages
- **POST** `/messages` Send message, body: `{conversationId, text}`

### System
- **GET** `/health` Health check

---

## Key API Models

### User
```json
{
  "_id": "string",
  "name": "string",
  "phone": "string",
  "createdAt": "ISO 8601"
}
```

### Message
```json
{
  "_id": "string",
  "conversationId": "string",
  "text": "string",
  "sender": "userId",
  "senderName": "string (if populated)",
  "createdAt": "ISO 8601"
}
```

### Conversation
```json
{
  "_id": "string",
  "type": "direct" | "group",
  "name": "string (group only)",
  "participants": [User],
  "admins": [userId],
  "createdBy": "userId",
  "lastMessage": Message,
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

---

## API Quirks/Notes
- Search endpoint returns array directly (not wrapped)
- Conversation lists use `data` wrapper: `{data: [...]}`
- Conversation can be direct (2 people) or group (3+)
- Message deletion/editing not supported
- Real-time: Socket.io WebSocket supported at root URL (not /api)

---

## Planned Directory Structure
```
compass-chat/
├── src/
│   ├── pages/          (Next.js pages)
│   ├── components/     (React components)
│   ├── hooks/          (Custom hooks)
│   ├── lib/            (Utilities)
│   │   ├── api.ts      (API client)
│   │   └── auth.ts     (Auth handling)
│   ├── styles/         (CSS/Tailwind)
│   └── types/          (TypeScript types)
├── public/             (Static assets)
├── docs/
│   ├── API.md          (API reference)
│   └── DEVELOPMENT.md  (Part 3 write-up)
├── README.md           (Setup & info)
└── CLAUDE.md           (This file)
```

---

## Tech Stack
- **Framework:** Next.js 14 + React 18
- **Styling:** Tailwind CSS
- **HTTP Client:** Fetch API
- **State Management:** React Context API
- **Real-time:** Socket.io WebSocket (polling fallback)
- **Deployment:** Vercel

---

## Part 1 Checklist
- [ ] API documentation written
- [ ] Login page (phone + name)
- [ ] User search
- [ ] Start direct conversation
- [ ] Create group conversation
- [ ] Message list with timestamps
- [ ] Send messages (empty check)
- [ ] Real-time message updates
- [ ] Loading/empty/error states
- [ ] Auto-scroll behavior
- [ ] Deploy to live URL

---

## Part 2 Checklist
- [ ] Design landing page
- [ ] Responsive layout
- [ ] Typography & color palette
- [ ] Showcase features
- [ ] Animations/interactions (optional)
- [ ] Deploy to live URL

---

## Part 3 Checklist
- [ ] Architecture/library choices explained
- [ ] Design reasoning
- [ ] AI tool usage documented
- [ ] Improvements noted

---

## Auth Flow
1. User enters phone + name
2. POST `/auth/login`
3. Store `token` in localStorage
4. Use token in `Authorization: Bearer {token}` for all requests
5. On refresh: GET `/auth/me` to restore session

---

## Message Flow (Socket.io Real-time)
1. User sends message via `socket.emit('message:send', {...})`
2. Server broadcasts via `socket.on('message:new', (message) => {...})`
3. Append new message to list instantly
4. Auto-scroll to latest message
5. If user scrolled up, don't force scroll (respect scroll position)

## Fallback: REST API Polling
1. User sends message POST `/messages`
2. Poll GET `/conversations/{id}/messages` every 1-2 seconds
3. Merge new messages (check for duplicates by timestamp)
4. Append to list and auto-scroll

---

## Quick Start Notes
- All API responses are JSON
- Errors may not have standard structure (document as found)
- No pagination params seen yet
- No rate limiting mentioned
- CORS enabled (Cloudflare headers visible)
