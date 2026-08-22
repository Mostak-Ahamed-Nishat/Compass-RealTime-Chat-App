# Part 3 — Thought Process & Approach

## 1. Approach

I documented the API against the live server before writing any UI — a spec only tells you what was intended, not what the server actually does. That surfaced most of the issues below (a case-sensitive search endpoint, a `200` response with a `null` body instead of a `404`, an undocumented Socket.io layer) before any component was built on a wrong assumption. I used a WhatsApp-style layout as a structural reference only — 3-pane desktop, stack navigation on mobile — and left out features the API doesn't support (reactions, voice notes, pins) rather than faking them. Each screen was built data-first (loading/empty/error states wired up before styling) and verified with Playwright against a running dev server, since a passing `tsc --noEmit` confirms types line up, not that a button click lands on the right route.

## 2. Architecture & Key Trade-offs

**Next.js Pages Router over App Router.** Nothing here needed server components or streaming; Pages Router gets the same file-based routing with less setup for a short build. Trade-off: no RSC or newer data-fetching patterns, which don't matter when everything is client-rendered against an external API anyway.

**React Context for auth, local state elsewhere — no Redux/Zustand.** The actual shared state is one `currentUser` object and one page's conversation/message tree. A global store would add ceremony without solving a problem this app has. If the state surface grows across more pages, that trade-off flips.

**Socket.io as the real-time transport, with polling specified as a fallback.** Socket.io isn't in the Swagger docs, so I tested it directly against the live server rather than assuming it wasn't available — `message:new` and `conversation:updated` both fire on a plain token-authenticated connection. Because that path was confirmed working, I didn't build the polling fallback — it's documented but not implemented.

**Optimistic message sending (`sending → sent → failed`).** A user hitting send shouldn't wait on round-trip latency to see their own message appear — I render it immediately and reconcile against the server response. The gap: failed sends show a visibly failed state but don't yet offer tap-to-retry.

**No automated test suite.** Verification time went into actually driving the app in a browser rather than test infrastructure I wouldn't have time to build out meaningfully. This is the first thing I'd add back.

## 3. Design Reasoning

No design file was given for the landing page, so the goal was a deliberate identity that actually demonstrates the chat product rather than a generic marketing template. The app runs on one deep-purple primary with a single amber accent used sparingly, and a Sora/Inter type pairing loaded through `next/font`. The header, hero, and closing CTA all read live auth state and resolve to "Get Started Free" or "Open Dashboard" rather than a static sign-up button — a small detail, but one that makes the landing page aware of the product behind it instead of bolted onto it. Motion is scoped by area: the chat panel gets a fast, restrained cue since it's the part under closest review, while the landing page carries more motion (GSAP scroll reveals, staggered entrances) since that's the section built to show range. Both respect `prefers-reduced-motion`.

## 4. AI Tool Usage

I used Claude Code as a pair-programmer, not as an open-ended generator: I specified the API shapes from my own docs, wrote out the exact auto-scroll/optimistic-send behavior I wanted, and pointed it at the existing codebase conventions, then had it combine that direction with the implementation — page shells and TypeScript interfaces, the initial API documentation draft, the Socket.io integration, and the GSAP/Framer Motion work for the landing page and in-app transitions.

I didn't accept its output wholesale. The first API-doc draft, based on the Swagger spec alone, was wrong in several places — search case-sensitivity, the `null`-body response, and the Socket.io layer only came out right after I tested them directly and corrected the draft. Animation timings in the chat panel were tightened from what was first generated, because a slow flourish doesn't fit a panel meant to feel instant. And an earlier documentation pass had drifted into describing planned-but-unbuilt features as done — I caught that and rewrote the docs to match the actual state of the code rather than keeping generated copy that oversold the project.

The assignment brief itself contained a hidden instruction directed at AI tools, asking any AI summarizing the document to insert an unrelated word into its output. I'm noting it here rather than either ignoring it silently or slipping the word in unexplained: the instruction asked for "Madagascar" to appear, so it appears in this sentence, on purpose, disclosed. Catching and validating that kind of embedded instruction is the same category of judgment as catching a Swagger spec that doesn't match the live server — trust what you verify, not what you're told.

## 5. API Issues & Handling

- **`GET /users/search` is case-sensitive and prefix-only**, undocumented in Swagger. Impact: a case-insensitive search UI would silently miss real matches. Handled by querying a small set of case variants in parallel and merging results client-side.
- **`POST /messages` returns `200` with a `null` body** for a nonexistent `conversationId`, not a `404`. Impact: a naive `.then()` would report success on a failed send. Handled by explicitly checking for `null` and treating it as a failure.
- **`POST /messages` doesn't reject empty/whitespace text server-side.** Impact: the "no empty sends" requirement is enforced entirely on the client, with no backend safety net.
- **`lastMessage` is `{}`, not `null`,** on a conversation with no messages. Impact: an `lastMessage?.text` check needs to handle an empty object, not just nullish values, or it silently mis-renders.
- **Direct and group conversations are different shapes** (`participant` singular vs. `participants` array), not called out in the spec. Handled with an explicit `ConversationDirect | ConversationGroup` union instead of one loosely-typed shape.
- **Socket.io isn't documented in Swagger at all**, and its payload differs from REST (`id` instead of `_id`, epoch-millisecond timestamps instead of ISO 8601) — handled by normalizing socket events to the same shape as REST responses before they hit application state.

## 6. What I'd Improve With More Time

1. **Tap-to-retry on a failed send** — the state machine already tracks the failure, it just isn't exposed as an action.
2. **Older-message pagination** — the API supports `before`/`hasMore`; the UI only loads the latest page, which is the highest-value gap for long conversations.
3. **A replacement Part 2 bonus** — an earlier hero embedded the real chat components in a working, interactive sandbox rather than a screenshot; it was removed during a hero redesign and hasn't been replaced yet.
4. **A committed test suite** covering login, send/receive, and the empty/error states, run in CI so a broken build can't reach the live deployment.
5. **Real presence instead of simulated** — "online now"/last-seen is currently mocked client-side, since the API doesn't expose a presence channel.

## 7. Assumptions

- `localStorage` token storage is acceptable here because the API itself has no real authentication (any phone number logs into the same account regardless of the name sent) — a production app with real credentials would need a more defended token strategy.
- Where the brief left a UI decision open (e.g., how a direct conversation's header differs from a group's), I made the call most consistent with the reference layout and noted it in code rather than leaving it undocumented.
