# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project Ceiba** is a Next.js 14+ web application showcasing an animated countdown timer and interactive water ripple effects. It's designed as a base template for building visually rich, animation-heavy web experiences.

**Key Technology Stack:**
- **Framework:** Next.js (latest) with React (latest)
- **Styling:** Tailwind CSS (v4 with @tailwindcss/postcss)
- **Animation Libraries:** GSAP, Anime.js, Barba.js (for page transitions)
- **3D Graphics:** Three.js with custom GLSL shaders
- **Build System:** Next.js App Router (file-based routing)

## Architecture & Key Patterns

### Core Components

The application consists of a single-page hero experience with three main interactive elements:

1. **Countdown Timer** (`app/page.jsx` - OdometerDigit, OdometerValue)
   - Displays days/hours/minutes/seconds until October 5, 2026
   - Uses CSS transform animations on "odometer" strips for smooth digit transitions
   - Updates every 1000ms via `useEffect` interval
   - Styled with custom "Unbounded" font for bold, impact-driven typography

2. **Water Background Effect** (`app/components/WaterBackground.jsx`)
   - Canvas-based Three.js renderer with custom GLSL shaders
   - Simulates water ripples responding to pointer movement (pointermove, pointerdown events)
   - Manages 8 concurrent ripple states with circular displacement in the fragment shader
   - Handles responsive resizing and high-DPI displays (1-2x pixel ratio)
   - Key uniforms: `uRippleCenters`, `uRippleTimes`, `uResolution`, `uImageResolution`

3. **Intro Transition** (`app/components/IntroTransition.jsx`)
   - Full-screen animated sequence that plays on initial page load
   - GSAP timeline orchestrates: logo scale/rotation, animated lines, position transformation
   - Respects `prefers-reduced-motion` for accessibility
   - Emits `onComplete` callback to signal transition finish

### Global Styling

- **CSS-in-JS:** Tailwind v4 with postcss plugin (no separate tailwind config needed)
- **Typography:** Two custom @font-face stacks:
  - "Outfit" (Regular 400, Medium 500, Bold 700) for body text
  - "Unbounded" (Black 900) for numbers/display
- **Color Scheme:** Dark theme with #020503 background, #fffbea foreground
- **Responsive:** Heavy use of CSS clamp() for fluid scaling across viewports
- **Key CSS Variables:** `--font-text`, `--font-numbers` defined in `:root`

### Page Transitions

Barba.js is initialized dynamically in `page.jsx` to enable smooth fade transitions between pages:
- Transition name: `ceiba-fade`
- Uses GSAP for leave (0.45s) and enter (0.55s) animations
- Global flag `window.__ceibaBarbaReady` prevents multiple initializations

### Audio Integration

The page includes looping background audio (`/images/Mi Tierra, Tu Tierra.mp3`):
- Auto-plays with 42% volume on load
- Falls back to manual activation button if autoplay is blocked
- Managed via `audioRef` and `audioReady` state

## Development Commands

```bash
npm run dev       # Start development server (localhost:3000)
npm run build     # Production build
npm start         # Run production server
npm run lint      # Run ESLint
```

## Project Structure

```
project-ceiba/
├── app/
│   ├── components/
│   │   ├── IntroTransition.jsx    # Animated intro overlay
│   │   └── WaterBackground.jsx    # Three.js water ripple effect
│   ├── layout.jsx                 # Root layout wrapper
│   ├── page.jsx                   # Main countdown hero page
│   └── globals.css                # Global styles + @font-face
├── public/
│   ├── fonts/                     # Custom typefaces (Outfit, Unbounded)
│   ├── images/                    # SVG logos, background image, partner logos
│   └── videos/                    # (Empty, for future use)
├── package.json
├── jsconfig.json                  # Path alias @/* → ./*
├── next.config.mjs
├── postcss.config.mjs
└── .gitignore
```

## Key Implementation Details

### State Management
- Minimal global state; primarily uses React hooks (`useState`, `useRef`, `useCallback`, `useEffect`)
- `introDone` flag controls visibility of main content vs. intro sequence
- `time` state updates countdown values every second

### Performance Considerations
- `WaterBackground` uses `requestAnimationFrame` for ripple animation (60fps)
- Canvas rendering is GPU-accelerated with `powerPreference: "high-performance"`
- GSAP animations use `will-change` CSS properties for optimized transforms
- Responsive images with clamp() reduce layout shifts
- Three.js texture is only loaded once; ripples are procedural

### CSS Grid Layouts
- Hero content uses `grid-template-rows: auto 1fr auto` for logo / countdown / footer spacing
- Countdown grid switches from 4 columns (desktop) to 2 columns (mobile <760px)
- Fluid gap and padding via clamp() ensures readability on all screen sizes

### Animation Easing
- GSAP easing functions: `power3.out`, `power2.inOut`, `elastic.out()`, `back.out()` for specific feels
- Odometer digits use CSS `cubic-bezier(0.22, 1, 0.36, 1)` for smooth rolling effect
- Staggered animations on partner logos (0.18s delay) create visual rhythm

## Notes

- Spanish-language project ("Proyecto Ceiba"); UI labels like "DIAS", "HORAS", "MINUTOS", "SEGUNDOS" are in Spanish.
- Countdown target date is the `TARGET_DATE` constant in `app/page.jsx` (currently Oct 5, 2026).
- Water ripple shader constants in `WaterBackground.jsx`: propagation speed (`age * 0.22`), intensity (`ripple * 0.026`), lifespan (`age < 2.25`).
- No test suite; version 0.1.0 (pre-release template).
