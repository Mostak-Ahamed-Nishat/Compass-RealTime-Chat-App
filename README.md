# Compass Chat

A real-time messaging app built for a frontend take-home assignment — direct and group conversations, live delivery over Socket.io, and a landing page that showcases the chat panel with a working, embedded copy of it rather than a screenshot.

**Repo:** [github.com/Mostak-Ahamed-Nishat/Compass-RealTime-Chat-App](https://github.com/Mostak-Ahamed-Nishat/Compass-RealTime-Chat-App)

## Live Demo

| | URL |
|---|---|
| Landing page (Part 2) | **[compass-chat-app.vercel.app](https://compass-chat-app.vercel.app/)** |
| App (Part 1) | **[compass-chat-app.vercel.app/login](https://compass-chat-app.vercel.app/login)** → sign in with any phone number + name to reach `/chat` |

> Both parts live in the same Next.js app and ship from a single deployment: `/` is the landing page, `/login` is sign-in, `/chat` is the product. There's no password — any new phone number auto-registers.

## Contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Feature status](#feature-status)
- [API documentation](#api-documentation)
- [Part 3 — thought process write-up](#part-3--thought-process-write-up)
- [Known limitations](#known-limitations)

## Overview

Compass Chat lets a user sign in with just a phone number and name (the API auto-registers new numbers — no password), search for people, start direct or group conversations, and message in real time. The chat panel — message list, sending, and live updates — was the part of the assignment called out for the closest review, so it got the most iteration: optimistic sends with retry-on-failure, a scroll position that only auto-follows the conversation when the user hasn't scrolled up to read history, live typing indicators, and Socket.io-driven delivery.

The landing page (`/`) is a separate, from-scratch design pass built to showcase that chat panel — including a live, interactive instance of the real `MessageBubble`/`TypingIndicator` components, not a static screenshot.

## Screenshots & Features

### Desktop Experience
- **3-pane layout** — chat list on the left, conversation thread in the center, optional details panel on the right
- **Direct conversations** with online/offline presence indicators and read receipts (✓ sent, ✓✓ read)
- **Group conversations** with member management and real-time updates
- **Rich message support** — text with emoji picker, message timestamps, and sender avatars
- **Auto-scroll** — follows new messages unless you've scrolled up to read history
- **Real-time delivery** — Socket.io-powered instant message delivery and conversation updates

### Mobile Experience
- **Single-pane stack navigation** — tap a conversation to open the thread, back button to return to chat list
- **Touch-optimized composer** — emoji picker, send button, and message input designed for mobile
- **Responsive UI** — all features work seamlessly on small screens
- **Quick contact row** — favorite/recent contacts as avatar chips for quick access

### Landing Page
- **Modern hero section** — dark theme with floating image cards and interactive mouse-follow spotlight
- **Scroll-driven animations** — GSAP ScrollTrigger reveals and smooth scrolling (Lenis)
- **Live chat embed** — actual working chat component on the landing page, not a screenshot
- **Feature showcase** — real-time messaging, presence, and instant delivery explained through storytelling
- **Fully responsive** — optimized for desktop, tablet, and mobile layouts

### Try It Now
Visit **[compass-chat-app.vercel.app](https://compass-chat-app.vercel.app/)** to see all features in action:
- Landing page: [compass-chat-app.vercel.app](https://compass-chat-app.vercel.app/)
- Chat app: [compass-chat-app.vercel.app/login](https://compass-chat-app.vercel.app/login) (sign in with any phone + name)

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (Pages Router) + React 18 + TypeScript | SSR-capable, file-based routing, mature ecosystem, fast to scaffold under a 24-hour budget |
| Styling | Tailwind CSS + a custom design-token layer (`tailwind.config.ts`) | Deliberate deep-purple/amber palette and `rounded-xl` scale instead of default Tailwind slate/blue, so the UI doesn't read as generic |
| UI primitives | shadcn-style components over Radix (`dialog`, `dropdown-menu`, `avatar`, `scroll-area`, `separator`) | Accessible, keyboard-correct primitives out of the box, styled to the custom tokens |
| Forms | react-hook-form | Login and dialog forms need validation without hand-rolled state plumbing |
| In-app motion | Framer Motion | Message bubbles entering, list reordering, dialog/panel transitions — declarative and plays well with mount/unmount |
| Landing-page motion | GSAP + ScrollTrigger + Lenis | Scroll-driven reveals and a smoothed scroll feed on the landing page only, kept separate from Framer Motion to avoid two libraries fighting over the same transforms |
| Real-time | socket.io-client, with the REST message-history endpoint as the source of truth | Confirmed working against the live API; polling was the planned fallback if the socket handshake failed (see [Architecture & trade-offs](docs/DEVELOPMENT.md#2-architecture--key-trade-offs)) |
| State | React Context (auth + a page-level reducer-ish set of hooks in `chat.tsx`) | The state surface is one auth object and one conversation/message tree — a global store would add ceremony without solving a real problem here |
| Fonts | next/font (Inter for body, Sora for display headlines) | The pairing the design direction called for was scoped but never actually wired up — this closes that gap |

Full rationale and trade-offs (including what was considered and rejected) are in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Getting started

```bash
git clone https://github.com/Mostak-Ahamed-Nishat/Compass-RealTime-Chat-App.git
cd Compass-RealTime-Chat-App
npm install
```

Create `.env.local` (or copy `.env.development`):

```
NEXT_PUBLIC_API_URL=https://frontend-task-chatapp.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://frontend-task-chatapp.onrender.com
```

```bash
npm run dev          # http://localhost:3000
npm run type-check   # tsc --noEmit
npm run build && npm run start   # production build
```

There's no seed data to set up — the API auto-registers whatever phone number you log in with. To try direct/group messaging locally, log in as two different phone numbers in two browser profiles (or one normal + one incognito window).

## Project structure

```
src/
├── pages/
│   ├── index.tsx        # landing page (Part 2)
│   ├── login.tsx        # phone + name sign-in (Part 1)
│   ├── chat.tsx          # the chat dashboard — conversations, messages, real-time (Part 1)
│   └── _app.tsx          # AuthContext + session restore, font loading
├── components/
│   ├── chat/              # Sidebar, ChatHeader, MessageList, MessageBubble, Composer,
│   │                       # ChatDetailsPanel, New Chat/Group/Add-members dialogs, ...
│   ├── auth/               # LoginHero, LoginForm, CommunityAvatars, FeatureCard
│   ├── landing/            # SiteHeader, HeroSection, LiveChatPreview, FeaturesSection,
│   │                        # HowItWorksSection, SocialProofSection, FinalCtaSection
│   └── ui/                  # Button, Input, Avatar, Dialog, DropdownMenu, ConfirmDialog, ...
├── lib/                     # api.ts (one function per endpoint), auth.ts (token storage),
│                            # socket.ts, message.ts (formatting/grouping), utils.ts
├── types/                   # User, Message, ConversationDirect/ConversationGroup
└── styles/globals.css
docs/
├── API.md                   # API reference, verified against the live server
└── DEVELOPMENT.md           # Part 3 write-up — architecture, design reasoning, AI usage, trade-offs
```

## Feature status

### Part 1 — chat application

| Feature | Status |
|---|---|
| Login (phone + name, auto-register) | ✅ |
| Session restore on refresh (`GET /auth/me`) | ✅ |
| User search (name/phone, min 2 characters) | ✅ |
| Start a direct conversation | ✅ |
| Create a group conversation | ✅ |
| Add / remove group members, promote admin (API client), rename group | Add/remove/rename wired into the UI; promote-to-admin exists in `lib/api.ts` but isn't exposed in a menu yet |
| Message list, sender/receiver visually distinguished, timestamps | ✅ |
| Send messages, empty/whitespace-only blocked client-side | ✅ |
| Optimistic send with sending → sent → failed (tap-to-retry planned as the bonus) | ✅ — see [Known limitations](#known-limitations) for the retry-tap gap |
| Real-time delivery (Socket.io: `message:new`, `conversation:updated`) | ✅ |
| Typing indicator | ✅ (best-effort — see [docs/API.md](docs/API.md), `typing` isn't a documented event) |
| Auto-scroll that respects manual scroll-up | ✅ |
| Loading / empty / error states | ✅ |
| Older-message pagination (`before` cursor) | Not wired up — the API supports it, the UI currently only loads the latest page |
| Responsive (mobile stack nav / desktop 3-pane) | ✅ |

### Part 2 — landing page

| Feature | Status |
|---|---|
| Original layout, color story, and type pairing | ✅ |
| Responsive, mobile-first | ✅ |
| Showcases the real Part 1 feature (not a generic template) | ✅ — see the "bonus" row below |
| GSAP/ScrollTrigger + Framer Motion animation pass, `prefers-reduced-motion` fallback | ✅ |
| Bonus: live, interactive embed of the real chat components (not a screenshot) | ✅ |

## API documentation

The full reference — every endpoint, request/response shape, pagination, error format, and every quirk found while testing against the live server — is in **[docs/API.md](docs/API.md)**. It was written before any UI code, as its own deliverable, per the assignment's instructions.

## Part 3 — thought process write-up

The full write-up — approach, architecture and library trade-offs, Part 2 design reasoning, how AI tools were used and what was changed or rejected, what's next with more time, and API issues encountered — lives in **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)**.

## Known limitations

Documented here rather than glossed over, in the spirit of the assignment's "clear, honest reasoning" note:

- **No older-message pagination in the UI.** The API's `before`/`hasMore` cursor is documented and the client is ready to use it, but the message list only ever loads the latest page. Long-running conversations won't load history past that.
- **Promote-to-admin isn't in a menu yet.** `lib/api.ts` has the client call; it isn't wired into `ChatDetailsPanel`.
- **Tap-to-retry on a failed send isn't wired up.** A failed optimistic message renders in a visibly failed state (see `MessageBubble`), but there's no retry action yet — the intended bonus for Part 1.
- **Presence ("Online now" / last-seen) is simulated client-side**, not sourced from the API — the live API doesn't expose a presence event, so it's mocked for visual completeness rather than claimed as real.
- **No automated test suite committed.** The app was verified by hand and with ad hoc Playwright scripts driven against a running dev server during development (see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)), but no `__tests__`/`e2e` directory is part of this submission.
