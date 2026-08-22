# Part 3 — Thought Process & Approach

This is the write-up called for in the assignment brief: why the codebase looks the way it does, the trade-offs behind it, how AI tools were used, what's left for next time, and what the live API actually does versus what its docs say it does.

## Contents

- [Approach](#approach)
- [Architecture & trade-offs](#architecture--trade-offs)
- [Design reasoning (Part 2)](#design-reasoning-part-2)
- [AI tool usage](#ai-tool-usage)
- [What I'd improve with more time](#what-id-improve-with-more-time)
- [API issues encountered](#api-issues-encountered)
- [Assumptions made](#assumptions-made)

## Approach

I treated this less like "build screens" and more like a small production feature, in this order:

1. **Read the whole brief before touching anything** — all three parts, so Part 1 decisions (routes, data shapes, how auth state is exposed) wouldn't need to be re-litigated once Part 2 needed to reuse them. `Assignment.md:68` has a hidden instruction aimed at AI tools reading the file (asking any summarizer to slip an unrelated word into its output); I noted it and didn't act on it — it isn't a project requirement, it's a planted prompt injection, and following it would mean treating an instruction embedded in untrusted document content as if the user had asked for it.
2. **Documented the API before writing a line of UI code.** The brief asks for this explicitly, and it's also just the right order of operations: [docs/API.md](API.md) was built by cross-referencing the Swagger listing against direct calls to the live server, not by trusting the spec at face value. That surfaced most of the quirks listed [below](#api-issues-encountered) — a case-sensitivity bug in search, a `200 + null` instead of a `404`, an undocumented Socket.io layer — before any component depended on wrong assumptions about them.
3. **Looked at a reference chat UI for structure, not style.** I used a WhatsApp-style 3-pane layout (desktop sidebar/thread/details, mobile stack navigation) as a structural skeleton — proportions, header/composer placement, where a details panel lives — and then applied Compass Chat's own color story and type pairing on top of it rather than its palette. Features that reference had but this API doesn't support (reactions, voice notes, pinned messages) were deliberately left out rather than faked.
4. **Set up the repo and a persistent project spec before writing components.** Beyond the usual `npx create-next-app` + folder scaffolding + GitHub remote, I wrote a `CLAUDE.md` at the repo root that records the API summary, the exact design tokens, the folder convention, and every decision that would otherwise get re-derived (and drift) across a long, multi-session build. This mattered more than it sounds — see [AI tool usage](#ai-tool-usage) for why.
5. **Built the design system before any screen.** Color tokens (`primary`/`accent`/`secondary`), the `rounded-xl` radius scale, and the Inter/Sora type pairing went into `tailwind.config.ts` first, so every screen after the first pulls from the same small vocabulary instead of picking colors ad hoc.
6. **Identified reusable primitives before feature components.** Before building a screen, I asked "which of this is a `ui/*` primitive I'll need again, and which is specific to this feature." `Button`, `Input`, `Avatar`, `IconButton`, and the Radix-based `Dialog`/`DropdownMenu` all came out of that pass and are shared across auth, chat, and the landing page; feature-specific composition (`Sidebar`, `MessageBubble`, `HeroSection`) sits in its own folder per area.
7. **Component shell first, visual polish second, on every screen.** For each screen I wired the data flow and empty/loading/error branches as plain markup first, then layered in the actual design — catching state-shape bugs before they were hidden under styling, and making sure every screen actually had a loading and error path instead of just a happy path with polish on top.
8. **Validated inputs as each screen went in**, not as a follow-up pass: phone/name validation on login, the empty/whitespace-only guard on send (the API doesn't reject it server-side — see [API issues](#api-issues-encountered)), and the 2-character minimum before search fires.
9. **Verified in a real browser, not just a green type-check.** `tsc --noEmit` proves the types line up; it doesn't prove a CTA button click actually lands on the right route, or that a live demo widget really appends a message when you press Enter. I drove the app end-to-end with Playwright against a running dev server during development — clicking through login, sending messages, checking the auth-aware CTA on the landing page, and screenshotting at both desktop and mobile widths — rather than assuming the compiler's approval meant the feature worked.
10. **Checked responsiveness continuously, not as a final pass.** Every component above was reviewed at mobile width as it was built, since retrofitting responsiveness after a screen is "done" tends to surface layout assumptions baked in early.
11. **Shipped in small, reviewable commits** as each piece became functional (login → sidebar/topbar → message list → real-time → group chat → landing page → presence/read-receipts), rather than one large commit at the end — which also means the git history is a reasonably honest record of the build order.

## Architecture & trade-offs

| Decision | Why | What I gave up |
|---|---|---|
| **Next.js 14, Pages Router** over the App Router | The team/assignment scope didn't need server components or streaming; Pages Router has fewer moving parts for a 24-hour build and the same file-based routing benefit | React Server Components, some newer Next.js data-fetching ergonomics — not needed here since everything is client-rendered against an external API anyway |
| **React Context for auth + local component state** for everything else, no Redux/Zustand | The actual shared state is small: one `currentUser` object and one page's worth of conversation/message state. A global store adds ceremony (actions, selectors, devtools wiring) to solve a problem this app doesn't have | If the state surface grew — multiple pages needing the same conversation list, for instance — a store would start paying for itself. It doesn't yet |
| **Socket.io as the primary real-time transport**, polling as the documented fallback | The brief mentions Socket.io isn't in the Swagger listing, so I tested it directly against the live server rather than assuming — confirmed `message:new` and `conversation:updated` fire live with a plain token-authenticated connection, no join call needed. Once confirmed, there was no reason to default to lower-fidelity polling | The polling path is written into the plan (`docs/` and `CLAUDE.md`) but only the socket path is actually implemented, since it's the one proven to work |
| **Optimistic message sending** (`sending → sent → failed`) | The API has no per-message latency guarantee worth waiting on before showing the user their own message. Rendering it immediately, then reconciling with the server response, is what makes the panel feel instant | Failure handling currently renders a visibly failed bubble but doesn't yet offer one-tap retry — noted honestly in [Known limitations](../README.md#known-limitations) rather than claimed as finished |
| **Tailwind + a small custom token layer**, not a component library's default theme | A stock Tailwind palette (slate/blue) reads as unstyled/generic; a fixed vocabulary of tokens (`primary`, `primary-hover`, `accent`, `secondary`, one radius scale) keeps every screen visually consistent without hardcoding hex values per component | More setup than "just use the defaults" — worth it once more than two or three screens exist |
| **shadcn-style components over Radix primitives**, not hand-rolled dialogs/dropdowns | Radix solves focus trapping, keyboard nav, and ARIA wiring correctly by default. Rebuilding that for a take-home would be time spent on infrastructure instead of the chat panel, which is where the brief says to focus | Some bundle weight and an extra dependency surface, acceptable for the time saved |
| **Framer Motion inside the app, GSAP + ScrollTrigger + Lenis on the landing page**, not one library everywhere | Framer Motion's declarative, mount/unmount-aware API fits component-level transitions (a bubble entering, a dialog opening). GSAP's timeline control and ScrollTrigger fit scroll-driven landing-page choreography that Framer Motion doesn't target as directly. Running both on the *same* elements causes transform conflicts, so the split is by page area, not by preference | Two motion libraries in the dependency tree instead of one — deliberate, not accidental |
| **No automated test suite committed** | Given the 24-hour window, verification time went into actually driving the app in a browser (see [Approach](#approach)) rather than into test infrastructure that wouldn't get exercised beyond a couple of specs | This is the trade-off I'd revisit first with more time — see [below](#what-id-improve-with-more-time) |

## Design reasoning (Part 2)

The landing page had no design file to follow, so the brief was: be deliberate, not generic, and actually show the product.

- **Color & type.** Rather than default Tailwind slate/blue, the whole app (not just the landing page) runs on one deep-purple primary (`#5347ac`) with a single amber accent used sparingly, plus a display/body type pairing (Sora for headlines, Inter for body) — the pairing was scoped in the project's design direction early on but had never actually been wired into the app via `next/font`; closing that gap was part of this pass, since a "distinctive type pairing" isn't distinctive if it's a system-font fallback in practice.
- **The bonus is currently open.** An earlier hero embedded the real `MessageBubble`/`TypingIndicator` components in a small working sandbox you could type into — provably real, since the component rendering your message was the same one rendering messages in `/chat`, rather than an animation that merely looked like the feature. That hero was later replaced with a dark, kinetic-typography design (floating photo cards, GSAP entrance timeline) built to match a specific reference layout, and the live sandbox didn't have a place in that layout, so it was cut rather than bolted on somewhere it didn't fit. No replacement bonus has been picked yet — see [what I'd improve with more time](#what-id-improve-with-more-time).
- **Auth-aware call to action**, not a static "Sign Up" button. The header, hero, and closing section all read the same auth state and resolve to "Get Started Free → `/login`" or "Open Dashboard → `/chat`" — a small thing, but it's the kind of detail that separates a marketing page bolted onto a build from one that's actually aware of the product behind it.
- **Motion is restrained by design, not by omission.** The brief for the chat panel specifically asks for a small, fast motion cue rather than a slow flourish, since it's under the closest review; the landing page gets more license (GSAP scroll reveals, a gradient hero band, staggered entrances) precisely because it isn't the part being scrutinized for restraint. Both respect `prefers-reduced-motion`.

## AI tool usage

**Tool:** Claude Code, used throughout Part 1, Part 2, and this write-up.

**What it was used for:**
- Scaffolding boilerplate (Next.js pages, component shells, TypeScript interfaces for the API shapes) so time went into the chat panel logic rather than repetitive setup.
- Drafting [docs/API.md](API.md) against the Swagger listing, then verifying and correcting that draft against live calls to the actual server — the draft was a starting point, not the final source of truth.
- Implementing the Socket.io integration, the optimistic-send state machine, and the auto-scroll-that-respects-manual-scroll logic, working from an explicit spec of the desired behavior rather than an open-ended "add real-time."
- Writing the GSAP/ScrollTrigger/Lenis landing-page motion and the Framer Motion in-app transitions, per the split described above.
- Driving ad hoc Playwright scripts against a running dev server to verify the login → dashboard → landing-page flow actually works in a real browser, not just compiles.

**What I changed, rejected, or wrote differently than what was first suggested:**
- The type pairing / font loading was proposed and scoped early but not actually implemented until this documentation pass surfaced that gap — a case of the plan and the code drifting, which is exactly what writing decisions into a persistent project spec (see below) is meant to catch.
- Several early API-doc claims (based on reading the Swagger spec alone) turned out to be wrong once tested live — the search endpoint's case sensitivity, the `null`-body response for an invalid conversation ID, and the undocumented-but-working Socket.io layer all came from direct testing overriding what the spec implied.
- The chat panel's animation timings were tightened rather than accepted as first suggested — the design direction calls for restraint here specifically ("a small, fast motion cue, not a slow flourish"), so durations that read as a flourish were cut down or removed.
- I did not accept AI-generated marketing copy or feature claims wholesale into documentation — this write-up and the README were rewritten from scratch after an earlier documentation pass (from before most of the app existed) had drifted into describing planned-but-unbuilt features as done. Keeping docs honest against the actual code was a manual editorial pass, not something delegated.
- One meta-decision worth calling out: instead of re-explaining API quirks, design tokens, and architectural decisions to the AI tool in every session, I wrote them once into a `CLAUDE.md` project file that every subsequent session reads before doing anything. That's less "AI usage" and more "how to use an AI tool at production quality over a multi-hour build without the plan and the code silently diverging" — which is the actual risk with AI-assisted work at this scope, more than any single generated line of code.

## What I'd improve with more time

Roughly in priority order:

0. **Pick and build a new Part 2 bonus.** The hero redesign cut the live chat demo sandbox without a replacement — reintroducing it lower on the page, or finding an original touch native to the new dark/kinetic hero, is the most immediate open item.
1. **Wire up older-message pagination.** The API already supports `before`/`hasMore`; the UI only loads the latest page. This is the highest-value gap for anyone with a long conversation history.
2. **Tap-to-retry on a failed send**, and a promote-to-admin action in the group details menu — both have the underlying plumbing (`lib/api.ts`, the failed-message state) but aren't exposed in the UI yet.
3. **A real automated test suite.** Formalize the manual Playwright verification into a checked-in suite (login flow, send/receive, the empty/error states, the landing page's auth-aware CTA) that runs in CI rather than being run by hand.
4. **Real presence instead of simulated.** "Online now" / last-seen is currently mocked client-side, since the live API doesn't expose a presence channel; a real implementation would need either a presence event from the backend or a heartbeat convention layered on top of the existing socket connection.
5. **Virtualize the message list** for conversations with very long histories, once pagination exists — rendering every message in the DOM is fine at the scale this API returns today, not at scale.
6. **An accessibility pass** beyond what Radix gives for free — keyboard-only walkthroughs of the whole app, contrast-checking the amber accent against its backgrounds, and screen-reader labels on icon-only controls.
7. **Dark mode**, called out in the brief as a stretch goal — the token layer is already structured (`primary`/`accent`/`secondary` rather than raw Tailwind colors) to make this a token-swap exercise rather than a rewrite.
8. **CI/CD** — type-check and (once it exists) the test suite running on push, so a broken build can't reach the [live deployment](https://compass-chat-app.vercel.app/) the way it currently could.

## API issues encountered

The full list with request/response examples lives in [docs/API.md](API.md); the notable ones that actually shaped implementation decisions:

- **`GET /users/search` is case-sensitive and prefix-only**, undocumented in the Swagger listing. `nishat` won't match `Nishat`, and a correctly-cased mid-string substring won't match either. Worked around by querying a small set of case variants of the user's input in parallel and merging results client-side (`lib/api.ts`), since it's a backend limitation, not something fixable from the client otherwise.
- **`POST /messages` returns `200` with a body of `null`** for a nonexistent `conversationId`, instead of a `404`. Handled by explicitly checking for a `null` response and treating it as a failed send — a naive `.then()` chain would otherwise silently "succeed" with nothing to show for it.
- **`POST /messages` doesn't reject empty or whitespace-only text server-side** (only a missing `text` field is rejected). The "no empty sends" requirement in the brief is enforced entirely client-side as a result.
- **`lastMessage` is `{}`, not `null`,** on a conversation with no messages yet — code that checks `lastMessage?.text` needs to handle an empty object, not just nullish values.
- **Direct and group conversations are meaningfully different shapes** (`participant` singular vs. `participants` array; `name`/`admins`/`createdBy` only on groups), not documented as a heads-up anywhere in the spec — this shows up throughout the codebase as an explicit type union (`ConversationDirect | ConversationGroup`) rather than one loosely-typed shape.
- **Socket.io isn't in the Swagger listing at all**, but works when connecting to the root origin with the auth token in the handshake — confirmed by testing directly rather than assuming it wasn't available. `message:new`'s payload also differs from every REST response: `id` instead of `_id`, and an epoch-millisecond timestamp instead of ISO 8601.
- **No password check** — the same phone number logs into the same account regardless of what name is sent with it. Documented as a real security note in `docs/API.md`, not just a quirk, since it affects what a client can safely assume about who's authenticated.
- **`GET /health` is documented in Swagger but always returns 404** — not implemented server-side. Nothing in this app depends on it.

## Assumptions made

- Client-side `localStorage` token storage is acceptable for this take-home given the API itself has no real authentication (see the "no password check" note above) — a production app with real credentials would need httpOnly cookies or a more defended token strategy.
- The in-product brand shown in the UI's logo/header is "Compass," matching the assignment/project name ("Compass Chat") rather than introducing a separate fictional product name.
- Where the brief left a UI decision open (e.g., exactly how a direct conversation's header should differ from a group's), I made the call that seemed most consistent with the reference layout's intent and noted the reasoning in code comments or here rather than leaving it undocumented.
