# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern React-based Todo coaching application built with Vite that combines three productivity modules: Tasks (with priority management), Notes, and Shopping Lists. The app uses a dark theme with professional styling and smooth animations.

## Development Commands

```bash
# Development server (runs on http://localhost:3000)
npm run dev

# Production build
npm run build

# ESLint validation
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

### Core Structure
- **Single Page Application**: All functionality is contained in `src/App.jsx` (~800+ lines)
- **Tab-based Navigation**: Three main modules switchable via `activeTab` state
- **Local Storage Persistence**: Each module persists data independently using different localStorage keys

### Key Design Patterns
- **Monolithic Component**: Main application logic centralized in App.jsx rather than split into feature components  
- **State Co-location**: All state management handled at the App level using React hooks
- **Animation System**: Framer Motion used for smooth transitions and hover effects
- **Utility-First Styling**: Tailwind CSS with custom utility functions

### Component Architecture
```
src/
├── App.jsx              # Main application (all business logic)
├── components/
│   ├── ui/              # Reusable UI components (shadcn/ui style)
│   │   ├── button.jsx   # CVA-based button variants
│   │   ├── input.jsx    # Styled input components
│   │   ├── card.jsx     # Card layout components
│   │   └── ...          # Other UI primitives
│   ├── Header.jsx       # Simple header wrapper
│   └── LogoDevSwiss.jsx # Brand logo component
└── lib/
    └── utils.js         # CN utility for class merging
```

### Data Management Approach
Each module operates independently with separate localStorage keys:
- Tasks: `"todo_coach_v2"` 
- Notes: `"todo_coach_notes_v1"`
- Shopping: `"todo_coach_shopping_v1"`

No external state management library is used - all state is local component state.

### UI System Integration
- **Radix UI**: Provides accessible primitives (Select, Slot)
- **Class Variance Authority (CVA)**: Component variant management
- **Lucide React**: Icon system
- **Framer Motion**: Animation and gesture handling
- **Tailwind + CN utility**: Style composition with conflict resolution

### Technical Patterns
- **NLP-style input parsing**: Simple priority detection from user input (`!` or `#p1` for urgent)
- **Audio feedback**: Custom sound generation using Web Audio API for task completion
- **Responsive design**: Mobile-first approach with breakpoint considerations
- **Animation sequences**: Complex motion patterns for enhanced UX

## Key Business Logic

### Task Management
- Priority system: urgent/normal/low with visual badges
- Smart input parsing for priority detection
- Immediate localStorage persistence
- Audio feedback on completion

### Notes System  
- Title + content structure with optional titles
- Real-time search across title and content
- Edit-in-place functionality
- Timestamp tracking (created/updated)

### Shopping Lists
- Quantity + unit measurement system  
- Category separation (current/future purchases)
- Automatic grouping of identical items
- Smart quantity accumulation

## Path Alias Configuration
The `@` alias points to `./src` directory (configured in vite.config.js).

## Development Considerations
- The main App.jsx component is quite large and could benefit from feature-based component extraction
- All business logic is currently client-side with no backend integration
- The app uses modern React patterns (hooks, functional components) throughout
- Styling relies heavily on Tailwind utility classes with some custom CSS