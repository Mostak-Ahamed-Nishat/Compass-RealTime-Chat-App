# Compass Chat - Project TODO & Progress

**Deadline:** Aug 22, 2026 4:00 PM  
**Status:** In Progress

---

## Part 1: API Documentation & Feature Implementation

### API Documentation
- [x] Document API endpoints (docs/API.md)
- [x] Create quick reference guide (docs/RoughAPIDoc.md)
- [ ] Verify all quirks/edge cases are documented

### Core Features
- [ ] **Login Page**
  - [ ] Phone number input
  - [ ] Name input
  - [ ] Submit handler (POST /auth/login)
  - [ ] Token storage in localStorage
  - [ ] Session restore (GET /auth/me on load)
  - [ ] Error handling and display
  - [ ] Loading state

- [ ] **User Search**
  - [ ] Search input component
  - [ ] GET /users/search integration
  - [ ] Display search results
  - [ ] Filter self from results
  - [ ] Loading/empty/error states

- [ ] **Start Direct Conversation**
  - [ ] Select user from search results
  - [ ] POST /conversations (direct)
  - [ ] Navigate to conversation
  - [ ] Error handling (user doesn't exist, etc.)

- [ ] **Create Group Conversation**
  - [ ] Group creation modal/form
  - [ ] Multi-select participant picker
  - [ ] Validate minimum 2 participants (3 with creator)
  - [ ] POST /conversations/group
  - [ ] Navigate to new group
  - [ ] Error handling

- [ ] **Conversation List**
  - [ ] GET /conversations on mount
  - [ ] Display direct conversations (with `participant`)
  - [ ] Display group conversations (with `participants`)
  - [ ] Show last message preview
  - [ ] Sort by updated time (newest first)
  - [ ] Handle empty state
  - [ ] Handle loading state
  - [ ] Real-time updates (socket: conversation:updated)
  - [ ] Reorder on conversation:updated event

- [ ] **Message List**
  - [ ] GET /conversations/{id}/messages
  - [ ] Display messages with sender info (resolve from participant list)
  - [ ] Display timestamps
  - [ ] Distinguish sender vs receiver visually
  - [ ] Pagination (load older messages with `before` cursor)
  - [ ] Handle empty state (no messages)
  - [ ] Handle loading state
  - [ ] Display sender name from conversation participants

- [ ] **Send Messages**
  - [ ] Message input component
  - [ ] Empty text validation (client-side)
  - [ ] Whitespace trimming
  - [ ] POST /messages
  - [ ] Handle null response (invalid conversation)
  - [ ] Clear input on success
  - [ ] Loading state during send
  - [ ] Error handling and display

- [ ] **Real-time Updates**
  - [ ] Socket.io connection setup
  - [ ] Pass token in handshake auth
  - [ ] Listen for message:new events
  - [ ] Append new messages to list
  - [ ] Handle message:new payload shape (uses `id`, epoch milliseconds)
  - [ ] Fallback to polling if socket fails
  - [ ] Polling interval: 1-2 seconds for messages
  - [ ] Merge new messages by `_id` (not timestamp)
  - [ ] Dedup messages

- [ ] **Auto-scroll Behavior**
  - [ ] Scroll to bottom on initial load
  - [ ] Scroll to bottom on new message received
  - [ ] Detect user scroll position
  - [ ] Don't force scroll if user scrolled up
  - [ ] Smooth scroll animation

### Code Quality
- [ ] TypeScript types for all API models
- [ ] Organize components logically (src/components/chat/*)
- [ ] Create reusable hooks (useConversations, useMessages, usePolling, useAutoScroll)
- [ ] API client wrapper (src/lib/api.ts)
- [ ] Auth utility (src/lib/auth.ts)
- [ ] Error boundaries and error handling
- [ ] Loading skeletons/spinners
- [ ] Responsive design (mobile-first)
- [ ] Accessibility (keyboard navigation, ARIA labels)

### Design & Polish
- [ ] Custom design tokens (not default Tailwind)
- [ ] Consistent typography scale
- [ ] Deliberate color palette
- [ ] Message animations (Framer Motion)
- [ ] Smooth transitions
- [ ] Dark mode (stretch goal)

### Deployment
- [ ] Deploy to Vercel
- [ ] Verify environment variables
- [ ] Test live endpoints
- [ ] Create deployment URL
- [ ] Test on mobile

### Bonus Feature (Original)
- [ ] Implement one genuinely original touch:
  - [ ] Optimistic message send with retry state
  - [ ] Smart merge for multi-tab polling
  - [ ] Graceful direct/group participant shape handling
  - [ ] *Or other original idea*

---

## Part 2: Creative Landing Page

### Design & Layout
- [ ] Create design mockup (use `design` skill)
- [ ] Define color palette (not default Tailwind)
- [ ] Choose typography pairing (display + body fonts)
- [ ] Sketch responsive layout
- [ ] Plan animations (GSAP for scroll-driven, Framer Motion for component transitions)

### Build Landing Page
- [ ] Hero section
  - [ ] Headline & subheading
  - [ ] CTA button
  - [ ] Hero image/animation
  - [ ] GSAP entrance animation

- [ ] Feature Sections
  - [ ] Showcase actual chat component (live embed or demo)
  - [ ] Real-time messaging feature
  - [ ] Group conversations feature
  - [ ] Auto-scroll & user-friendly behavior
  - [ ] Each with scroll-driven reveal (ScrollTrigger)

- [ ] Call-to-Action Section
  - [ ] Main CTA button
  - [ ] Link to Part 1 demo
  - [ ] Contact/submission info

### Code Quality
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Performance optimized
- [ ] GSAP + Lenis smooth scroll
- [ ] Framer Motion transitions
- [ ] Prefers-reduced-motion fallback
- [ ] Clean component structure

### Deployment
- [ ] Deploy to Vercel
- [ ] Create deployment URL
- [ ] Test responsive on all devices
- [ ] Performance audit

### Bonus Feature (Original)
- [ ] Implement one genuinely original touch:
  - [ ] Live interactive chat preview embedded on landing page
  - [ ] Scroll-driven narrative demonstrating real-time behavior
  - [ ] *Or other original idea*

---

## Part 3: Thought Process Write-up

### Documentation
- [ ] Architecture decisions & trade-offs
  - [ ] React Context vs. other state management
  - [ ] Socket.io vs. polling approach
  - [ ] Component structure reasoning
  
- [ ] Design reasoning (Part 2)
  - [ ] Color palette choice
  - [ ] Typography selection
  - [ ] Animation decisions
  - [ ] Layout/UX reasoning

- [ ] AI Tool Usage
  - [ ] Which tools used (Claude, etc.)
  - [ ] What used for (boilerplate, debugging, docs, research)
  - [ ] What changed/rejected vs. kept
  - [ ] What wrote yourself

- [ ] API Issues Encountered
  - [ ] Document any quirks/inconsistencies
  - [ ] How handled/worked around them
  - [ ] Note if none encountered

- [ ] Improvements for More Time
  - [ ] Performance optimizations
  - [ ] Additional features
  - [ ] Better error states
  - [ ] Enhanced animations
  - [ ] Testing coverage

### Final Deliverables
- [ ] README with setup instructions
- [ ] Tech stack documentation
- [ ] Part 3 write-up in DEVELOPMENT.md
- [ ] All three parts in one document or linked

---

## Submission Checklist

- [ ] GitHub repository (public or private with access)
- [ ] README.md with setup/run instructions
- [ ] README includes tech stack
- [ ] README includes Part 3 write-up
- [ ] Part 1 live demo URL (Vercel/Netlify)
- [ ] Part 2 landing page live URL (Vercel/Netlify)
- [ ] Both demo links working and tested
- [ ] Code is clean and production-ready
- [ ] All environment variables documented
- [ ] .env.development and .env.production in repo
- [ ] .gitignore excludes sensitive files

---

## Notes

- **Time Budget:** 24 hours until Aug 22, 2026 4:00 PM
- **Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, GSAP, Socket.io
- **Bonus Mindset:** Focus on 1 original touch per part, executed well (not multiple shallow additions)
- **Where to Focus:** Chat panel is most scrutinized — message list, sending, real-time behavior
- **API Base:** https://frontend-task-chatapp.onrender.com/api
- **Reference:** See docs/API.md for full API details and quirks
