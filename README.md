# Compass Chat

A real-time chat application built with React/Next.js. Connect with people one-to-one or in groups with instant messaging, seamless navigation, and an intuitive interface.

## Live Demo

- **Chat Application:** [Coming Soon]
- **Landing Page:** [Coming Soon]

## Overview

Compass Chat is a take-home assignment project featuring:
- Real-time messaging (direct & group conversations)
- User search and discovery
- Group management (create, add/remove members, admin controls)
- Clean, responsive UI
- Secure authentication via phone number

## Tech Stack

- **Frontend:** React 18 + Next.js 14
- **Styling:** Tailwind CSS
- **HTTP Client:** Fetch API
- **State Management:** React Context API
- **Real-time:** Socket.io WebSocket
- **Deployment:** Vercel

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern browser with ES6+ support

## Project Structure

```
compass-chat/
├── src/
│   ├── pages/              # Next.js pages
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── lib/
│   │   ├── api.ts          # API client
│   │   └── auth.ts         # Auth utilities
│   ├── types/              # TypeScript types
│   └── styles/             # CSS modules
├── public/                 # Static assets
├── docs/
│   ├── API.md              # API reference
│   └── DEVELOPMENT.md      # Development notes & thought process
├── README.md               # This file
├── CLAUDE.md               # Internal reference
└── package.json
```

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/[username]/compass-chat.git
cd compass-chat

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Build

```bash
# Create production build
npm run build

# Start production server
npm run start
```

## Features

### Authentication
- ✅ Login/Register with phone number
- ✅ Session persistence
- ✅ Secure token-based auth

### Conversations
- ✅ Direct messaging (1-on-1)
- ✅ Group conversations (3+)
- ✅ Full message history
- ✅ Real-time message updates

### User Discovery
- ✅ Search users by name or phone
- ✅ User profiles
- ✅ Quick user selection

### Group Management
- ✅ Create groups
- ✅ Add/remove members
- ✅ Promote admins
- ✅ Rename groups
- ✅ Leave groups

### User Experience
- ✅ Loading states
- ✅ Empty states
- ✅ Error handling
- ✅ Auto-scroll to latest message
- ✅ Smart scroll behavior (respects user scroll position)
- ✅ Responsive design (mobile-first)

## API Documentation

See [docs/API.md](docs/API.md) for complete API reference.

**Base URL:** `https://frontend-task-chatapp.onrender.com/api`

Key endpoints:
- `POST /auth/login` — Login/register
- `GET /auth/me` — Current user
- `GET /users/search` — Search users
- `GET /conversations` — List conversations
- `POST /conversations` — Start direct chat
- `POST /conversations/group` — Create group
- `POST /messages` — Send message

## Development Notes

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for:
- Architecture decisions
- Design choices
- AI tool usage
- Known issues
- Future improvements

## Key Features Implementation

### Real-time Updates
Messages are fetched via polling at 1-2 second intervals. A WebSocket implementation can replace this for better scalability.

### Auto-scroll Behavior
- Automatically scrolls to the latest message
- Does NOT force-scroll if user has scrolled up to read history
- Smart detection of user intent

### Empty & Error States
- Empty conversation list
- No messages in conversation
- Network errors
- Invalid operations

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to configure
```

### Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=https://frontend-task-chatapp.onrender.com/api
```

## Testing

Currently no automated tests. TODO: Add Jest + React Testing Library

```bash
npm run test
```

## Contributing

This is a take-home assignment. Not accepting contributions at this time.

## License

MIT License - See LICENSE file for details

## Known Issues

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for known issues and workarounds.

## What's Next

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md#future-improvements) for planned enhancements:
- [ ] Message search
- [ ] Message reactions
- [ ] Typing indicators
- [ ] Message read receipts
- [ ] User presence (online/offline status)
- [ ] File sharing

## Support

For questions about this assignment, refer to [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

---

**Assignment Deadline:** August 22, 2026 4:00 PM  
**Part 1 Focus:** Chat panel (message list, sending, real-time)  
**Part 2 Focus:** Creative landing page  
**Part 3:** Thought process documentation
