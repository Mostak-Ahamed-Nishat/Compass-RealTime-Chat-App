# Compass Chat API Reference

**Base URL:** `https://frontend-task-chatapp.onrender.com/api`

**Version:** Unversioned (single version currently live). No `/v1` prefix is used; if breaking changes are introduced later, a version segment should be added to the base URL.

**Content type:** All request and response bodies are `application/json`.

**Transport:** HTTPS only.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Conversations](#conversations)
4. [Group Management](#group-management)
5. [Messages](#messages)
6. [System](#system)
7. [Data Models](#data-models)
8. [Pagination](#pagination)
9. [Real-time Updates (WebSocket + Polling)](#real-time-updates)
10. [Error Handling](#error-handling)
11. [Security Notes](#security-notes)
12. [Rate Limiting](#rate-limiting)
13. [Client Examples](#client-examples)

---

## Authentication

All endpoints require the following header, except `POST /auth/login` and `GET /health`:

```
Authorization: Bearer {token}
```

The token is returned by `POST /auth/login` and does not expire within the scope of a normal session (no refresh endpoint is exposed).

### POST /auth/login

Log in, or register automatically if the phone number has not been seen before. There is no separate registration step.

**Auth required:** No

**Request body:**
```json
{
  "phone": "+15551234567",
  "name": "Ada Lovelace"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| phone | string | yes | Any string is accepted as an identifier; used to look up or create the user |
| name | string | yes | Display name. On login (existing phone), the name sent is not currently used to update the stored name |

**Response — 200:**
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

**Notes:**
- A new phone number registers a new user and returns 200, not 201 — there is no distinct status code for "registered" vs. "logged in."
- Store the token client-side (see [Security Notes](#security-notes)).

---

### GET /auth/me

Returns the user tied to the bearer token. Used to restore a session after a page refresh.

**Auth required:** Yes

**Response — 200:**
```json
{
  "_id": "6a882468e5d6aac97521e25e",
  "name": "Ada Lovelace",
  "phone": "+15551234567",
  "createdAt": "2026-08-21T10:11:52.529Z"
}
```

**Response — 400 (no token provided):**
```json
{
  "error": {
    "message": "No token provided",
    "code": "NO_TOKEN"
  }
}
```

**Notes:**
- A missing token returns **400**, not 401, with code `NO_TOKEN`. Treat this the same as an unauthenticated state in the client.

---

## Users

### GET /users/search

Search users by name or phone number.

**Auth required:** Yes

**Query parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| q | string | yes | Search term matched against name and phone |

**Example:** `GET /users/search?q=Ada`

**Response — 200:**
```json
[
  {
    "_id": "6a882468e5d6aac97521e25e",
    "name": "Ada Lovelace",
    "phone": "+15551234567"
  },
  {
    "_id": "6a8827fde5d6aac97521e494",
    "name": "Ada Lovelace",
    "phone": "+15551111111"
  }
]
```

**Notes:**
- Returned as a bare array, unlike the list endpoints below which wrap results in a `data` object. Handle this inconsistency explicitly in the API client.
- Matching appears to be a loose substring match, not an exact match — searching `q=Ada` returns names and phone numbers that merely contain "ada"-like substrings, including partial phone matches. Do not assume the result set is validated or deduplicated; test data includes near-duplicate names and malformed phone numbers.
- No minimum query length was enforced during testing.

---

## Conversations

### GET /conversations

List all conversations the current user belongs to (direct and group).

**Auth required:** Yes

**Response — 200:**
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
        { "_id": "6a882468e5d6aac97521e25e", "name": "Ada Lovelace", "phone": "+15551234567" },
        { "_id": "6a883e75e5d6aac975220c48", "name": "Md. Johirul Islam Rasel", "phone": "01824842336" }
      ],
      "lastMessage": {
        "text": "❤️",
        "sender": "6a883e75e5d6aac975220c48",
        "createdAt": "2026-08-21T19:10:20.905Z"
      },
      "updatedAt": "2026-08-21T19:10:21.198Z"
    },
    {
      "_id": "6a882f71e5d6aac97521e90d",
      "type": "direct",
      "participant": {
        "_id": "6a882f6de5d6aac97521e902",
        "name": "SearchProbe",
        "phone": "+15559876543"
      },
      "lastMessage": {
        "text": "👍",
        "sender": "6a882468e5d6aac97521e25e",
        "createdAt": "2026-08-21T13:51:56.478Z"
      },
      "updatedAt": "2026-08-21T13:51:56.713Z"
    }
  ]
}
```

**Notes — important shape difference between direct and group conversations:**
- A **group** conversation includes `name`, `createdBy`, `admins`, and a `participants` array containing every member, including the current user.
- A **direct** conversation has no `name`, `createdBy`, or `admins`, and instead of a `participants` array it returns a single `participant` object — the *other* user in the chat, not the current user. The client is responsible for treating `participant` and `participants` as two different shapes based on `type`.
- `lastMessage` is an empty object `{}` on a conversation with no messages yet, not `null` and not an omitted field.
- List items do not include a top-level `createdAt`; only `updatedAt` is present. `createdAt` does appear on the object returned by the group-creation and group-mutation endpoints below.
- No pagination parameters are exposed on this endpoint. If the list grows large, all conversations are still returned in one response.

---

### POST /conversations

Start (or re-open) a direct conversation with another user.

**Auth required:** Yes

**Request body:**
```json
{
  "userId": "6a8827fde5d6aac97521e494"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| userId | string | yes | The other user's `_id` |

**Response — 400 (unknown user):**
```json
{
  "error": {
    "message": "One or more users do not exist",
    "code": "UNKNOWN_USER"
  }
}
```

**Notes:**
- A successful response was not captured directly against the live endpoint during documentation; based on the shape returned by `GET /conversations`, expect a `type: "direct"` object with a `participant` field for the other user. Verify this against the live API during implementation and adjust the client's parsing if the actual shape differs.
- Calling this again with the same `userId` is expected to return the existing conversation rather than create a duplicate, per the endpoint summary ("Start (or open)"), but this was not independently verified.

---

### GET /conversations/{id}/messages

Message history for a conversation, newest-page-first with cursor-based pagination for loading older messages.

**Auth required:** Yes

**Path parameters:**

| Name | Type | Description |
|---|---|---|
| id | string | The conversation id |

**Query parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| limit | integer | no | Maximum number of messages to return |
| before | string | no | Message id cursor — returns messages before this message |

**Example:** `GET /conversations/6a88a16de5d6aac9752451b1/messages?limit=20`

**Response — 200:**
```json
{
  "messages": [
    {
      "_id": "6a88a31ee5d6aac975246135",
      "conversation": "6a88a16de5d6aac9752451b1",
      "sender": "6a883e75e5d6aac975220c48",
      "text": "Love You Boss.",
      "createdAt": "2026-08-21T19:12:30.114Z"
    },
    {
      "_id": "6a88a29ce5d6aac975245bc5",
      "conversation": "6a88a16de5d6aac9752451b1",
      "sender": "6a883e75e5d6aac975220c48",
      "text": "❤️",
      "createdAt": "2026-08-21T19:10:20.905Z"
    }
  ],
  "hasMore": false
}
```

**Notes:**
- The response key is `messages`, not `data` — inconsistent with `GET /conversations`, which uses `data`.
- Each message carries the conversation id under the field `conversation`, and the sender id under `sender`. Neither `conversationId` nor a populated `senderName` is present — the sender's display name is not included and must be resolved client-side from the conversation's `participants`.
- Messages are returned newest-first in this sample; confirm ordering before relying on it, and reverse client-side if the message list needs to render oldest-first.
- `hasMore` indicates whether an older page exists; pass the oldest message's `_id` as `before` to fetch the next page.

---

## Group Management

### POST /conversations/group

Create a group conversation. The creator becomes the first admin automatically.

**Auth required:** Yes

**Request body:**
```json
{
  "name": "Project Team",
  "participantIds": [
    "6a886ad5e5d6aac97522caa9",
    "6a886cc3e5d6aac97522d1cb",
    "6a886e05e5d6aac97522d6bd"
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | yes | Group name |
| participantIds | array of string | yes | Other members' ids, not including the creator. At least 2 entries are required (3 total members with the creator) |

**Response — 201:**
```json
{
  "_id": "6a88a4a6e5d6aac975246e22",
  "type": "group",
  "name": "Project Team",
  "createdBy": "6a882468e5d6aac97521e25e",
  "admins": ["6a882468e5d6aac97521e25e"],
  "participants": [
    { "_id": "6a882468e5d6aac97521e25e", "name": "Ada Lovelace", "phone": "+15551234567" },
    { "_id": "6a886ad5e5d6aac97522caa9", "name": "Ada Probe", "phone": "+15555142553" },
    { "_id": "6a886cc3e5d6aac97522d1cb", "name": "Ada5636867", "phone": "+15555636867" },
    { "_id": "6a886e05e5d6aac97522d6bd", "name": "Ada Lovelace", "phone": "+15551234345" }
  ],
  "createdAt": "2026-08-21T19:19:02.016Z",
  "updatedAt": "2026-08-21T19:19:02.016Z"
}
```

**Response — 400 (too few members):**
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      { "path": "participantIds", "message": "a group needs at least 3 members" }
    ]
  }
}
```

**Notes:**
- The full conversation object is returned directly — not wrapped in `data`.
- "3 members" means the creator plus at least 2 entries in `participantIds`.

---

### POST /conversations/{id}/participants

Add one or more members to a group. Admins only.

**Auth required:** Yes (must be a group admin)

**Path parameters:**

| Name | Type | Description |
|---|---|---|
| id | string | The group id |

**Request body:**
```json
{
  "userIds": ["6a882468e5d6aac97521e25e"]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| userIds | array of string | yes | Ids of users to add |

**Response — 200:**

Returns the full, updated conversation object — the same shape as `POST /conversations/group` — with the new members appended to `participants` and `updatedAt` refreshed.

**Notes:**
- The request field is `userIds`, plural — different from the `participantIds` field used when creating the group.
- The response is the whole conversation object, not a partial `{conversationId, participants}` summary.
- Only current admins may call this; a non-admin should expect a 403 in the same shape shown under [Error Handling](#error-handling).

---

### DELETE /conversations/{id}/participants/{userId}

Remove a member from a group, or leave the group by passing your own id.

**Auth required:** Yes (admin to remove someone else; any member to remove themselves)

**Path parameters:**

| Name | Type | Description |
|---|---|---|
| id | string | The group id |
| userId | string | The member to remove; pass your own id to leave |

**Response — 200:**

Returns the full, updated conversation object with the member removed from `participants` (and from `admins`, if they held that role) and `updatedAt` refreshed.

**Notes:**
- There is no `{success: true}` acknowledgement shape — the response is always the updated conversation.
- Removing the sole remaining admin does not appear to promote a replacement automatically; plan for a group that temporarily has zero admins.

---

### POST /conversations/{id}/admins

Promote an existing group member to admin. Admins only.

**Auth required:** Yes (must be a group admin)

**Path parameters:**

| Name | Type | Description |
|---|---|---|
| id | string | The group id |

**Request body:**
```json
{
  "userId": "6a886cc3e5d6aac97522d1cb"
}
```

**Response — 200:**

Returns the full, updated conversation object with the promoted user's id added to `admins`.

**Response — 403 (not an admin):**
```json
{
  "error": {
    "message": "Only admins can promote members",
    "code": "FORBIDDEN"
  }
}
```

**Notes:**
- `userId` must already be a member of the group's `participants`; promoting a non-member was not tested but is expected to fail validation.

---

### PATCH /conversations/{id}

Rename a group. Admins only.

**Auth required:** Yes (must be a group admin)

**Path parameters:**

| Name | Type | Description |
|---|---|---|
| id | string | The group id |

**Request body:**
```json
{
  "name": "Updated Team Name"
}
```

**Response — 200:**

Returns the full, updated conversation object with the new `name` and `updatedAt` refreshed.

**Notes:**
- Direct conversations have no `name` field and this endpoint is not meaningful for them; renaming a direct conversation was not tested and should be assumed unsupported.

---

## Messages

### POST /messages

Send a message into a conversation.

**Auth required:** Yes

**Request body:**
```json
{
  "conversationId": "6a88a16de5d6aac9752451b1",
  "text": "Hello everyone!"
}
```

**Response — 201 (expected, not directly captured against the live API):**
```json
{
  "_id": "6a88a16de5d6aac9752451b4",
  "conversation": "6a88a16de5d6aac9752451b1",
  "sender": "6a882468e5d6aac97521e25e",
  "text": "Hello everyone!",
  "createdAt": "2026-08-21T19:15:20.905Z"
}
```

**Response — 400 (empty message, expected):**
```json
{
  "error": {
    "message": "Message cannot be empty",
    "code": "VALIDATION_ERROR"
  }
}
```

**Notes:**
- This endpoint's response was not exercised directly while inspecting the API, so the shape above is inferred to match the field names actually observed on `GET /conversations/{id}/messages` (`conversation`, not `conversationId`; no `senderName`). Confirm against the live API before relying on it, and adjust the client if the real response differs.
- The sender's display name is not expected to be included; resolve it client-side from the conversation's participant list, the same as with message history.
- Trim whitespace client-side before sending so a whitespace-only message is treated as empty.
- Editing and deleting messages are not supported by this API.

---

## System

### GET /health

Health check. No authentication required.

**Current response — 404:**
```json
{
  "error": {
    "message": "Route not found",
    "code": "NOT_FOUND"
  }
}
```

**Notes:**
- This endpoint is documented in the Swagger listing but is not actually implemented — every call returns 404. Do not depend on it for uptime checks; there is no working health check on this API at present.

---

## Data Models

### User
```
_id        string     MongoDB ObjectId
name       string
phone      string
createdAt  string     ISO 8601 timestamp (present on /auth/login and /auth/me only —
                       user objects embedded in conversations and search results omit it)
```

### Conversation — group
```
_id          string
type         "group"
name         string
createdBy    string    user id of the creator
admins       string[]  user ids
participants User[]    all members, including the current user
lastMessage  object    { text, sender, createdAt } — {} if no messages yet
                        (present in list responses, absent from mutation responses)
createdAt    string    ISO 8601 (mutation responses only; absent from list responses)
updatedAt    string    ISO 8601
```

### Conversation — direct
```
_id          string
type         "direct"
participant  User      the other member only — the current user is implicit
lastMessage  object    { text, sender, createdAt } — {} if no messages yet
updatedAt    string    ISO 8601
```

### Message
```
_id           string
conversation  string    conversation id
sender        string    user id
text          string
createdAt     string    ISO 8601
```

The sender's name is never populated on a message object. Build a lookup from the conversation's `participants` (or `participant`, for direct chats) and join it client-side.

---

## Pagination

Only `GET /conversations/{id}/messages` paginates:

- `limit` — page size
- `before` — pass a message `_id` to fetch messages older than that message
- `hasMore` — `true` if another page is available

No other endpoint accepts pagination parameters; `GET /conversations` and `GET /users/search` always return their full result set in one response.

---

## Real-time Updates

### WebSocket (Socket.io) — Recommended Approach

The API provides a Socket.io WebSocket endpoint for instant, real-time messaging without polling.

**Connection:**
```javascript
const socket = io('https://frontend-task-chatapp.onrender.com', { 
  auth: { token } 
});
```

**Important:**
- Connect to **root origin** (NOT `/api` base)
- Socket.io serves at `/socket.io/`
- Pass the JWT token from `/auth/login` in the handshake `auth` object
- Invalid or missing token is rejected by the server

**Connection Lifecycle:**
```javascript
socket.on('connect', () => {
  console.log('Connected to real-time server');
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  // Socket.io auto-reconnects on connection loss
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

### Client → Server Events

**message:send** — Send a message
```javascript
socket.emit('message:send', 
  { 
    conversationId: "6a88a16de5d6aac9752451b1",
    text: "Hello everyone!"
  },
  (ack) => {
    // Optional acknowledgment callback
    console.log('Message delivered');
  }
);
```

### Server → Client Events

**message:new** — New message arrived (instant notification)
```javascript
socket.on('message:new', (message) => {
  // message shape:
  // {
  //   _id: string,
  //   conversation: string,
  //   sender: string,
  //   text: string,
  //   createdAt: ISO 8601 timestamp
  // }
  // Note: senderName is not populated; resolve from conversation participants.
  console.log('New message:', message);
});
```

**conversation:updated** — Group conversation changed
```javascript
socket.on('conversation:updated', (conversation) => {
  // Emitted when a group's name, members, or admins change.
  // Conversation object shape matches POST /conversations/group response.
  console.log('Conversation updated:', conversation);
});
```

**Notes on Socket.io:**
- Socket.io auto-reconnects if connection is lost.
- Token must be a valid JWT from `/auth/login`.
- Both direct messages and group messages emit `message:new`.
- Group management actions (rename, add/remove members, promote admins) trigger `conversation:updated` for all members.
- Acknowledgment callbacks are optional; use them to confirm delivery if needed.

---

### Polling Fallback — If WebSocket is Unavailable

If Socket.io cannot be used, poll the REST API:

- Poll `GET /conversations/{id}/messages` on a short interval (1–2 seconds) to fetch new messages.
- Poll `GET /conversations` on a longer interval (5–10 seconds) to catch new conversations and updated previews.
- Use `hasMore`/`before` to paginate through older messages, and rely on `createdAt` to identify genuinely new messages when merging poll results (so a poll never duplicates a message already rendered).

---

## Error Handling

Errors observed against the live API consistently use a nested shape:

```json
{
  "error": {
    "message": "Human-readable description",
    "code": "MACHINE_READABLE_CODE"
  }
}
```

Validation errors add a `details` array:

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      { "path": "participantIds", "message": "a group needs at least 3 members" }
    ]
  }
}
```

**Status codes and codes seen during testing:**

| Status | Code | When |
|---|---|---|
| 400 | NO_TOKEN | No bearer token on a route that requires one |
| 400 | UNKNOWN_USER | `userId`/`participantIds` reference a user that doesn't exist |
| 400 | VALIDATION_ERROR | Request body fails validation (e.g. group with fewer than 3 total members) |
| 403 | FORBIDDEN | Caller lacks permission (e.g. non-admin trying to promote a member) |
| 404 | NOT_FOUND | Route does not exist (also what `/health` currently returns) |
| 500 | — | Not observed during testing. No documented shape for a server-side failure; the client should treat any non-JSON or unrecognized error body as a generic failure and show a fallback error state rather than trying to parse it. |

Treat `code` as the stable value to branch on in the client; `message` is for display and may be rephrased over time. No 401 was observed anywhere — missing/invalid auth surfaces as 400 with `NO_TOKEN`, so an API client should not assume 401 means "unauthenticated" on this API.

---

## Security Notes

- Token is a bearer JWT; send it only over HTTPS, which the API enforces.
- Store the token in `localStorage` for this project's scope; be aware that this exposes it to any script running on the page (XSS risk), which is an accepted trade-off for a take-home assignment rather than a production system.
- No token refresh endpoint is exposed — plan for what happens when the token expires (redirect to login on a 400/NO_TOKEN-shaped failure from any authenticated call).
- CORS is open (`access-control-allow-origin: *`), so this API is callable directly from a browser without a proxy.

---

## Rate Limiting

No rate limiting was observed or documented for this API — no `X-RateLimit-*` headers appeared on any response, and no `429` was returned under repeated calls during testing. Do not build client-side backoff/retry logic for rate limits; if it turns out to matter later, add it then.

---

## Client Examples

**Login:**
```bash
curl -X POST 'https://frontend-task-chatapp.onrender.com/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"phone": "+15551234567", "name": "Ada Lovelace"}'
```

**Authenticated GET:**
```bash
curl 'https://frontend-task-chatapp.onrender.com/api/conversations' \
  -H 'Authorization: Bearer {token}'
```

**Authenticated POST with body:**
```bash
curl -X POST 'https://frontend-task-chatapp.onrender.com/api/conversations/group' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{"name": "Project Team", "participantIds": ["<id1>", "<id2>"]}'
```

**Authenticated DELETE:**
```bash
curl -X DELETE 'https://frontend-task-chatapp.onrender.com/api/conversations/{id}/participants/{userId}' \
  -H 'Authorization: Bearer {token}'
```

**Field naming convention:** the API uses camelCase for all JSON fields (`createdAt`, `participantIds`, `userIds`). The exceptions are the inconsistencies called out throughout this document — `data` vs. `messages` as the list wrapper key, and `conversation`/`sender` vs. `conversationId`/`senderName` — which are quirks of this specific API, not a different convention.
