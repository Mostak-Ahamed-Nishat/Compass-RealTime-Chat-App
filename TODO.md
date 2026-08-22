# Compass Chat — TODO

**Deadline:** Aug 22, 2026 4:00 PM
**Status:** Feature-complete and deployed. Nothing blocking submission.

This file tracks concrete, actionable items. For narrative reasoning behind what's done and what's deliberately deferred, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md); for a status overview see [PROGRESS.md](PROGRESS.md).

**Live:** [compass-chat-app.vercel.app](https://compass-chat-app.vercel.app/)

---

## Submission-blocking (none open)

- [x] Deploy to Vercel and get a live URL for the app (`/`, `/login`, `/chat`)
- [x] Add that URL to [README.md](README.md)'s Live Demo table (the same deployment serves both Part 1 and Part 2 — see the README note on why)
- [x] Smoke-test the deployed URL: landing page renders, login on production redirects to `/chat`, dashboard loads with the logged-in user's name — verified end-to-end, not just that the routes respond

## Part 1 — implementation

- [x] Login (phone + name, auto-register, session restore via `GET /auth/me`)
- [x] User search (name/phone, 2-char minimum, case-variant workaround for the API's case-sensitive prefix search)
- [x] Start a direct conversation
- [x] Create a group conversation
- [x] Add/remove group members, rename group
- [ ] Promote member to admin in the group details menu (the API client call already exists in `lib/api.ts`)
- [x] Message list with timestamps, sender/receiver visually distinguished
- [x] Send messages, empty/whitespace-only blocked client-side
- [x] Optimistic send (sending → sent → failed states)
- [ ] Tap-to-retry on a failed send (intended as the Part 1 bonus touch)
- [x] Real-time delivery via Socket.io (`message:new`, `conversation:updated`)
- [x] Typing indicator (best-effort — not a documented event)
- [x] Auto-scroll that doesn't force-scroll a user reading history
- [x] Loading / empty / error states throughout
- [ ] Older-message pagination (`before` cursor — API supports it, UI doesn't use it yet)
- [x] Responsive, mobile-first layout

## Part 2 — landing page

- [x] Original color palette + type pairing (Inter/Sora), not a template
- [x] Hero, features, how-it-works, social proof, closing CTA sections
- [x] GSAP + ScrollTrigger + Lenis scroll choreography; Framer Motion for in-app transitions
- [x] `prefers-reduced-motion` fallback
- [x] Responsive at mobile and desktop widths
- [x] Bonus: live, interactive embed of the real chat components in the hero

## Part 3 — write-up

- [x] Architecture/library trade-offs
- [x] Part 2 design reasoning
- [x] AI tool usage — what for, what changed/rejected
- [x] Improvements with more time
- [x] API quirks encountered
- [x] README with setup instructions and tech stack

## Nice-to-have if time remains (not blocking)

- [ ] Automated test suite (formalize the manual Playwright verification into a checked-in suite)
- [ ] Real presence instead of the current client-side-simulated online/last-seen status
- [ ] Dark mode (called out as a stretch goal in the design direction)
- [ ] Accessibility pass beyond what Radix provides by default
- [ ] Virtualized message list for very long conversation histories

---

## Submission checklist

- [x] GitHub repository pushed and current
- [x] README with setup/run instructions, tech stack, Part 3 write-up link
- [ ] Part 1 live demo URL
- [ ] Part 2 landing page live URL (same deployment)
- [ ] Both links tested before sending
- [x] `.env.development` / `.env.production` present, `.env.local` gitignored
