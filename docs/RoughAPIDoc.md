# API Quick Reference (early draft)

> This was the first-pass scratch reference written while first exploring the API, kept for the record of that process. **[docs/API.md](API.md) is the maintained, verified reference** — it documents things this draft doesn't (e.g. `GET /users/search` is actually case-sensitive and prefix-only) and covers more of what was found testing against the live server. Link to `API.md`, not this file.

**Base URL:** `https://frontend-task-chatapp.onrender.com/api`

All endpoints except `/auth/login` require: `Authorization: Bearer {token}`

---

## Authentication

### POST /auth/login
Login or auto-register. Auto-creates account if phone is new.

**Request:**
```json
{
  "phone": "+15551234567",
  "name": "Ada Lovelace"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6a882468e5d6aac97521e25e",
    "name": "Ada Lovelace",
    "phone": "+15551234567",
    "createdAt": "2026-08-21T10:11:52.529Z"
  }
}
```

### GET /auth/me
Get current user. Use for session restore on app load.

**Response (200):**
```json
{
  "_id": "6a882468e5d6aac97521e25e",
  "name": "Ada Lovelace",
  "phone": "+15551234567",
  "createdAt": "2026-08-21T10:11:52.529Z"
}
```

---

## Users

### GET /users/search?q=query
Search users by name or phone.

**Response (200):**
```json
[
  {
    "_id": "6a882468e5d6aac97521e25e",
    "name": "Ada Lovelace",
    "phone": "+15551234567"
  }
]
```
*Note: Returns bare array, not wrapped.*

---

## Conversations

### GET /conversations
List all conversations (direct + group).

**Response (200):**
```json
{
  "data": [
    {
      "_id": "6a88a16de5d6aac9752451b1",
      "type": "group",
      "name": "Project Team",
      "createdBy": "6a882468e5d6aac97521e25e",
      "admins": ["6a882468e5d6aac97521e25e"],
      "participants": [
        {"_id": "...", "name": "...", "phone": "..."}
      ],
      "lastMessage": {"text": "Hi", "sender": "...", "createdAt": "..."},
      "updatedAt": "2026-08-21T19:10:21.198Z"
    },
    {
      "_id": "6a882f71e5d6aac97521e90d",
      "type": "direct",
      "participant": {"_id": "...", "name": "...", "phone": "..."},
      "lastMessage": {"text": "👍", "sender": "...", "createdAt": "..."},
      "updatedAt": "2026-08-21T13:51:56.713Z"
    }
  ]
}
```
*Note: Direct conversations use `participant` (singular); groups use `participants` (array).*

### POST /conversations
Start a direct conversation.

**Request:**
```json
{
  "userId": "6a882f6de5d6aac97521e902"
}
```

**Response (200):** Full conversation object (direct shape).

### GET /conversations/{id}/messages
Get message history with pagination.

**Query params:**
- `limit` (optional, default 20)
- `before` (optional, cursor for pagination)

**Response (200):**
```json
{
  "messages": [
    {
      "_id": "6a88a31ee5d6aac975246135",
      "conversation": "6a88a16de5d6aac9752451b1",
      "sender": "6a883e75e5d6aac975220c48",
      "text": "Hello!",
      "createdAt": "2026-08-21T19:12:30.114Z"
    }
  ],
  "hasMore": false
}
```

---

## Groups

### POST /conversations/group
Create a group (minimum 3 members including creator).

**Request:**
```json
{
  "name": "Project Team",
  "participantIds": ["id1", "id2", "id3"]
}
```

**Response (201):** Full group conversation object.

### POST /conversations/{id}/participants
Add members to a group (admin only).

**Request:**
```json
{
  "userIds": ["user_id1", "user_id2"]
}
```

**Response (200):** Full updated group object.

### DELETE /conversations/{id}/participants/{userId}
Remove a member or leave a group.

**Response (200):** Full updated group object.

### POST /conversations/{id}/admins
Promote a member to admin (admin only).

**Request:**
```json
{
  "userId": "user_id"
}
```

**Response (200):** Full updated group object.

### PATCH /conversations/{id}
Rename a group (admin only).

**Request:**
```json
{
  "name": "New Name"
}
```

**Response (200):** Full updated group object.

---

## Messages

### POST /messages
Send a message.

**Request:**
```json
{
  "conversationId": "6a88a16de5d6aac9752451b1",
  "text": "Hello!"
}
```

**Response (200):** Message object (or `null` if conversation doesn't exist).

---

## WebSocket (Socket.io)

Connect to root origin: `https://frontend-task-chatapp.onrender.com`

```javascript
const socket = io('https://frontend-task-chatapp.onrender.com', { 
  auth: { token: 'your_jwt_token' } 
});
```

**Events:**
- `message:new` — New message received
- `conversation:updated` — Group name/members/admins changed

**Payload for message:new:**
```json
{
  "id": "6a88a31ee5d6aac975246135",
  "text": "Hello!",
  "sender": "6a883e75e5d6aac975220c48",
  "createdAt": 1724270970000
}
```
*Note: Uses `id` (not `_id`) and epoch milliseconds.*

---

## Error Handling

All errors use this shape:
```json
{
  "error": {
    "message": "Human readable message",
    "code": "ERROR_CODE",
    "details": []
  }
}
```

Common codes:
- `NO_TOKEN` (400) — Missing or invalid auth token
- `UNKNOWN_USER` (400) — User doesn't exist
- `VALIDATION_ERROR` (400) — Invalid request
- `FORBIDDEN` (403) — Not authorized for this action
- `NOT_FOUND` (404) — Resource doesn't exist

---

## Important Notes

- `/health` returns 404 (not implemented)
- `POST /messages` with empty text is **not** rejected server-side — validate client-side
- `POST /messages` with invalid conversation returns 200 with body `null`
- Group messages are merged by `_id`, not timestamp (timestamps not guaranteed unique)
- Auto-scroll only if user hasn't scrolled up
- CORS is open (`*`)
