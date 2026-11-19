# MySpoti Project Guidelines & Rules

## Core Verification Rule
- **Double Verification**: After every single step, verify it thoroughly **two times** using independent checks (e.g., build/typecheck check, runtime/API check, file integrity/structure verification) before moving on to the next step. Apply this strictly across all phases.

## Multi-Aspect-Ratio & Responsive Design
- The web app must work seamlessly on **all aspect ratios and screen sizes**:
  - Mobile (portrait 9:16 / tall aspect ratios): Bottom navigation bar, collapsible mini-player with full-screen now-playing sheet, bottom drawer modals.
  - Tablet (4:3 / 16:10): Collapsible/slim navigation, fluid 2–3 column grids.
  - Desktop & Ultrawide (16:9 / 21:9): 3-panel Spotify interface (sidebar, dynamic grid, AI DJ drawer, persistent bottom player).
  - Video Aspect Ratios: Support both 16:9 widescreen and 9:16 vertical/Reels-style MP4 music videos with aspect-ratio preservation.

## Git & Commits
- **Do not commit automatically**: Only commit and push when the user explicitly instructs to do so.
- **Commit message style**: Simple and short messages only (e.g., `fix navbar`, `update readme`, `add theme toggle`), never formal, verbose, or long professional commit messages.

## UI & Animation Stack
When designing and implementing animations, consider the following libraries and components where they make sense, but **always ask for the user's confirmation before adding them**:
- **Motion** (Framer Motion)
- **GSAP**
- **React Bits**
- **Magic UI**
- **Lenis** (smooth scroll)
