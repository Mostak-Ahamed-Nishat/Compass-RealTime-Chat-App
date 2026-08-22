# Compass Chat API Reference

**Author:** Md Mostak Ahamed ([mostakahamed484@gmail.com](mailto:mostakahamed484@gmail.com))

This is my own write-up of the API given for the Compass Chat take-home assignment (Part 1 deliverable) — endpoints, request/response shapes, and the quirks I ran into testing it against the live server, so the actual chat app can be built against something accurate.

**Base URL:** `https://frontend-task-chatapp.onrender.com/api`

Every endpoint needs `Authorization: Bearer {token}` except `POST /auth/login` and `GET /health`. All bodies are JSON.

---

## Auth

### POST /auth/login
Logs in, or registers automatically if the phone number is new. There's no password — sending an existing phone number back always returns a valid token for that account, whatever name you send with it. Worth knowing, not something to build around.

```json
// request
{ "phone": "+15551234567", "name": "Ada Lovelace" }

// 200
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "_id": "6a882468e5d6aac97521e25e", "name": "Ada Lovelace", "phone": "+15551234567", "createdAt": "2026-08-21T10:11:52.529Z" }
}
```

### GET /auth/me
Returns the user for the current token. Use it to restore a session on refresh.

```json
// 200
{ "_id": "6a882468e5d6aac97521e25e", "name": "Ada Lovelace", "phone": "+15551234567", "createdAt": "2026-08-21T10:11:52.529Z" }
```

Missing token → `400 NO_TOKEN`, not 401. There's no 401 anywhere in this API — treat any 400 with that code as "not logged in."

---

## Users

### GET /users/search
Searches name and phone, case-insensitive, substring match.

- Query: `q` (required) — search term

Returns a bare array — not wrapped in `data` like the endpoints below.

```json
[
  { "_id": "6a882468e5d6aac97521e25e", "name": "Ada Lovelace", "phone": "+15551234567" }
]
```

---

## Conversations

### GET /conversations
Everything the current user is part of, direct and group mixed together.

```json
{
  "data": [
    {
      "_id": "6a88a16de5d6aac9752451b1",
      "type": "group",
      "name": "Project Team",
      "createdBy": "6a882468e5d6aac97521e25e",
      "admins": ["6a882468e5d6aac97521e25e"],
      "participants": [{ "_id": "...", "name": "Ada Lovelace", "phone": "+15551234567" }],
      "lastMessage": { "text": "Hello!", "sender": "6a882468e5d6aac97521e25e", "createdAt": "2026-08-21T19:10:20.905Z" },
      "updatedAt": "2026-08-21T19:10:21.198Z"
    },
    {
      "_id": "6a882f71e5d6aac97521e90d",
      "type": "direct",
      "participant": { "_id": "6a882f6de5d6aac97521e902", "name": "SearchProbe", "phone": "+15559876543" },
      "lastMessage": { "text": "👍", "sender": "6a882468e5d6aac97521e25e", "createdAt": "2026-08-21T13:51:56.478Z" },
      "updatedAt": "2026-08-21T13:51:56.713Z"
    }
  ]
}
```

- Group has `name`, `admins`, `createdBy`, and a `participants` array of everyone (current user included).
- Direct has none of that — just a single `participant` object, the other person, current user implied. Render these as two separate components, don't force one shape onto both.
- `lastMessage` is `{}` when empty, never `null`.

### POST /conversations
Starts (or reopens) a direct conversation.

```json
// request
{ "userId": "6a8827fde5d6aac97521e494" }

// 200
{ "_id": "6a88bb43e5d6aac975252869", "participants": ["6a8826e6e5d6aac97521e2d8", "6a882f6de5d6aac97521e902"], "createdAt": "..." }
```

- This is a raw document, not the enriched shape from `GET /conversations` — `participants` is just id strings, no `type` field. Re-fetch the conversation list to get something renderable.
- Calling this again with the same user returns the existing conversation instead of duplicating it.
- Unknown user → `400 UNKNOWN_USER`.

### GET /conversations/{id}/messages
Paginated message history.

- Path: `id` — conversation id
- Query: `limit` (optional) — page size; `before` (optional) — message id cursor, returns messages older than this one

```json
{
  "messages": [
    { "_id": "6a88a31ee5d6aac975246135", "conversation": "6a88a16de5d6aac9752451b1", "sender": "6a883e75e5d6aac975220c48", "text": "Love You Boss.", "createdAt": "2026-08-21T19:12:30.114Z" }
  ],
  "hasMore": false
}
```

- Field is `conversation`, not `conversationId`. No `senderName` either — resolve the sender's name from the conversation's participant list.
- Wraps in `messages` here, but `data` on the conversation list above — two different keys for the same list pattern.

---

## Groups

### POST /conversations/group
Creates a group. Creator becomes the first admin. Needs at least 2 entries in `participantIds` (3 people total including the creator) or you get a `400 VALIDATION_ERROR`.

```json
// request
{ "name": "Project Team", "participantIds": ["id1", "id2"] }

// 201
{
  "_id": "6a88a4a6e5d6aac975246e22",
  "type": "group",
  "name": "Project Team",
  "createdBy": "6a882468e5d6aac97521e25e",
  "admins": ["6a882468e5d6aac97521e25e"],
  "participants": [/* full user objects */],
  "createdAt": "...",
  "updatedAt": "..."
}
```

### POST /conversations/{id}/participants — add members (admin only)
- Path: `id` — group id
- Body: `{ "userIds": ["..."] }`

```json
// 200
{
  "_id": "6a88a4a6e5d6aac975246e22",
  "type": "group",
  "name": "Project Team",
  "createdBy": "6a882468e5d6aac97521e25e",
  "admins": ["6a882468e5d6aac97521e25e"],
  "participants": [
    { "_id": "6a882468e5d6aac97521e25e", "name": "Ada Lovelace", "phone": "+15551234567" },
    { "_id": "6a886ad5e5d6aac97522caa9", "name": "Ada Probe", "phone": "+15555142553" }
  ],
  "createdAt": "2026-08-21T19:19:02.016Z",
  "updatedAt": "2026-08-21T19:20:21.665Z"
}
```

### DELETE /conversations/{id}/participants/{userId} — remove a member, or leave
- Path: `id` — group id, `userId` — member to remove (pass your own id to leave)
- No request body

```json
// 200
{
  "_id": "6a88a4a6e5d6aac975246e22",
  "type": "group",
  "name": "Project Team",
  "createdBy": "6a882468e5d6aac97521e25e",
  "admins": ["6a886ad5e5d6aac97522caa9"],
  "participants": [
    { "_id": "6a886ad5e5d6aac97522caa9", "name": "Ada Probe", "phone": "+15555142553" }
  ],
  "updatedAt": "2026-08-21T19:22:28.635Z"
}
```

Removed user disappears from both `participants` and `admins`. There's no `{success: true}` shape — this is always the full updated conversation.

### POST /conversations/{id}/admins — promote to admin (admin only)
- Path: `id` — group id
- Body: `{ "userId": "..." }`

```json
// 200
{
  "_id": "6a88a5e1e5d6aac975247786",
  "type": "group",
  "admins": ["6a882468e5d6aac97521e25e", "6a886cc3e5d6aac97522d1cb"],
  "participants": [/* unchanged */],
  "updatedAt": "2026-08-21T19:25:10.629Z"
}
```

Errors: `403 FORBIDDEN` if the caller isn't an admin, `400 NOT_A_MEMBER` if the target isn't in the group.

### PATCH /conversations/{id} — rename (admin only)
- Path: `id` — group id
- Body: `{ "name": "..." }`

```json
// 200
{
  "_id": "6a88a5e1e5d6aac975247786",
  "type": "group",
  "name": "Ada Probe",
  "updatedAt": "2026-08-21T19:25:57.918Z"
}
```

Direct conversations reject this with `400 NOT_A_GROUP`.

---

## Messages

### POST /messages
```json
// request
{ "conversationId": "6a88a16de5d6aac9752451b1", "text": "Hello everyone!" }

// 200
{ "_id": "6a88bb53e5d6aac9752528a4", "conversation": "6a88bb43e5d6aac975252869", "sender": "6a8826e6e5d6aac97521e2d8", "text": "Hello everyone!", "createdAt": "..." }
```

- The server doesn't reject empty or whitespace-only text — only a missing `text` field gets `400 VALIDATION_ERROR`. Blocking empty sends is entirely our job on the client.
- A `conversationId` that doesn't exist returns `200` with a body of `null`, not an error — guard for that explicitly.
- No editing or deleting messages.

---

## Real-time

Socket.io runs at the root origin (not under `/api`). Connect with the token, no join/subscribe step needed — you're automatically listening to every conversation you're in:

```javascript
const socket = io("https://frontend-task-chatapp.onrender.com", { auth: { token } });
```

Sending is still done through `POST /messages`; that call is what triggers the broadcast. Two events come back:

- `message:new` — `{ id, conversation, sender, text, createdAt }`. Note it's `id`, not `_id`, and `createdAt` is an epoch number here, not an ISO string like everywhere else in this API.
- `conversation:updated` — fires on rename/membership/admin changes, full conversation object, same shape as the REST responses.

If the socket connection fails, fall back to polling `GET /conversations/{id}/messages` every 1–2 seconds and merging by `_id`.

---

## Errors

Consistent shape everywhere:

```json
{ "error": { "message": "Human-readable text", "code": "SOME_CODE" } }
```

Validation failures add a `details` array: `[{ "path": "text", "message": "Required" }]`.

Codes seen:
- `NO_TOKEN` — no bearer token
- `UNKNOWN_USER` — referenced user id doesn't exist
- `VALIDATION_ERROR` — request body failed validation
- `NOT_A_GROUP` — group-only action called on a direct conversation
- `NOT_A_MEMBER` — target user isn't in the group
- `FORBIDDEN` — caller isn't an admin
- `NOT_FOUND` — route doesn't exist

Branch on `code`, not HTTP status — success codes aren't even consistent (group creation is 201, everything else that creates something is 200).

---

## A couple of things to just know going in

- `GET /health` is listed in the Swagger docs but not actually implemented — always 404.
- No pagination anywhere except message history.
- No rate limiting observed.
- Token doesn't expire in any way we could trigger, and there's no refresh endpoint — if a call ever comes back `NO_TOKEN`, treat it as logged out.
- The API only runs over HTTPS and CORS is wide open (`*`), so it's callable straight from the browser. Token gets kept in localStorage for this project, which is fine for a demo but is technically readable by any script on the page — combined with the no-password login above, this is not an API I'd trust with anything real.
