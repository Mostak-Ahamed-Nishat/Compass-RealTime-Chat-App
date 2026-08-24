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


------------------------
POST
/auth/login
Log in or register

{
  "phone": "+15551234567",
  "name": "Ada Lovelace"
}


Responses
Curl

curl -X 'POST' \
  'https://frontend-task-chatapp.onrender.com/api/auth/login' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "phone": "+15551234567",
  "name": "Ada Lovelace"
}'
Request URL
https://frontend-task-chatapp.onrender.com/api/auth/login
Server response
Code	Details
200	
Response body
Download
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTg4MjQ2OGU1ZDZhYWM5NzUyMWUyNWUiLCJpYXQiOjE3ODczMzkzMjIsImV4cCI6MTc4Nzk0NDEyMn0.g0k7TWVC4jXTDy7FSNtPez6WXbtcRzukhsarlScpqqI",
  "user": {
    "_id": "6a882468e5d6aac97521e25e",
    "name": "Ada Lovelace",
    "phone": "+15551234567",
    "createdAt": "2026-08-21T10:11:52.529Z"
  }
}
Response headers
 access-control-allow-origin: * 
 alt-svc: h3=":443"; ma=86400 
 cf-cache-status: DYNAMIC 
 cf-ray: a2ebed8b4eb036c6-DAC 
 content-encoding: br 
 content-length: 259 
 content-type: application/json; charset=utf-8 
 date: Fri,21 Aug 2026 19:08:42 GMT 
 etag: W/"136-bEe1hrKBZCTYpD0pxSX2ZXDNBd0" 
 rndr-id: a0aaf8eb-0b9a-4084 
 server: cloudflare 
 vary: Accept-Encoding 
 x-powered-by: Express 
 x-render-origin-server: Render 
Responses
Code	Description	Links
default	
Response bodies and status codes are intentionally not specified in this document. Inspect the live API and document the responses yourself.


GET
/auth/me
Current user



Returns the user associated with the bearer token. Useful for restoring a session.

Parameters
Cancel
No parameters

Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://frontend-task-chatapp.onrender.com/api/auth/me' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTg4MjQ2OGU1ZDZhYWM5NzUyMWUyNWUiLCJpYXQiOjE3ODczMzkyMzMsImV4cCI6MTc4Nzk0NDAzM30.rWGwU5YQ6nOR6RJhaN8WElCVIm136XgZypTZv_CMbro'
Request URL
https://frontend-task-chatapp.onrender.com/api/auth/me
Server response
Code	Details
200	
Response body
Download
{
  "_id": "6a882468e5d6aac97521e25e",
  "name": "Ada Lovelace",
  "phone": "+15551234567",
  "createdAt": "2026-08-21T10:11:52.529Z"
}
Response headers
 access-control-allow-origin: * 
 alt-svc: h3=":443"; ma=86400 
 cf-cache-status: DYNAMIC 
 cf-ray: a2ebee6ad86736c6-DAC 
 content-encoding: br 
 content-length: 101 
 content-type: application/json; charset=utf-8 
 date: Fri,21 Aug 2026 19:09:18 GMT 
 etag: W/"76-eslaZCTI4dunBQ0hwuq7Gbrd5Jg" 
 priority: u=1,i 
 rndr-id: 4e075cca-1880-41b8 
 server: cloudflare 
 server-timing: cfExtPri 
 vary: Accept-Encoding 
 x-powered-by: Express 
 x-render-origin-server: Render 
Responses
Code	Description	Links
default	
Response bodies and status codes are intentionally not specified in this document. Inspect the live API and document the responses yourself.


Users
Find other users



GET
/users/search
Search users by name or phone



Parameters
Cancel
Name	Description
q *
string
(query)
Search term — a user's name or phone number.

Ada
Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://frontend-task-chatapp.onrender.com/api/users/search?q=Ada' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTg4MjQ2OGU1ZDZhYWM5NzUyMWUyNWUiLCJpYXQiOjE3ODczMzkyMzMsImV4cCI6MTc4Nzk0NDAzM30.rWGwU5YQ6nOR6RJhaN8WElCVIm136XgZypTZv_CMbro'
Request URL
https://frontend-task-chatapp.onrender.com/api/users/search?q=Ada
Server response
Code	Details
200	
Response body
Download
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
  },
  {
    "_id": "6a882806e5d6aac97521e4b3",
    "name": "Ada Probe",
    "phone": "+15550000001"
  },
  {
    "_id": "6a88295ce5d6aac97521e62d",
    "name": "Ada Lovelace",
    "phone": "+8801733586288"
  },
  {
    "_id": "6a882970e5d6aac97521e631",
    "name": "Ada Lovelace",
    "phone": "+880173358628"
  },
  {
    "_id": "6a8833d9e5d6aac97521f00d",
    "name": "Ada Dev",
    "phone": "+12025550101"
  },
  {
    "_id": "6a883617e5d6aac97521f5ed",
    "name": "Ada Renamed",
    "phone": "+1555157543"
  },
  {
    "_id": "6a8836ece5d6aac97521f81d",
    "name": "Adam",
    "phone": "123456"
  },
  {
    "_id": "6a883776e5d6aac97521f97b",
    "name": "Ada Updated",
    "phone": "+15551234100"
  },
  {
    "_id": "6a883786e5d6aac97521f9db",
    "name": "Ada Lovelace",
    "phone": "+1555123asdasdasd4567"
  },
  {
    "_id": "6a8837d5e5d6aac97521faa4",
    "name": "Ada Lovelace",
    "phone": "015551234567"
  },
  {
    "_id": "6a8837e9e5d6aac97521fab4",
    "name": "Ada Lovelace",
    "phone": "+880015551234567"
  },
  {
    "_id": "6a883e8be5d6aac975220c8f",
    "name": "Ada Renamed",
    "phone": "+880138014961"
  },
  {
    "_id": "6a884047e5d6aac975220fc5",
    "name": "Ada Lovelace",
    "phone": "+15551233567"
  },
  {
    "_id": "6a884371e5d6aac975221743",
    "name": "Ada Lovelace",
    "phone": "+08801623325407"
  },
  {
    "_id": "6a8843f8e5d6aac975221968",
    "name": "Ada Lovelac",
    "phone": "234567"
  },
  {
    "_id": "6a884d2be5d6aac9752234a7",
    "name": "Adam",
    "phone": "#2222222222"
  },
  {
    "_id": "6a884dd4e5d6aac9752235a0",
    "name": "Ada Movelace",
    "phone": "01719279514"
  },
  {
    "_id": "6a884f48e5d6aac975223bbb",
    "name": "Ada Lovelace",
    "phone": "+16660868641"
  },
  {
    "_id": "6a884f86e5d6aac975223c55",
    "name": "Ada Lovelace",
    "phone": "+16661481171"
  },
  {
    "_id": "6a884fe1e5d6aac975223e31",
    "name": "Ada Lovelace",
    "phone": "+16662402431"
  },
  {
    "_id": "6a885030e5d6aac975223f58",
    "name": "Ada Lovelace",
    "phone": "+16663115221"
  },
  {
    "_id": "6a88509fe5d6aac975224072",
    "name": "Ada Lovelace",
    "phone": "+16664279501"
  },
  {
    "_id": "6a8850dfe5d6aac97522414c",
    "name": "Ada Lovelace",
    "phone": "+16664941341"
  },
  {
    "_id": "6a885123e5d6aac975224220",
    "name": "Ada RENAMED",
    "phone": "+155585887711"
  },
  {
    "_id": "6a885184e5d6aac97522429b",
    "name": "Ada Lovelace",
    "phone": "+16666586831"
  },
  {
    "_id": "6a885389e5d6aac9752246c9",
    "name": "Ada",
    "phone": "+1-demo-taghyeer-left-9182"
  },
  {
    "_id": "6a8856a4e5d6aac975224e13",
    "name": "Ada Renamed",
    "phone": "+155599712571"
  },
  {
    "_id": "6a8856c0e5d6aac975224eac",
    "name": "Ada Renamed",
    "phone": "+155599995251"
  },
  {
    "_id": "6a88577be5d6aac97522532a",
    "name": "Ada 0185942",
    "phone": "+101859421"
  },
  {
    "_id": "6a8858d4e5d6aac975225b6d",
    "name": "Ada 0525354",
    "phone": "+105253541"
  },
  {
    "_id": "6a8859a3e5d6aac975226045",
    "name": "Ada 0738227",
    "phone": "+107382271"
  },
  {
    "_id": "6a8859c1e5d6aac97522619f",
    "name": "Ada Lovelace",
    "phone": "15551234567"
  },
  {
    "_id": "6a885a70e5d6aac975226620",
    "name": "Ada Renamed",
    "phone": "+15559876001"
  },
  {
    "_id": "6a885b98e5d6aac975226d2e",
    "name": "Ada 1238222",
    "phone": "+112382221"
  },
  {
    "_id": "6a885d28e5d6aac97522751a",
    "name": "Ada 1639268",
    "phone": "+116392681"
  },
  {
    "_id": "6a885dd2e5d6aac9752278ed",
    "name": "Ada 1808557",
    "phone": "+118085571"
  },
  {
    "_id": "6a885e65e5d6aac975227cd4",
    "name": "Ada 1955461",
    "phone": "+119554611"
  },
  {
    "_id": "6a885fc5e5d6aac9752286be",
    "name": "Ada 2307087",
    "phone": "+123070871"
  },
  {
    "_id": "6a886a2ce5d6aac97522c623",
    "name": "Ada Probe",
    "phone": "+15554973476"
  },
  {
    "_id": "6a886ad5e5d6aac97522caa9",
    "name": "Ada Probe",
    "phone": "+15555142553"
  },
  {
    "_id": "6a886b6de5d6aac97522cd23",
    "name": "Ada Probe",
    "phone": "+15555294979"
  },
  {
    "_id": "6a886c22e5d6aac97522cf8c",
    "name": "Ada Probe",
    "phone": "+15555475951"
  },
  {
    "_id": "6a886c40e5d6aac97522cfff",
    "name": "Ada Lovelace",
    "phone": "+15551230099"
  },
  {
    "_id": "6a886c64e5d6aac97522d096",
    "name": "Ada Probe",
    "phone": "+15555542333"
  },
  {
    "_id": "6a886ca4e5d6aac97522d175",
    "name": "Ada5606236",
    "phone": "+15555606236"
  },
  {
    "_id": "6a886cc3e5d6aac97522d1cb",
    "name": "Ada5636867",
    "phone": "+15555636867"
  },
  {
    "_id": "6a886d48e5d6aac97522d3c6",
    "name": "Ada769776233",
    "phone": "+1769776233"
  },
  {
    "_id": "6a886df9e5d6aac97522d665",
    "name": "Ada Lovelace",
    "phone": "+15551234565"
  },
  {
    "_id": "6a886e05e5d6aac97522d6bd",
    "name": "Ada Lovelace",
    "phone": "+15551234345"
  }
]
Response headers
 access-control-allow-origin: * 
 alt-svc: h3=":443"; ma=86400 
 cf-cache-status: DYNAMIC 
 cf-ray: a2ebef36190636c6-DAC 
 content-encoding: br 
 content-length: 791 
 content-type: application/json; charset=utf-8 
 date: Fri,21 Aug 2026 19:09:51 GMT 
 etag: W/"f61-wHKS/cjMUP/f1E27zzp0U82ajWI" 
 rndr-id: e293143d-6226-4252 
 server: cloudflare 
 vary: Accept-Encoding 
 x-powered-by: Express 
 x-render-origin-server: Render 
Responses
Code	Description	Links
default	
Response bodies and status codes are intentionally not specified in this document. Inspect the live API and document the responses yourself.



Conversations
Direct conversations and message history



GET
/conversations
List my conversations



The conversations the current user is part of (direct and group).

Parameters
Try it out
No parameters

Responses
Curl

curl -X 'GET' \
  'https://frontend-task-chatapp.onrender.com/api/conversations' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTg4MjQ2OGU1ZDZhYWM5NzUyMWUyNWUiLCJpYXQiOjE3ODczMzkyMzMsImV4cCI6MTc4Nzk0NDAzM30.rWGwU5YQ6nOR6RJhaN8WElCVIm136XgZypTZv_CMbro'
Request URL
https://frontend-task-chatapp.onrender.com/api/conversations
Server response
Code	Details
200	
Response body
Download
{
  "data": [
    {
      "_id": "6a88a16de5d6aac9752451b1",
      "type": "group",
      "lastMessage": {
        "text": "❤️",
        "sender": "6a883e75e5d6aac975220c48",
        "createdAt": "2026-08-21T19:10:20.905Z"
      },
      "updatedAt": "2026-08-21T19:10:21.198Z",
      "name": "Project Team",
      "createdBy": "6a882468e5d6aac97521e25e",
      "admins": [
        "6a882468e5d6aac97521e25e"
      ],
      "participants": [
        {
          "_id": "6a882468e5d6aac97521e25e",
          "name": "Ada Lovelace",
          "phone": "+15551234567"
        },
        {
          "_id": "6a883e75e5d6aac975220c48",
          "name": "Md. Johirul Islam Rasel",
          "phone": "01824842336"
        },
        {
          "_id": "6a88295ce5d6aac97521e62d",
          "name": "Ada Lovelace",
          "phone": "+8801733586288"
        },
        {
          "_id": "6a882970e5d6aac97521e631",
          "name": "Ada Lovelace",
          "phone": "+880173358628"
        }
      ]
    },
    {
      "_id": "6a882f71e5d6aac97521e90d",
      "type": "direct",
      "lastMessage": {
        "text": "👍",
        "sender": "6a882468e5d6aac97521e25e",
        "createdAt": "2026-08-21T13:51:56.478Z"
      },
      "updatedAt": "2026-08-21T13:51:56.713Z",
      "participant": {
        "_id": "6a882f6de5d6aac97521e902",
        "name": "SearchProbe",
        "phone": "+15559876543"
      }
    },
    {
      "_id": "6a8834f1e5d6aac97521f363",
      "type": "group",
      "lastMessage": {
        "text": "🔥",
        "sender": "6a88239de5d6aac97521e231",
        "createdAt": "2026-08-21T13:41:51.201Z"
      },
      "updatedAt": "2026-08-21T13:49:22.489Z",
      "name": "Renamed Team",
      "createdBy": "6a882468e5d6aac97521e25e",
      "admins": [
        "6a882468e5d6aac97521e25e"
      ],
      "participants": [
        {
          "_id": "6a882468e5d6aac97521e25e",
          "name": "Ada Lovelace",
          "phone": "+15551234567"
        }
      ]
    },
    {
      "_id": "6a8856f5e5d6aac975224fec",
      "type": "group",
      "lastMessage": {},
      "updatedAt": "2026-08-21T13:47:33.018Z",
      "name": "test",
      "createdBy": "6a882468e5d6aac97521e25e",
      "admins": [
        "6a882468e5d6aac97521e25e"
      ],
      "participants": [
        {
          "_id": "6a882468e5d6aac97521e25e",
          "name": "Ada Lovelace",
          "phone": "+15551234567"
        },
        {
          "_id": "6a883710e5d6aac97521f8a7",
          "name": "tuhin jamal",
          "phone": "+8801677634402"
        },
        {
          "_id": "6a8833cce5d6aac97521eff1",
          "name": "abir",
          "phone": "01774225956"
        }
      ]
    },
    {
      "_id": "6a885418e5d6aac9752248a9",
      "type": "direct",
      "lastMessage": {},
      "updatedAt": "2026-08-21T13:35:20.972Z",
      "participant": {
        "_id": "6a884c01e5d6aac975222fc9",
        "name": "Test",
        "phone": "+8804523254"
      }
    },
    {
      "_id": "6a8852d0e5d6aac97522453f",
      "type": "direct",
      "lastMessage": {},
      "updatedAt": "2026-08-21T13:29:52.921Z",
      "participant": {
        "_id": "6a884d2be5d6aac9752234a7",
        "name": "Adam",
        "phone": "#2222222222"
      }
    },
    {
      "_id": "6a884f07e5d6aac975223a43",
      "type": "group",
      "lastMessage": {},
      "updatedAt": "2026-08-21T13:29:27.686Z",
      "name": "Alpha Vanguard Elite",
      "createdBy": "6a882f6de5d6aac97521e902",
      "admins": [
        "6a882f6de5d6aac97521e902",
        "6a882468e5d6aac97521e25e"
      ],
      "participants": [
        {
          "_id": "6a882f6de5d6aac97521e902",
          "name": "SearchProbe",
          "phone": "+15559876543"
        },
        {
          "_id": "6a882468e5d6aac97521e25e",
          "name": "Ada Lovelace",
          "phone": "+15551234567"
        },
        {
          "_id": "6a8827c4e5d6aac97521e3ec",
          "name": "Alice Probe",
          "phone": "+15550001001"
        }
      ]
    },
    {
      "_id": "6a884cbce5d6aac97522331d",
      "type": "group",
      "lastMessage": {},
      "updatedAt": "2026-08-21T13:03:56.412Z",
      "name": "Alpha Squad",
      "createdBy": "6a88420ae5d6aac975221355",
      "admins": [
        "6a88420ae5d6aac975221355"
      ],
      "participants": [
        {
          "_id": "6a88420ae5d6aac975221355",
          "name": "Test User",
          "phone": "01712345678"
        },
        {
          "_id": "6a882468e5d6aac97521e25e",
          "name": "Ada Lovelace",
          "phone": "+15551234567"
        },
        {
          "_id": "6a8824a9e5d6aac97521e264",
          "name": "Probe Three",
          "phone": "+8801700000003"
        }
      ]
    },
    {
      "_id": "6a884810e5d6aac9752221e7",
      "type": "group",
      "lastMessage": {},
      "updatedAt": "2026-08-21T12:44:06.908Z",
      "name": "Renamed Group",
      "createdBy": "6a882468e5d6aac97521e25e",
      "admins": [
        "6a882468e5d6aac97521e25e",
        "6a882806e5d6aac97521e4b3"
      ],
      "participants": [
        {
          "_id": "6a882468e5d6aac97521e25e",
          "name": "Ada Lovelace",
          "phone": "+15551234567"
        },
        {
          "_id": "6a882806e5d6aac97521e4b3",
          "name": "Ada Probe",
          "phone": "+15550000001"
        },
        {
          "_id": "6a88282ce5d6aac97521e4fd",
          "name": "Bob Probe",
          "phone": "+15550000002"
        }
      ]
    },
    {
      "_id": "6a884735e5d6aac975222027",
      "type": "group",
      "lastMessage": {},
      "updatedAt": "2026-08-21T12:42:29.686Z",
      "name": "Realtime Test Group Renamed",
      "createdBy": "6a88239ee5d6aac97521e234",
      "admins": [
        "6a88239ee5d6aac97521e234"
      ],
      "participants": [
        {
          "_id": "6a88239ee5d6aac97521e234",
          "name": "oli",
          "phone": "+8801700000002"
        },
        {
          "_id": "6a882468e5d6aac97521e25e",
          "name": "Ada Lovelace",
          "phone": "+15551234567"
        },
        {
          "_id": "6a882970e5d6aac97521e631",
          "name": "Ada Lovelace",
          "phone": "+880173358628"
        }
      ]
    },
    {
      "_id": "6a884389e5d6aac97522179a",
      "type": "group",
      "lastMessage": {
        "text": "Hello, team!",
        "sender": "6a882468e5d6aac97521e25e",
        "createdAt": "2026-08-21T12:32:32.279Z"
      },
      "updatedAt": "2026-08-21T12:32:32.514Z",
      "name": "Renamed Team",
      "createdBy": "6a882468e5d6aac97521e25e",
      "admins": [
        "6a882468e5d6aac97521e25e",
        "6a88239ee5d6aac97521e234"
      ],
      "participants": [
        {
          "_id": "6a882468e5d6aac97521e25e",
          "name": "Ada Lovelace",
          "phone": "+15551234567"
        },
        {
          "_id": "6a88239ee5d6aac97521e234",
          "name": "oli",
          "phone": "+8801700000002"
        }
      ]
    },
    {
      "_id": "6a88408fe5d6aac97522102e",
      "type": "group",
      "lastMessage": {
        "text": "Hello!",
        "sender": "6a882468e5d6aac97521e25e",
        "createdAt": "2026-08-21T12:23:24.958Z"
      },
      "updatedAt": "2026-08-21T12:23:25.193Z",
      "name": "Renamed Team",
      "createdBy": "6a882468e5d6aac97521e25e",
      "admins": [
        "6a882468e5d6aac97521e25e",
        "6a882806e5d6aac97521e4b3"
      ],
      "participants": [
        {
          "_id": "6a882468e5d6aac97521e25e",
          "name": "Ada Lovelace",
          "phone": "+15551234567"
        },
        {
          "_id": "6a882806e5d6aac97521e4b3",
          "name": "Ada Probe",
          "phone": "+15550000001"
        }
      ]
    },
    {
      "_id": "6a8841cae5d6aac9752212ac",
      "type": "group",
      "lastMessage": {},
      "updatedAt": "2026-08-21T12:22:17.030Z",
      "name": "Renamed Team f",
      "createdBy": "6a882468e5d6aac97521e25e",
      "admins": [
        "6a882468e5d6aac97521e25e",
        "6a882f6de5d6aac97521e902"
      ],
      "participants": [
        {
          "_id": "6a882468e5d6aac97521e25e",
          "name": "Ada Lovelace",
          "phone": "+15551234567"
        },
        {
          "_id": "6a882f6de5d6aac97521e902",
          "name": "SearchProbe",
          "phone": "+15559876543"
        }
      ]
    },
    {
      "_id": "6a883f60e5d6aac975220e1f",
      "type": "direct",
      "lastMessage": {},
      "updatedAt": "2026-08-21T12:06:56.504Z",
      "participant": {
        "_id": "6a883cd3e5d6aac9752208e4",
        "name": "ProbeB Grace",
        "phone": "+15554313361"
      }
    },
    {
      "_id": "6a883dede5d6aac975220b66",
      "type": "group",
      "lastMessage": {},
      "updatedAt": "2026-08-21T12:00:51.838Z",
      "name": "Renamed Pioneers 1787313645642",
      "createdBy": "6a882468e5d6aac97521e25e",
      "admins": [
        "6a882468e5d6aac97521e25e",
        "6a882f6de5d6aac97521e902"
      ],
      "participants": [
        {
          "_id": "6a882468e5d6aac97521e25e",
          "name": "Ada Lovelace",
          "phone": "+15551234567"
        },
        {
          "_id": "6a882f6de5d6aac97521e902",
          "name": "SearchProbe",
          "phone": "+15559876543"
        },
        {
          "_id": "6a882f6ee5d6aac97521e905",
          "name": "Grace Hopper",
          "phone": "+15555555555"
        }
      ]
    },
    {
      "_id": "6a883617e5d6aac97521f5ef",
      "type": "group",
      "lastMessage": {},
      "updatedAt": "2026-08-21T11:49:50.997Z",
      "name": "Renamed Team",
      "createdBy": "6a882468e5d6aac97521e25e",
      "admins": [
        "6a882468e5d6aac97521e25e",
        "6a88239de5d6aac97521e231"
      ],
      "participants": [
        {
          "_id": "6a882468e5d6aac97521e25e",
          "name": "Ada Lovelace",
          "phone": "+15551234567"
        },
        {
          "_id": "6a88239de5d6aac97521e231",
          "name": "TestA",
          "phone": "+8801700000001"
        },
        {
          "_id": "6a88239ee5d6aac97521e234",
          "name": "oli",
          "phone": "+8801700000002"
        }
      ]
    },
    {
      "_id": "6a88350ee5d6aac97521f38a",
      "type": "group",
      "lastMessage": {},
      "updatedAt": "2026-08-21T11:23:49.702Z",
      "name": "Nimbus Lab Renamed",
      "createdBy": "6a882f6de5d6aac97521e902",
      "admins": [
        "6a882f6de5d6aac97521e902"
      ],
      "participants": [
        {
          "_id": "6a882f6de5d6aac97521e902",
          "name": "SearchProbe",
          "phone": "+15559876543"
        },
        {
          "_id": "6a882468e5d6aac97521e25e",
          "name": "Ada Lovelace",
          "phone": "+15551234567"
        },
        {
          "_id": "6a882f6ee5d6aac97521e905",
          "name": "Grace Hopper",
          "phone": "+15555555555"
        }
      ]
    },
    {
      "_id": "6a882f75e5d6aac97521e91c",
      "type": "group",
      "lastMessage": {},
      "updatedAt": "2026-08-21T10:59:06.533Z",
      "name": "CS Pioneers Team",
      "createdBy": "6a882468e5d6aac97521e25e",
      "admins": [
        "6a882468e5d6aac97521e25e",
        "6a882f6de5d6aac97521e902"
      ],
      "participants": [
        {
          "_id": "6a882468e5d6aac97521e25e",
          "name": "Ada Lovelace",
          "phone": "+15551234567"
        },
        {
          "_id": "6a882f6de5d6aac97521e902",
          "name": "SearchProbe",
          "phone": "+15559876543"
        },
        {
          "_id": "6a882f6ee5d6aac97521e905",
          "name": "Grace Hopper",
          "phone": "+15555555555"
        }
      ]
    }
  ]
}
Response headers
 access-control-allow-origin: * 
 alt-svc: h3=":443"; ma=86400 
 cf-cache-status: DYNAMIC 
 cf-ray: a2ebeffd7d5436c6-DAC 
 content-encoding: br 
 content-type: application/json; charset=utf-8 
 date: Fri,21 Aug 2026 19:10:24 GMT 
 etag: W/"8be0-EzsCJqqDu5lxHvtk+hJN0dQ7TlY" 
 rndr-id: b7323642-0230-4af3 
 server: cloudflare 
 vary: Accept-Encoding 
 x-powered-by: Express 
 x-render-origin-server: Render 
Responses
Code	Description	Links
default	
Response bodies and status codes are intentionally not specified in this document. Inspect the live API and document the responses yourself.

POST
/conversations
Start a direct conversation



Start (or open) a 1-to-1 conversation with another user.

Parameters
Cancel
No parameters

Request body

application/json
Edit Value
Schema
{
  "userId": "665f0c2a9b1e4a0012ab34cd"
}
Execute
Clear
Responses
Curl

curl -X 'POST' \
  'https://frontend-task-chatapp.onrender.com/api/conversations' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTg4MjQ2OGU1ZDZhYWM5NzUyMWUyNWUiLCJpYXQiOjE3ODczMzkyMzMsImV4cCI6MTc4Nzk0NDAzM30.rWGwU5YQ6nOR6RJhaN8WElCVIm136XgZypTZv_CMbro' \
  -H 'Content-Type: application/json' \
  -d '{
  "userId": "665f0c2a9b1e4a0012ab34cd"
}'
Request URL
https://frontend-task-chatapp.onrender.com/api/conversations
Server response
Code	Details
400	
Error: response status is 400

Response body
Download
{
  "error": {
    "message": "One or more users do not exist",
    "code": "UNKNOWN_USER"
  }
}
Response headers
 access-control-allow-origin: * 
 alt-svc: h3=":443"; ma=86400 
 cf-cache-status: DYNAMIC 
 cf-ray: a2ebf288fa3f36c6-DAC 
 content-encoding: br 
 content-length: 76 
 content-type: application/json; charset=utf-8 
 date: Fri,21 Aug 2026 19:12:07 GMT 
 etag: W/"4c-DlNxmPcRCjWIhY0mHDhabUuvvNA" 
 rndr-id: 4f3a1096-4fc8-4759 
 server: cloudflare 
 vary: Accept-Encoding 
 x-powered-by: Express 
 x-render-origin-server: Render 
Responses
Code	Description	Links
default	
Response bodies and status codes are intentionally not specified in this document. Inspect the live API and document the responses yourself.


GET
/conversations/{id}/messages
Get message history



Message history for a conversation, with pagination for loading older messages.

Parameters
Cancel
Name	Description
id *
string
(path)
The conversation id.

6a88a16de5d6aac9752451b1
limit
integer
(query)
Maximum number of messages to return per page.

20
before
string
(query)
Cursor for fetching the page of messages before a given message.

before
Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://frontend-task-chatapp.onrender.com/api/conversations/6a88a16de5d6aac9752451b1/messages?limit=20' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTg4MjQ2OGU1ZDZhYWM5NzUyMWUyNWUiLCJpYXQiOjE3ODczMzkyMzMsImV4cCI6MTc4Nzk0NDAzM30.rWGwU5YQ6nOR6RJhaN8WElCVIm136XgZypTZv_CMbro'
Request URL
https://frontend-task-chatapp.onrender.com/api/conversations/6a88a16de5d6aac9752451b1/messages?limit=20
Server response
Code	Details
200	
Response body
Download
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
Response headers
 access-control-allow-origin: * 
 alt-svc: h3=":443"; ma=86400 
 cf-cache-status: DYNAMIC 
 cf-ray: a2ebf53b39e4a478-DAC 
 content-encoding: br 
 content-length: 190 
 content-type: application/json; charset=utf-8 
 date: Fri,21 Aug 2026 19:13:57 GMT 
 etag: W/"176-D0WmZs4FzK+pUR5PTma/bdLGWqo" 
 priority: u=1,i 
 rndr-id: 0b9ae7fa-9802-406f 
 server: cloudflare 
 server-timing: cfExtPri 
 vary: Accept-Encoding 
 x-powered-by: Express 
 x-render-origin-server: Render 
Responses
Code	Description	Links
default	
Response bodies and status codes are intentionally not specified in this document. Inspect the live API and document the responses yourself.


Groups
Group creation and member / admin management



POST
/conversations/group
Create a group



Create a group conversation. The creator becomes an admin.

Parameters
Cancel
No parameters

Request body

application/json
Edit Value
Schema
{
  "name": "Project Team",
  "participantIds": [
    "string"
  ]
}
Execute
Clear
Responses
Curl

curl -X 'POST' \
  'https://frontend-task-chatapp.onrender.com/api/conversations/group' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTg4MjQ2OGU1ZDZhYWM5NzUyMWUyNWUiLCJpYXQiOjE3ODczMzkyMzMsImV4cCI6MTc4Nzk0NDAzM30.rWGwU5YQ6nOR6RJhaN8WElCVIm136XgZypTZv_CMbro' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "Project Team",
  "participantIds": [
    "string"
  ]
}'
Request URL
https://frontend-task-chatapp.onrender.com/api/conversations/group
Server response
Code	Details
400	
Error: response status is 400

Response body
Download
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "path": "participantIds",
        "message": "a group needs at least 3 members"
      }
    ]
  }
}
Response headers
 access-control-allow-origin: * 
 alt-svc: h3=":443"; ma=86400 
 cf-cache-status: DYNAMIC 
 cf-ray: a2ebf624d88f36c6-DAC 
 content-encoding: br 
 content-length: 116 
 content-type: application/json; charset=utf-8 
 date: Fri,21 Aug 2026 19:14:34 GMT 
 etag: W/"96-w5d8WwkElV0yUqsIZShtD+MvnGw" 
 rndr-id: 5ff4f9a7-7418-4a0c 
 server: cloudflare 
 vary: Accept-Encoding 
 x-powered-by: Express 
 x-render-origin-server: Render 
Responses
Code	Description	Links
default	
Response bodies and status codes are intentionally not specified in this document. Inspect the live API and document the responses yourself.


Groups
Group creation and member / admin management



POST
/conversations/group
Create a group



Create a group conversation. The creator becomes an admin.

Parameters
Cancel
Reset
No parameters

Request body

application/json
Edit Value
Schema
{
  "name": "Project Team",
  "participantIds": [
    "6a886ad5e5d6aac97522caa9",
"6a886cc3e5d6aac97522d1cb",
"6a886e05e5d6aac97522d6bd"
  ]
}
Execute
Clear
Responses
Curl

curl -X 'POST' \
  'https://frontend-task-chatapp.onrender.com/api/conversations/group' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTg4MjQ2OGU1ZDZhYWM5NzUyMWUyNWUiLCJpYXQiOjE3ODczMzkyMzMsImV4cCI6MTc4Nzk0NDAzM30.rWGwU5YQ6nOR6RJhaN8WElCVIm136XgZypTZv_CMbro' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "Project Team",
  "participantIds": [
    "6a886ad5e5d6aac97522caa9",
"6a886cc3e5d6aac97522d1cb",
"6a886e05e5d6aac97522d6bd"
  ]
}'
Request URL
https://frontend-task-chatapp.onrender.com/api/conversations/group
Server response
Code	Details
201	
Response body
Download
{
  "_id": "6a88a4a6e5d6aac975246e22",
  "type": "group",
  "name": "Project Team",
  "createdBy": "6a882468e5d6aac97521e25e",
  "admins": [
    "6a882468e5d6aac97521e25e"
  ],
  "participants": [
    {
      "_id": "6a882468e5d6aac97521e25e",
      "name": "Ada Lovelace",
      "phone": "+15551234567"
    },
    {
      "_id": "6a886ad5e5d6aac97522caa9",
      "name": "Ada Probe",
      "phone": "+15555142553"
    },
    {
      "_id": "6a886cc3e5d6aac97522d1cb",
      "name": "Ada5636867",
      "phone": "+15555636867"
    },
    {
      "_id": "6a886e05e5d6aac97522d6bd",
      "name": "Ada Lovelace",
      "phone": "+15551234345"
    }
  ],
  "createdAt": "2026-08-21T19:19:02.016Z",
  "updatedAt": "2026-08-21T19:19:02.016Z"
}
Response headers
 access-control-allow-origin: * 
 alt-svc: h3=":443"; ma=86400 
 cf-cache-status: DYNAMIC 
 cf-ray: a2ebfca9fc7ea485-DAC 
 content-encoding: br 
 content-length: 241 
 content-type: application/json; charset=utf-8 
 date: Fri,21 Aug 2026 19:19:02 GMT 
 etag: W/"22e-u7gKQPfxmPggR7RbcpIVo467Fg4" 
 rndr-id: b126154e-c60c-421b 
 server: cloudflare 
 vary: Accept-Encoding 
 x-powered-by: Express 
 x-render-origin-server: Render 
Responses
Code	Description	Links
default	
Response bodies and status codes are intentionally not specified in this document. Inspect the live API and document the responses yourself



POST
/conversations/{id}/participants
Add members to a group



Add one or more members to a group (admins only).

Parameters
Cancel
Reset
Name	Description
id *
string
(path)
The group id.

6a88a4a6e5d6aac975246e22
Request body

application/json
Edit Value
Schema
{
  "userIds": [
    "6a882468e5d6aac97521e25e"
  ]
}
Execute
Clear
Responses
Curl

curl -X 'POST' \
  'https://frontend-task-chatapp.onrender.com/api/conversations/6a88a4a6e5d6aac975246e22/participants' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTg4MjQ2OGU1ZDZhYWM5NzUyMWUyNWUiLCJpYXQiOjE3ODczMzkyMzMsImV4cCI6MTc4Nzk0NDAzM30.rWGwU5YQ6nOR6RJhaN8WElCVIm136XgZypTZv_CMbro' \
  -H 'Content-Type: application/json' \
  -d '{
  "userIds": [
    "6a882468e5d6aac97521e25e"
  ]
}'
Request URL
https://frontend-task-chatapp.onrender.com/api/conversations/6a88a4a6e5d6aac975246e22/participants
Server response
Code	Details
200	
Response body
Download
{
  "_id": "6a88a4a6e5d6aac975246e22",
  "type": "group",
  "name": "Project Team",
  "createdBy": "6a882468e5d6aac97521e25e",
  "admins": [
    "6a882468e5d6aac97521e25e"
  ],
  "participants": [
    {
      "_id": "6a882468e5d6aac97521e25e",
      "name": "Ada Lovelace",
      "phone": "+15551234567"
    },
    {
      "_id": "6a886ad5e5d6aac97522caa9",
      "name": "Ada Probe",
      "phone": "+15555142553"
    },
    {
      "_id": "6a886cc3e5d6aac97522d1cb",
      "name": "Ada5636867",
      "phone": "+15555636867"
    },
    {
      "_id": "6a886e05e5d6aac97522d6bd",
      "name": "Ada Lovelace",
      "phone": "+15551234345"
    }
  ],
  "createdAt": "2026-08-21T19:19:02.016Z",
  "updatedAt": "2026-08-21T19:20:21.665Z"
}
Response headers
 access-control-allow-origin: * 
 alt-svc: h3=":443"; ma=86400 
 cf-cache-status: DYNAMIC 
 cf-ray: a2ebfe9a4a82a485-DAC 
 content-encoding: br 
 content-length: 246 
 content-type: application/json; charset=utf-8 
 date: Fri,21 Aug 2026 19:20:22 GMT 
 etag: W/"22e-Z5vtnTEabXbX6X3VJldxbzvnxX0" 
 rndr-id: 6ced6364-db52-4892 
 server: cloudflare 
 vary: Accept-Encoding 
 x-powered-by: Express 
 x-render-origin-server: Render 
Responses
Code	Description	Links
default	
Response bodies and status codes are intentionally not specified in this document. Inspect the live API and document the responses yourself.

DELETE
/conversations/{id}/participants/{userId}
Remove a member / leave a group



Remove a member from a group (admins only). Passing your own id leaves the group.

Parameters
Cancel
Name	Description
id *
string
(path)
The group id.

6a88a4a6e5d6aac975246e22
userId *
string
(path)
The member to remove (your own id to leave).

6a882468e5d6aac97521e25e
Execute
Clear
Responses
Curl

curl -X 'DELETE' \
  'https://frontend-task-chatapp.onrender.com/api/conversations/6a88a4a6e5d6aac975246e22/participants/6a882468e5d6aac97521e25e' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTg4MjQ2OGU1ZDZhYWM5NzUyMWUyNWUiLCJpYXQiOjE3ODczMzkyMzMsImV4cCI6MTc4Nzk0NDAzM30.rWGwU5YQ6nOR6RJhaN8WElCVIm136XgZypTZv_CMbro'
Request URL
https://frontend-task-chatapp.onrender.com/api/conversations/6a88a4a6e5d6aac975246e22/participants/6a882468e5d6aac97521e25e
Server response
Code	Details
200	
Response body
Download
{
  "_id": "6a88a4a6e5d6aac975246e22",
  "type": "group",
  "name": "Project Team",
  "createdBy": "6a882468e5d6aac97521e25e",
  "admins": [
    "6a886ad5e5d6aac97522caa9"
  ],
  "participants": [
    {
      "_id": "6a886ad5e5d6aac97522caa9",
      "name": "Ada Probe",
      "phone": "+15555142553"
    },
    {
      "_id": "6a886cc3e5d6aac97522d1cb",
      "name": "Ada5636867",
      "phone": "+15555636867"
    },
    {
      "_id": "6a886e05e5d6aac97522d6bd",
      "name": "Ada Lovelace",
      "phone": "+15551234345"
    }
  ],
  "createdAt": "2026-08-21T19:19:02.016Z",
  "updatedAt": "2026-08-21T19:22:28.635Z"
}
Response headers
 access-control-allow-origin: * 
 alt-svc: h3=":443"; ma=86400 
 cf-cache-status: DYNAMIC 
 cf-ray: a2ec01b0dc62a485-DAC 
 content-encoding: br 
 content-length: 240 
 content-type: application/json; charset=utf-8 
 date: Fri,21 Aug 2026 19:22:29 GMT 
 etag: W/"1de-D0cPtSg4fG7ovbbNU7OFEvRNd/w" 
 rndr-id: 585943b4-09f4-412e 
 server: cloudflare 
 vary: Accept-Encoding 
 x-powered-by: Express 
 x-render-origin-server: Render 
Responses
Code	Description	Links
default	
Response bodies and status codes are intentionally not specified in this document. Inspect the live API and document the responses yourself.

POST
/conversations/{id}/admins
Promote a member to admin



Promote an existing group member to admin (admins only).

Parameters
Cancel
Name	Description
id *
string
(path)
The group id.

6a88a4a6e5d6aac975246e22
Request body

application/json
Edit Value
Schema
{
  "userId": "string"
}
Execute
Clear
Responses
Curl

curl -X 'POST' \
  'https://frontend-task-chatapp.onrender.com/api/conversations/6a88a4a6e5d6aac975246e22/admins' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTg4MjQ2OGU1ZDZhYWM5NzUyMWUyNWUiLCJpYXQiOjE3ODczMzkyMzMsImV4cCI6MTc4Nzk0NDAzM30.rWGwU5YQ6nOR6RJhaN8WElCVIm136XgZypTZv_CMbro' \
  -H 'Content-Type: application/json' \
  -d '{
  "userId": "string"
}'
Request URL
https://frontend-task-chatapp.onrender.com/api/conversations/6a88a4a6e5d6aac975246e22/admins
Server response
Code	Details
403	
Error: response status is 403

Response body
Download
{
  "error": {
    "message": "Only admins can promote members",
    "code": "FORBIDDEN"
  }
}
Response headers
 access-control-allow-origin: * 
 alt-svc: h3=":443"; ma=86400 
 cf-cache-status: DYNAMIC 
 cf-ray: a2ec0280afbda485-DAC 
 content-encoding: br 
 content-length: 72 
 content-type: application/json; charset=utf-8 
 date: Fri,21 Aug 2026 19:23:01 GMT 
 etag: W/"4a-dpqzrPoECWNDITZG6B6UOxH+Wqw" 
 rndr-id: 16ab85da-1949-4705 
 server: cloudflare 
 vary: Accept-Encoding 
 x-powered-by: Express 
 x-render-origin-server: Render 
Responses
Code	Description	Links
default	
Response bodies and status codes are intentionally not specified in this document. Inspect the live API and document the responses yourself.

POST
/conversations/{id}/admins
Promote a member to admin



Promote an existing group member to admin (admins only).

Parameters
Cancel
Reset
Name	Description
id *
string
(path)
The group id.

6a88a5e1e5d6aac975247786
Request body

application/json
Edit Value
Schema
{
  "userId": "6a886cc3e5d6aac97522d1cb"
}
Execute
Clear
Responses
Curl

curl -X 'POST' \
  'https://frontend-task-chatapp.onrender.com/api/conversations/6a88a5e1e5d6aac975247786/admins' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTg4MjQ2OGU1ZDZhYWM5NzUyMWUyNWUiLCJpYXQiOjE3ODczMzkyMzMsImV4cCI6MTc4Nzk0NDAzM30.rWGwU5YQ6nOR6RJhaN8WElCVIm136XgZypTZv_CMbro' \
  -H 'Content-Type: application/json' \
  -d '{
  "userId": "6a886cc3e5d6aac97522d1cb"
}'
Request URL
https://frontend-task-chatapp.onrender.com/api/conversations/6a88a5e1e5d6aac975247786/admins
Server response
Code	Details
200	
Response body
Download
{
  "_id": "6a88a5e1e5d6aac975247786",
  "type": "group",
  "name": "Project Team 1",
  "createdBy": "6a882468e5d6aac97521e25e",
  "admins": [
    "6a882468e5d6aac97521e25e",
    "6a886cc3e5d6aac97522d1cb"
  ],
  "participants": [
    {
      "_id": "6a882468e5d6aac97521e25e",
      "name": "Test User",
      "phone": "+15551234567"
    },
    {
      "_id": "6a886ad5e5d6aac97522caa9",
      "name": "Ada Probe",
      "phone": "+15555142553"
    },
    {
      "_id": "6a886cc3e5d6aac97522d1cb",
      "name": "Ada5636867",
      "phone": "+15555636867"
    },
    {
      "_id": "6a886e05e5d6aac97522d6bd",
      "name": "Ada Lovelace",
      "phone": "+15551234345"
    }
  ],
  "createdAt": "2026-08-21T19:24:17.235Z",
  "updatedAt": "2026-08-21T19:25:10.629Z"
}
Response headers
 access-control-allow-origin: * 
 alt-svc: h3=":443"; ma=86400 
 cf-cache-status: DYNAMIC 
 cf-ray: a2ec05a9c9c3a485-DAC 
 content-encoding: br 
 content-length: 262 
 content-type: application/json; charset=utf-8 
 date: Fri,21 Aug 2026 19:25:11 GMT 
 etag: W/"248-RNIQpG2OVfGxyei60UHHkc1iIKU" 
 rndr-id: 2467ac0f-988e-45fd 
 server: cloudflare 
 vary: Accept-Encoding 
 x-powered-by: Express 
 x-render-origin-server: Render 
Responses
Code	Description	Links
default	
Response bodies and status codes are intentionally not specified in this document. Inspect the live API and document the responses yourself.


PATCH
/conversations/{id}
Rename a group



Rename a group (admins only).

Parameters
Cancel
Reset
Name	Description
id *
string
(path)
The group id.

6a88a5e1e5d6aac975247786
Request body

application/json
Edit Value
Schema
{
  "name": "Ada Probe"
}
Execute
Clear
Responses
Curl

curl -X 'PATCH' \
  'https://frontend-task-chatapp.onrender.com/api/conversations/6a88a5e1e5d6aac975247786' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTg4MjQ2OGU1ZDZhYWM5NzUyMWUyNWUiLCJpYXQiOjE3ODczMzkyMzMsImV4cCI6MTc4Nzk0NDAzM30.rWGwU5YQ6nOR6RJhaN8WElCVIm136XgZypTZv_CMbro' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "Ada Probe"
}'
Request URL
https://frontend-task-chatapp.onrender.com/api/conversations/6a88a5e1e5d6aac975247786
Server response
Code	Details
200	
Response body
Download
{
  "_id": "6a88a5e1e5d6aac975247786",
  "type": "group",
  "name": "Ada Probe",
  "createdBy": "6a882468e5d6aac97521e25e",
  "admins": [
    "6a882468e5d6aac97521e25e",
    "6a886cc3e5d6aac97522d1cb"
  ],
  "participants": [
    {
      "_id": "6a882468e5d6aac97521e25e",
      "name": "Test User",
      "phone": "+15551234567"
    },
    {
      "_id": "6a886ad5e5d6aac97522caa9",
      "name": "Ada Probe",
      "phone": "+15555142553"
    },
    {
      "_id": "6a886cc3e5d6aac97522d1cb",
      "name": "Ada5636867",
      "phone": "+15555636867"
    },
    {
      "_id": "6a886e05e5d6aac97522d6bd",
      "name": "Ada Lovelace",
      "phone": "+15551234345"
    }
  ],
  "createdAt": "2026-08-21T19:24:17.235Z",
  "updatedAt": "2026-08-21T19:25:57.918Z"
}
Response headers
 access-control-allow-origin: * 
 alt-svc: h3=":443"; ma=86400 
 cf-cache-status: DYNAMIC 
 cf-ray: a2ec06d14855a485-DAC 
 content-encoding: br 
 content-length: 257 
 content-type: application/json; charset=utf-8 
 date: Fri,21 Aug 2026 19:25:58 GMT 
 etag: W/"243-6sTBIhw0kVmmgrcA59N+5gLvbyU" 
 rndr-id: ac3f23a1-dde8-41ed 
 server: cloudflare 
 vary: Accept-Encoding 
 x-powered-by: Express 
 x-render-origin-server: Render 
Responses
Code	Description	Links
default	
Response bodies and status codes are intentionally not specified in this document. Inspect the live API and document the responses yourself.

GET
/health
Health check


Parameters
Cancel
No parameters

Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://frontend-task-chatapp.onrender.com/api/health' \
  -H 'accept: */*'
Request URL
https://frontend-task-chatapp.onrender.com/api/health
Server response
Code	Details
404	
Error: response status is 404

Response body
Download
{
  "error": {
    "message": "Route not found",
    "code": "NOT_FOUND"
  }
}
Response headers
 access-control-allow-origin: * 
 alt-svc: h3=":443"; ma=86400 
 cf-cache-status: DYNAMIC 
 cf-ray: a2ec07f509fca47b-DAC 
 content-encoding: br 
 content-length: 58 
 content-type: application/json; charset=utf-8 
 date: Fri,21 Aug 2026 19:26:44 GMT 
 etag: W/"3a-OSTaJsCygyWLcssqdEmrh1M1SwY" 
 priority: u=1,i 
 rndr-id: 4fe8307b-5be1-4eb0 
 server: cloudflare 
 server-timing: cfExtPri 
 vary: Accept-Encoding 
 x-powered-by: Express 
 x-render-origin-server: Render 
Responses
Code	Description	Links
default	
Response bodies and status codes are intentionally not specified in this document. Inspect the live API and document the responses yourself.

No links

GET
/auth/me
Current user



Returns the user associated with the bearer token. Useful for restoring a session.

Parameters
Cancel
No parameters

Execute
Clear
Responses
Curl

curl -X 'GET' \
  'https://frontend-task-chatapp.onrender.com/api/auth/me' \
  -H 'accept: */*'
Request URL
https://frontend-task-chatapp.onrender.com/api/auth/me
Server response
Code	Details
400	
Error: response status is 400

Response body
Download
{
  "error": {
    "message": "No token provided",
    "code": "NO_TOKEN"
  }
}
Response headers
 access-control-allow-origin: * 
 alt-svc: h3=":443"; ma=86400 
 cf-cache-status: DYNAMIC 
 cf-ray: a2ec1a333e925853-DAC 
 content-encoding: br 
 content-length: 55 
 content-type: application/json; charset=utf-8 
 date: Fri,21 Aug 2026 19:39:11 GMT 
 etag: W/"3b-bo1qUXJnMKXaHp95dL7NpmyfCaQ" 
 priority: u=1,i 
 rndr-id: 28b76790-5e46-40f8 
 server: cloudflare 
 server-timing: cfExtPri 
 vary: Accept-Encoding 
 x-powered-by: Express 
 x-render-origin-server: Render 
Responses
Code	Description	Links
default	
Response bodies and status codes are intentionally not specified in this document. Inspect the live API and document the responses yourself.


bearerAuth  (http, Bearer)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTg4MjQ2OGU1ZDZhYWM5NzUyMWUyNWUiLCJpYXQiOjE3ODczNDExODgsImV4cCI6MTc4Nzk0NTk4OH0.gqUZ5fD0QyIWCQxdwN0JmTL1uiNfeM_U9hbhusE3PDc

Then got Authorized and value:****



POST
/conversations
Start a direct conversation



Start (or open) a 1-to-1 conversation with another user.

Parameters
Cancel
No parameters

Request body

application/json
Edit Value
Schema
{
  "userId": "665f0c2a9b1e4a0012ab34cd"
}
Execute
Clear
Responses
Curl

curl -X 'POST' \
  'https://frontend-task-chatapp.onrender.com/api/conversations' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTg4MjQ2OGU1ZDZhYWM5NzUyMWUyNWUiLCJpYXQiOjE3ODczNDExODgsImV4cCI6MTc4Nzk0NTk4OH0.gqUZ5fD0QyIWCQxdwN0JmTL1uiNfeM_U9hbhusE3PDc' \
  -H 'Content-Type: application/json' \
  -d '{
  "userId": "665f0c2a9b1e4a0012ab34cd"
}'
Request URL
https://frontend-task-chatapp.onrender.com/api/conversations
Server response
Code	Details
400	
Error: response status is 400

Response body
Download
{
  "error": {
    "message": "One or more users do not exist",
    "code": "UNKNOWN_USER"
  }
}
Response headers
 access-control-allow-origin: * 
 alt-svc: h3=":443"; ma=86400 
 cf-cache-status: DYNAMIC 
 cf-ray: a2ec23df2f90bb2f-DAC 
 content-encoding: br 
 content-length: 76 
 content-type: application/json; charset=utf-8 
 date: Fri,21 Aug 2026 19:45:48 GMT 
 etag: W/"4c-DlNxmPcRCjWIhY0mHDhabUuvvNA" 
 priority: u=1,i 
 rndr-id: 171c567f-7533-4fb6 
 server: cloudflare 
 server-timing: cfExtPri 
 vary: Accept-Encoding 
 x-powered-by: Express 
 x-render-origin-server: Render 
Responses
Code	Description	Links
default	
Response bodies and status codes are intentionally not specified in this document. Inspect the live API and document the responses yourself.