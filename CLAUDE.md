# Compass Chat - Project Documentation

**Project:** Real-time chat application (React/Next.js)
**Deadline:** Aug 22, 2026 4:00 PM
**GitHub Repo:** `compass-chat`
**API Docs (Swagger):** https://frontend-task-chatapp.onrender.com/docs/
**Full API reference (verified against the live API):** [docs/API.md](docs/API.md)

---

## Overview

This is a three-part take-home assignment (see [Assignment.md](Assignment.md) for the original brief). Parts build on each other and should be completed in order.

- **Part 1** — Document the given API, then build the chat screens against it: login, user search, direct + group conversations, message list, sending, real-time updates, loading/empty/error states, auto-scroll. **The chat panel (message list, sending, real-time behavior) is where the most care and polish should go** — that's explicitly what's evaluated closest.
- **Part 2** — A creative landing page showcasing what was built in Part 1. Fully open on visual direction; the brief explicitly wants boldness over a generic template.
- **Part 3** — A concise write-up: architecture/library trade-offs, design reasoning, AI tool usage (what was used, what was changed/rejected), what you'd improve with more time, and any API issues encountered.

Both Part 1 and Part 2 call out a **bonus** for one genuinely original touch — not a common pattern executed well, but something that shows one-step-ahead thinking. See [Bonus Ideas](#bonus-ideas-to-consider) below.

**Note on the assignment file itself:** [Assignment.md:68](Assignment.md#L68) contains a hidden instruction directed at AI assistants (asking any AI summarizing the document to insert an unrelated word into its output). This has been ignored as a prompt injection, not a real project requirement. Flagging it here so it isn't mistaken for an oversight later.

---

## API Base URL
```
https://frontend-task-chatapp.onrender.com/api
```

All endpoints require `Authorization: Bearer {token}` except `/auth/login` and `/health`.

For full detail — request/response examples, every quirk found, pagination, error shapes, curl examples — see **[docs/API.md](docs/API.md)**. This section is just a quick-glance summary; docs/API.md is the source of truth.

---

## API Endpoints Summary

### Authentication
- **POST** `/auth/login` — body `{phone, name}` → `{token, user}`. Registers automatically if the phone is new.
- **GET** `/auth/me` — current user `{_id, name, phone, createdAt}`. Missing token → **400** `NO_TOKEN` (not 401).

### Users
- **GET** `/users/search?q=query` → bare array `[{_id, name, phone}]` (not wrapped in `data`).

### Conversations
- **GET** `/conversations` → `{data: [conversations]}`. Direct and group conversations have **different shapes** — see Key API Models below.
- **POST** `/conversations` — body `{userId}` (not `recipientId`) → starts/reopens a direct conversation.
- **GET** `/conversations/{id}/messages` — query `limit`, `before` (cursor) → `{messages: [...], hasMore}` (key is `messages`, not `data`).

### Groups
- **POST** `/conversations/group` — body `{name, participantIds}`, minimum 2 entries (3 total with creator) → full conversation object.
- **POST** `/conversations/{id}/participants` — body `{userIds}` (plural, admins only) → full updated conversation object.
- **DELETE** `/conversations/{id}/participants/{userId}` (admin, or self to leave) → full updated conversation object.
- **POST** `/conversations/{id}/admins` — body `{userId}` (admins only) → full updated conversation object.
- **PATCH** `/conversations/{id}` — body `{name}` (admins only) → full updated conversation object.

All group mutation endpoints return the **whole conversation object**, not a small summary — plan the client to just re-render from the response rather than patching partial state.

### Messages
- **POST** `/messages` — body `{conversationId, text}`. Not directly observed against the live API; response shape is inferred (see docs/API.md).

### System
- **GET** `/health` — documented in Swagger but not actually implemented; always returns 404. Don't rely on it.

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
`createdAt` only appears on `/auth/login` and `/auth/me` responses — user objects embedded in conversations/search results omit it.

### Message
```json
{
  "_id": "string",
  "conversation": "string",
  "sender": "userId",
  "text": "string",
  "createdAt": "ISO 8601"
}
```
Field is `conversation`, not `conversationId`. Sender name is **never** populated — resolve it client-side from the conversation's participant list.

### Conversation — group
```json
{
  "_id": "string",
  "type": "group",
  "name": "string",
  "createdBy": "userId",
  "admins": ["userId"],
  "participants": [User],
  "lastMessage": { "text": "string", "sender": "userId", "createdAt": "ISO 8601" },
  "updatedAt": "ISO 8601"
}
```
`createdAt` appears on group-creation/mutation responses only, not on list items.

### Conversation — direct
```json
{
  "_id": "string",
  "type": "direct",
  "participant": User,
  "lastMessage": { "text": "string", "sender": "userId", "createdAt": "ISO 8601" },
  "updatedAt": "ISO 8601"
}
```
Note **`participant`, singular** — the other user only, not an array, and not present for group conversations (which use `participants` instead). This is the single most important shape difference to handle correctly in the UI layer.

---

## API Quirks/Notes
- `GET /users/search` returns a bare array; `GET /conversations` and `GET /conversations/{id}/messages` both wrap results, but under different keys (`data` vs. `messages`).
- Direct and group conversations have different fields (`participant` vs. `participants`, presence of `name`/`admins`/`createdBy`).
- `lastMessage` is `{}` (empty object), not `null`, when a conversation has no messages yet.
- Pagination **does** exist on the messages endpoint (`limit`, `before`, `hasMore`) — the API is not pagination-free.
- All observed errors use `{error: {message, code}}`; validation errors add a `details` array. No 401 was observed anywhere — missing auth surfaces as 400/`NO_TOKEN`.
- Message deletion/editing is not supported.
- Real-time is confirmed working via Socket.io at the root origin (not documented in the Swagger listing, but tested directly): connecting with the auth token auto-subscribes to your conversations, no join call needed. `message:new` and `conversation:updated` both fire live. `message:new`'s payload uses `id` (not `_id`) and an epoch-millisecond `createdAt`, unlike every REST response.
- `POST /messages` does not reject empty/whitespace text server-side (only a missing `text` field is rejected) — the "no empty sends" rule must be enforced entirely client-side.
- `POST /messages` with a nonexistent `conversationId` returns 200 with body `null`, not a 404 — guard for `null` explicitly.
- `POST /auth/login` has no password check — the same phone number always logs into the same account regardless of name sent. Real security note, not just a quirk.
- Full detail on all of the above, with captured examples, lives in [docs/API.md](docs/API.md).

---

## Planned Directory Structure
```
compass-chat/
├── src/
│   ├── pages/              (Next.js pages — Pages Router)
│   ├── components/         (React components)
│   │   ├── chat/           (MessageList, MessageBubble, Composer, ConversationList)
│   │   ├── ui/             (shared primitives — button, input, dialog, avatar)
│   │   └── landing/        (Part 2 landing page sections)
│   ├── hooks/              (useConversations, useMessages, usePolling, useAutoScroll)
│   ├── lib/
│   │   ├── api.ts          (API client — one function per endpoint)
│   │   └── auth.ts         (token storage, session restore)
│   ├── types/               (User, Message, Conversation — both shapes)
│   └── styles/               (Tailwind globals, design tokens)
├── public/                   (static assets)
├── docs/
│   ├── API.md                (API reference — source of truth)
│   ├── API_STANDARDS.md      (checklist used to build API.md)
│   └── DEVELOPMENT.md        (Part 3 write-up)
├── README.md                 (setup & info)
└── CLAUDE.md                 (this file)
```

---

## Tech Stack

**Core**
- **Framework:** Next.js 14 + React 18 (Pages Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, with a small custom design-token layer (color/type scale) rather than defaults, so the UI doesn't read as generic Tailwind
- **HTTP Client:** Fetch API, wrapped in `lib/api.ts`
- **State Management:** React Context API (auth + active conversation), local component state elsewhere — no need for Redux/Zustand at this scale
- **Real-time:** Socket.io (confirmed working against the live server — connect at the root origin with the auth token, no join call needed, listen for `message:new` and `conversation:updated`). Polling is the fallback if the socket connection fails, not the primary path.

**UI & motion (for the "award-winning" bar, mainly Part 2, and polish throughout Part 1)**
- **shadcn/ui (Radix primitives)** — accessible dialog/dropdown/input/avatar base components, styled to the custom design tokens rather than left default. Saves time on a11y/keyboard handling so effort goes into the custom look instead of rebuilding basics.
- **Framer Motion** — component-level motion inside the app: message bubbles entering, conversation list reordering, modal/panel transitions. Chosen over GSAP for in-React work because it's declarative and plays well with component mount/unmount, which is most of what the chat UI needs.
- **GSAP + ScrollTrigger** — landing page only: hero entrance, scroll-driven storytelling, pinned sections. This is where GSAP's timeline control actually earns its extra weight over Framer Motion.
- **Lenis** — smooth-scroll on the landing page, to make GSAP's scroll-triggered work feel deliberate rather than jumpy on trackpads/wheels.
- **lucide-react** — icon set matching the shadcn ecosystem.
- **clsx / tailwind-merge** — conditional class composition.

Keep the animation libraries scoped as above rather than using GSAP everywhere — mixing GSAP and Framer Motion on the *same* elements causes fights over transforms. GSAP owns the landing page; Framer Motion owns in-app component transitions.

- **Deployment:** Vercel

---

## Design Direction (mainly Part 2, but sets the visual language for Part 1 too)

Goal: modern, confident, a little unexpected — not a generic SaaS-template landing page. Concretely:
- Pick one deliberate color story (not default Tailwind slate/blue) and a distinctive type pairing (a display face for headlines, a clean grotesk for body) — this alone is most of what separates "generic" from "designed."
- Scroll-driven reveals on the landing page (GSAP ScrollTrigger) rather than everything fading in on load — but keep motion purposeful; don't animate for its own sake, and always provide a static/reduced-motion fallback (`prefers-reduced-motion`).
- The chat panel itself should feel alive without being distracting: message send/receive should have a small, fast motion cue (Framer Motion), not a slow flourish — this is the part under closest evaluation, so restraint matters more than spectacle here.
- Dark mode is a reasonable differentiator for a chat product if time allows; treat it as a stretch, not a requirement.

### Design Tokens (decided — read this instead of re-deriving from screenshots)

The color story and radius scale below are final decisions, wired into `tailwind.config.ts` and the base `ui/` components. Any new screen should consume these tokens rather than raw Tailwind colors (`bg-indigo-600`, `text-amber-300`, etc.) so the look stays consistent and one palette change updates everything.

| Token | Value | Tailwind class | Where it lives |
|---|---|---|---|
| `primary` | `#5347ac` (deep purple) | `bg-primary` / `text-primary` | Buttons, focus rings, links, brand mark |
| `primary-hover` | `#483a99` | `hover:bg-primary-hover` | Button hover state |
| `primary-active` | `#3f2f8b` | `active:bg-primary-active` | Button active state |
| `primary-foreground` | `#ffffff` | `text-primary-foreground` | Text/icons on a primary-filled surface |
| `accent` | `#fcd34d` (amber) | `text-accent` / `bg-accent` | Single highlight accent — used sparingly (e.g. one word in a headline, one feature icon) |
| `secondary` | `#64748b` (slate) | `text-secondary` | Muted/secondary text where gray-500 isn't specific enough |

- **Radius:** `rounded-xl` is the standard corner radius for interactive surfaces — inputs, buttons, cards, avatars use `rounded-full`. Don't mix in `rounded-md`/`rounded-lg` for the same class of element.
- **Hero photo treatment:** cover image + `bg-gradient-to-br from-violet-600/70 via-indigo-900/75 to-black/90` plus a second `bg-gradient-to-t from-black/70 via-black/10 to-transparent` pass for bottom legibility. Implemented once in [src/components/auth/login-hero.tsx](src/components/auth/login-hero.tsx) — reuse this exact recipe for the Part 2 landing page rather than inventing a new overlay.
- **Typography:** Inter (already the `sans` stack). Headlines are `font-extrabold`; body copy stays regular weight in gray-500/600.
- **Avatars:** always use `ui/avatar.tsx` (`Avatar`/`AvatarImage`/`AvatarFallback`, Radix-based) — never hand-roll a circular `div` with initials.
- **Component reuse convention:** page files should stay thin composition (layout + data), with actual UI broken into `components/ui/*` (generic, reusable anywhere) or `components/<feature>/*` (feature-specific, e.g. `components/auth/*`). See `LoginHero` / `LoginForm` / `CommunityAvatars` / `FeatureCard` / `Logo` for the pattern to follow on later screens (chat, landing).

---

## UI Reference — Layout Blueprint (structure only, not colors)

The user supplied WhatsApp-style reference screenshots (desktop 3-pane + mobile single-pane) to follow **structurally**. Do not copy its purple/blue palette — apply our own [Design Tokens](#design-tokens-decided--read-this-instead-of-re-deriving-from-screenshots) (indigo primary, amber accent) on top of this layout. Wait for explicit go-ahead before implementing each screen; this section just records the reference so it isn't re-derived later.

**Desktop layout (3-pane, ~1900px reference width):**
- **Left sidebar (~370px fixed width):**
  - Header row: app logo + name ("Messages"), plus icon-button cluster top-right (contacts/people icon, theme toggle moon icon).
  - Search bar below header: pill-shaped, full-width, placeholder "Search or start new chat".
  - Horizontal "stories"-style avatar row: circular avatars with a colored ring (own avatar labeled "Me" first, then recent contacts) — a quick-access strip above the conversation list, not present in a plain chat app but part of what to replicate.
  - "CHATS" section label with a `+` icon (new chat) at the right.
  - Conversation list rows: avatar (with online-status green dot badge), name (bold), preview line (last message text, or media-type label like "📷 Photo", or "No messages yet" for empty), right-aligned metadata (relative timestamp, unread-count pill badge in primary color, mute icon when muted).
  - Active/selected row gets a highlighted background + left accent border bar.
  - Bottom-pinned own-profile row: own avatar, name, presence text ("Connected"), logout/switch icon on the right — persistent account footer, not scrolled with the list.
- **Center pane (message thread):**
  - Header: contact/group avatar, name, presence line ("Online" in accent-green, or "Last seen recently"), right-aligned action icons (call, video call, info/details toggle).
  - Optional pinned-message banner directly under the header (pin icon + preview text + "View" link) when a message is pinned.
  - Date divider ("Today") centered with horizontal rule on both sides.
  - Message bubbles: incoming left-aligned with sender avatar beside the bubble (white/light bubble), outgoing right-aligned in primary color, no avatar; timestamps small and muted under/inside each bubble; read-receipt checkmarks on own messages.
  - Rich message content renders inline in bubbles: images (rounded corners, sized to bubble), voice notes (play button + waveform + duration), reactions as a small pill overlapping the bubble corner (emoji + count).
  - Typing indicator: small animated three-dot bubble with the other person's avatar, appears where their next message would go.
  - Composer bar (bottom, pinned): mic icon, image/attachment icon, pill-shaped text input with placeholder hint ("Aa  (Enter to send, Shift+Enter for new line)"), emoji icon, and a send button that's a filled circle arrow (appears once there's text) or a thumbs-up quick-react when the field is empty.
- **Right panel (Chat Details, toggled via the info icon — not always visible):**
  - Large centered avatar + name + handle at top.
  - Quick-action icon row (Profile, Mute, Search) directly under the identity block.
  - Collapsible sections with chevron-expand headers: "Chat info" (pinned messages count), "Customize chat" (change theme, change emoji, edit nickname), "Media, files and links" (Media/Files/Links rows each with a count badge and `>` chevron).
  - Drilling into "Media" swaps the panel content to a photo grid with a back-chevron + breadcrumb header ("← Media"), not a new overlay.

**Mobile layout (single pane, stack navigation):**
- Chat list is its own full-screen view (same header/search/story-row/list structure as desktop's sidebar, plus a bottom tab bar: Chats / Contacts / Calls / Settings).
- Tapping a conversation pushes a full-screen thread view with a back-chevron in the header (replacing the sidebar, not overlaying it) — same header/bubble/composer structure as desktop's center pane, just full-width.
- No persistent right panel on mobile; details would need to be a pushed screen or bottom sheet if built.

**Key structural takeaways to carry into Compass Chat's actual data model:**
- The story-style avatar row and right-side "Customize chat"/reactions/voice-notes features are chat-app flavor from the reference product, not part of Compass Chat's assignment scope (no reactions/voice notes/pins in our API) — borrow the *layout skeleton* (3-pane desktop, stack-nav mobile, sidebar structure, bubble/composer arrangement) rather than every feature shown.
- Our unread-badge, presence text, and "No messages yet" empty state map directly to real API states (`lastMessage: {}`, socket presence if added, etc.) — those pieces should be built for real, not just visually copied.
- Direct vs. group conversation header differences (single participant with presence vs. group name with member context) should follow this reference's header pattern but branch on our `participant` vs. `participants` shape per the [Conversation models](#key-api-models) above.

---

## Bonus Ideas (to consider, not committed)

Per the assignment, the bonus only counts if genuinely original — so pick one, execute it well, rather than doing several shallowly.

**Part 1 candidates:**
- Optimistic message send with a distinct "sending → sent → failed, tap to retry" state, rather than just a spinner.
- Smart merge on poll: if the same conversation is open across two tabs, avoid visible duplicate/flicker when both are polling.
- Graceful handling of the direct-conversation `participant` vs. group `participants` shape difference surfaced as a genuine UI decision (e.g., how a direct chat's header renders vs. a group's), not just a type-level fix.

**Part 2 candidates:**
- A live, interactive embedded preview of the actual chat component on the landing page (not a screenshot/video) — real, own-original, and directly tied to what was built in Part 1.
- A scroll-driven sequence that demonstrates the auto-scroll/real-time behavior narratively (e.g., messages appearing as the user scrolls, mirroring the actual product behavior) rather than a generic feature-icon grid.

---

## Suggested Claude Code Skills for This Project

| Skill | When to use it here |
|---|---|
| `design` | Before writing Part 2's landing page (or any non-trivial screen), sketch it as a design canvas artifact first — faster to iterate on layout/typography/color visually than in code, and it can be handed off for manual tweaking. |
| `animate` | When implementing any specific animation (the GSAP hero sequence, a Framer Motion message transition) — it works through purpose/tool/curve/duration/exit deliberately instead of guessing at animation code. |
| `run` | After each meaningful feature (login, sending a message, real-time updates, the landing page), actually launch the app and click through it before calling it done — type-checking isn't feature verification. |
| `code-review` | Once Part 1's chat panel is functionally complete, before moving to Part 2 — catch correctness bugs and reuse/efficiency issues while the diff is still small enough to review well. |
| `simplify` | Pass over the API client / hooks layer once the chat panel works, to cut duplication before Part 2 adds more surface area. |
| `security-review` | Once before final submission — check token handling, XSS exposure in message rendering (user-supplied text), and anything else touching auth. |

Not needed for this project: `dataviz` (no charts), `keybindings-help`/`update-config` (not relevant to building the app itself).

---

## Part 1 Checklist
- [x] API documentation written and verified against the live API ([docs/API.md](docs/API.md))
- [x] Login page (phone + name)
- [x] User search
- [x] Start direct conversation
- [x] Create group conversation
- [x] Message list with timestamps
- [x] Send messages (empty check)
- [x] Real-time message updates
- [x] Loading/empty/error states
- [x] Auto-scroll behavior
- [x] One deliberate bonus touch (optimistic send with sending/failed states — tap-to-retry still open, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#what-id-improve-with-more-time))
- [ ] Deploy to live URL

---

## Part 2 Checklist
- [x] Design landing page (consider sketching with the `design` skill first)
- [x] Responsive layout
- [x] Deliberate typography & color palette (not default Tailwind theme)
- [x] Showcase the actual Part 1 feature, not generic marketing sections
- [x] GSAP/Framer Motion animation pass
- [x] One deliberate bonus touch — live, interactive embed of the real chat components in the hero (see [Bonus Ideas](#bonus-ideas-to-consider))
- [ ] Deploy to live URL

---

## Part 3 Checklist
- [x] Architecture/library choices explained, with trade-offs ([docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#architecture--trade-offs))
- [x] Design reasoning for Part 2 ([docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#design-reasoning-part-2))
- [x] AI tool usage documented — what was used for, what was changed/rejected ([docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#ai-tool-usage))
- [x] Improvements noted ([docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#what-id-improve-with-more-time))
- [x] API issues/quirks section ([docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#api-issues-encountered))

---

## Auth Flow
1. User enters phone + name
2. POST `/auth/login`
3. Store `token` in localStorage
4. Use token in `Authorization: Bearer {token}` for all requests
5. On refresh: GET `/auth/me` to restore session; a 400/`NO_TOKEN` or any failure here means "not logged in," not necessarily "server error"

---

## Message Flow (Real-time)

**Primary approach: Socket.io** (confirmed working, though undocumented in the Swagger listing):
1. Connect to the root origin with the auth token in the handshake — no join/subscribe call needed
2. User sends message via `POST /messages` (not a socket emit — sending is REST-only, confirmed)
3. Other participants' sockets receive `message:new` — note the payload uses `id` (not `_id`) and an epoch-millisecond `createdAt`, unlike REST responses
4. Append to list; auto-scroll only if the user hasn't scrolled up
5. Listen for `conversation:updated` to catch group renames/membership changes live

**Fallback: polling**, if the socket connection can't be established:
1. Poll `GET /conversations/{id}/messages` on a 1–2 second interval for the open conversation
2. Merge new messages by `_id` (not timestamp — timestamps aren't guaranteed unique) to avoid duplicates
3. Poll `GET /conversations` on a longer interval to catch new conversations / updated previews

---

## Quick Start Notes
- All API responses are JSON; errors consistently use `{error: {message, code}}` (see docs/API.md's Error Handling section)
- Pagination exists on the messages endpoint (`limit`/`before`/`hasMore`) — do use it, don't assume the API is pagination-free
- No rate limiting observed
- CORS is open (`access-control-allow-origin: *`)
- `/health` is a documented no-op (404) — don't build anything that depends on it
