# Project Progress Tracker

**Last updated:** Aug 22, 2026
**Deadline:** Aug 22, 2026 4:00 PM

---

## Overall status

| Part | Status | Notes |
|------|--------|-------|
| **Part 1: Implementation** | 🟢 Functionally complete | Login, search, direct + group chat, real-time, states, auto-scroll all built. A few UI-wiring gaps remain — see below |
| **Part 2: Landing Page** | 🟢 Complete | Original design, live interactive chat demo as the bonus, GSAP/Framer motion pass done |
| **Part 3: Write-up** | 🟢 Complete | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |
| **Deployment** | 🟢 Live | [compass-chat-app.vercel.app](https://compass-chat-app.vercel.app/) — verified end-to-end: landing renders, login redirects to `/chat`, dashboard loads correctly |
| **Submission** | 🟢 Ready | Repo, README, write-up, and live links are all in place |

---

## Part 1: implementation

| Feature | Status |
|---------|--------|
| Login (phone + name, auto-register) | ✅ |
| Session restore on refresh | ✅ |
| User search | ✅ |
| Start direct conversation | ✅ |
| Create group conversation | ✅ |
| Add/remove group members, rename group | ✅ |
| Promote member to admin | Client call exists (`lib/api.ts`); not wired into a menu yet |
| Message list with timestamps, sender/receiver distinguished | ✅ |
| Send messages, empty-text blocked client-side | ✅ |
| Optimistic send (sending → sent → failed) | ✅ — tap-to-retry on a failed message not wired up yet |
| Real-time updates (Socket.io) | ✅ |
| Typing indicator | ✅ (best-effort, undocumented event) |
| Auto-scroll that respects manual scroll-up | ✅ |
| Loading/empty/error states | ✅ |
| Older-message pagination (`before` cursor) | Not wired up — API supports it, UI only loads the latest page |
| Responsive design | ✅ |

### Code quality
- ✅ TypeScript types for all API models (`src/types/index.ts`)
- ✅ API client wrapper (`src/lib/api.ts`)
- ✅ Auth utilities (`src/lib/auth.ts`)
- ✅ Component structure organized by feature (`chat/`, `auth/`, `ui/`, `landing/`)
- ✅ Responsive throughout
- ❌ No automated test suite committed (manual + ad hoc Playwright verification only — see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#what-id-improve-with-more-time))
- ❌ No React error boundary

---

## Part 2: landing page

- ✅ Color palette, type pairing (Inter + Sora), and layout are original — not a template
- ✅ Hero, features, how-it-works, social proof, closing CTA sections built
- ✅ GSAP + ScrollTrigger + Lenis for scroll-driven reveals, Framer Motion for in-app transitions
- ✅ Responsive at mobile/desktop widths, `prefers-reduced-motion` respected
- ✅ Bonus: live, interactive embed of the real `MessageBubble`/`TypingIndicator` components in the hero — not a screenshot or a scripted animation only

---

## Part 3: write-up & submission

- ✅ Architecture/library trade-offs documented
- ✅ Part 2 design reasoning documented
- ✅ AI tool usage documented — what for, what was changed/rejected
- ✅ Improvements-with-more-time list
- ✅ API quirks documented (and cross-checked against the actual client code — see [docs/API.md](docs/API.md))
- ✅ README rewritten with setup instructions, tech stack, and feature status
- ✅ Part 1 deployed to a live URL ([compass-chat-app.vercel.app/login](https://compass-chat-app.vercel.app/login))
- ✅ Part 2 deployed to a live URL ([compass-chat-app.vercel.app](https://compass-chat-app.vercel.app/))
- ✅ Both URLs tested and added to README
- ✅ GitHub repo exists and is current

---

## What's actually left before this can be submitted

Nothing blocking — repo, docs, and live links are all in place. Optional polish if time allows, roughly in priority order: tap-to-retry on a failed send, promote-to-admin in the group menu, older-message pagination.

---

## Reference links

- **API Docs (Swagger):** https://frontend-task-chatapp.onrender.com/docs/
- **API base URL:** https://frontend-task-chatapp.onrender.com/api
- **Full API reference:** [docs/API.md](docs/API.md)
- **Assignment brief:** [Assignment.md](Assignment.md)
- **Part 3 write-up:** [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
