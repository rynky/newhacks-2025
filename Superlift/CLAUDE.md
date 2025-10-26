# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Superlift is a React Native fitness tracking application built with Expo Router. It features workout logging, AI-powered chat assistance via Google Gemini, and analytics for tracking strength progress.

## Development Commands

### Starting the Application
```bash
# Start development server (shows QR code for Expo Go)
npm start
# or
npx expo start

# Platform-specific development
npm run ios          # iOS simulator
npm run android      # Android emulator
npm run web          # Web browser
```

### Backend Server
```bash
# Navigate to server directory and run
cd server
node index.js        # Runs on http://localhost:3000
```

### Linting
```bash
npm run lint
```

## Project Architecture

### Routing Structure
Uses Expo Router with file-based routing:
- Root layout: `app/_layout.tsx` - Configures theme provider and navigation stack
- Tab navigation: `app/(tabs)/_layout.tsx` - Three main tabs (Chat, Analytics, Workout)
- Screens:
  - `app/(tabs)/index.tsx` - Chat interface with AI chatbot (placeholder)
  - `app/(tabs)/analytics.tsx` - Strength score display with chart placeholder
  - `app/(tabs)/workout.tsx` - Workout routines, displays past workouts from mock data
  - `app/modal.tsx` - Modal screen example

### Theming System
The app currently forces light mode (see `constants/styles.tsx:8`).

Theme configuration split across two files:
- `constants/theme.ts` - Color definitions for light/dark modes and font configurations
- `constants/styles.tsx` - `useAppStyles()` hook that returns StyleSheet with theme-aware styles

Custom fonts configured in `app.json`:
- **archivoblack.ttf** - Used for mono/display text (titles, headings)
- **inter.ttf** - Used for sans-serif body text

### Components
Standard themed components in `components/`:
- `ThemedView` and `ThemedText` - Theme-aware base components
- `ParallaxScrollView` - Animated scroll container
- `HapticTab` - Tab bar with haptic feedback
- `IconSymbol` - Cross-platform icon wrapper (iOS symbols via SF Symbols, fallback for Android/web)

### Backend Integration
- Express server in `server/index.js` - Basic CORS-enabled API
- Google Gemini AI integration in `server/common/gemini.js` - Uses `@google/genai` package
- API key stored in `.env` file as `GEMINI_API_KEY`
- Frontend connects to backend via axios (see `app/(tabs)/workout.tsx:14`)

### Data Models
Mock workout data in `constants/mockWorkouts.tsx`:
```typescript
interface Workout {
  id: string;
  name: string;
  duration: string;
  date: string;
  exercises: Exercise[];
}

interface Exercise {
  name: string;
  sets: Set[];
}

interface Set {
  setOrder: number;
  weight: number;
  reps: number;
}
```

## Configuration

### TypeScript
- Strict mode enabled
- Path alias: `@/*` maps to project root
- Extends `expo/tsconfig.base`

### Expo
- Typed routes enabled (`experiments.typedRoutes: true`)
- React Compiler enabled (`experiments.reactCompiler: true`)
- Custom splash screen configured for light/dark modes

### Environment Variables
Create `.env` file in project root:
```
GEMINI_API_KEY=your_api_key_here
```

## Key Dependencies
- **Expo SDK ~54** - React Native framework
- **@google/genai** - Google Gemini AI integration
- **axios** - HTTP client for API calls
- **expo-router** - File-based routing
- **react-native-reanimated** - Animations
