# MySpoti — Comprehensive Project Documentation

A personal cloud-native Spotify clone supporting multi-format media uploads (**MP4 video** and audio formats like MP3/WAV/FLAC), dynamic category management, dual audio/video playback, and an intelligent **Gemini-powered AI DJ/Assistant** that analyzes your mood to build custom playlists from your uploaded library and answers app-related questions.

---

## 1. Project Overview & Core Concept

Standard streaming platforms are restricted to audio catalogs and predefined public libraries. **MySpoti** bridges the gap between music streaming, personal media storage, and contextual artificial intelligence:

- **Custom Multi-Format Media Uploads**: Users can upload their own tracks and music videos in formats including MP4, MP3, WAV, FLAC, M4A, OGG, and WebM.
- **Dynamic Category Organization**: Users can assign tracks to categories (e.g., Chill, Workout, Focus, Lo-Fi, Pop, Rock) or create custom categories on the fly.
- **Dual-Mode Audio & MP4 Video Playback**: Seamlessly enjoy background music audio while browsing, or expand into **Video Theater Mode** to watch music videos in their native aspect ratio (16:9 widescreen or 9:16 vertical video).
- **Gemini-Powered AI Mood DJ & App Assistant**: An intelligent assistant integrated with the user's uploaded catalog that curates playlists based on mood/activity and answers any questions regarding webapp usage.

---

## 2. Multi-Aspect-Ratio & Responsive Design Strategy

The webapp is built from the ground up to render flawlessly across all standard and non-standard aspect ratios:

| Device & Ratio | Viewport Width | UX & UI Adaptation |
| :--- | :--- | :--- |
| **Mobile (Portrait 9:16 / 9:19)** | `< 640px` | Left sidebar collapses into a fixed **5-Tab Bottom Navigation Bar** (Home, Search, Upload, AI DJ, Library). The bottom player transforms into a **Floating Mini-Player** with a swipe-up full-screen sheet. Modals and AI DJ open as bottom drawers. |
| **Tablet (4:3 / 16:10)** | `640px – 1024px` | Navigation adapts to an icon rail or compact sidebar. Dynamic 2–3 column media grids maximize screen real estate. Controls display compact volume and track sliders. |
| **Desktop (16:9)** | `1024px – 1440px` | Classic 3-column Spotify layout: Collapsible Left Library Navigation, dynamic main content area, and slide-over AI DJ Drawer with persistent bottom player bar. |
| **Ultrawide (21:9)** | `> 1440px` | Content grid scales smoothly up to 6–7 columns with fluid padding, avoiding excessive empty space while retaining readability. |
| **MP4 Video Aspect Ratios** | `16:9` & `9:16` | Adaptive Video Theater preserves natural video aspect ratio for both horizontal music videos and vertical/short-form reels without letterbox distortion. |

---

## 3. Technology Stack

- **Frontend**:
  - React 18 + Vite + TypeScript (ultra-fast compilation and HMR).
  - Tailwind CSS (Spotify dark theme palette: `#121212`, `#181818`, `#242424`, `#1db954`).
  - Lucide-React (Spotify-style iconography).
  - Zustand (global player and application UI state).
- **Backend**:
  - Node.js + Express + TypeScript (ESM modules).
  - SQLite (`better-sqlite3`) for high-performance zero-configuration local database storage.
  - Multer for secure multi-format file uploads (`server/uploads/`).
  - `music-metadata` for ID3 tags and audio duration extraction.
  - HTTP 206 Partial Content byte-range streaming for instantaneous audio and video scrubbing.
- **AI Engine**:
  - Google Gemini API (`@google/genai`) for mood-based music curation and in-app assistance.

---

## 4. Phase-by-Phase Implementation Log

### Phase 1: Project Scaffolding & Responsive Shell Architecture ✅

#### Step 1.1: Workspace & Directory Setup
- **What Was Done**:
  - Initialized monorepo directory layout: `client/`, `server/`, `shared/`.
  - Created `shared/types.ts` defining canonical TypeScript interfaces for `Track`, `Category`, `ChatMessage`, `AIRecommendationResponse`, and `MediaFormat`.
  - Configured root `package.json` with `concurrently` orchestration (`npm run dev`, `npm run build`).
  - Added `.gitignore` to protect dependencies, builds, and uploads.
- **Why It Was Done**:
  - A clean monorepo structure guarantees type safety between client and server without code duplication.
- **Verification Details**:
  - *Verification 1*: File structure integrity verified (`shared/types.ts`, `package.json`, `node_modules/concurrently`).
  - *Verification 2*: Executed `npx concurrently --version` (v9.2.5 confirmed).

#### Step 1.2: Backend Server Initialization
- **What Was Done**:
  - Initialized Express TypeScript server with `cors`, `dotenv`, and static uploads directory at `/uploads`.
  - Configured dependencies: `express`, `better-sqlite3`, `multer`, `music-metadata`, `uuid`, `@google/genai`, and `tsx`.
  - Created health-check endpoint `GET /api/health`.
- **Why It Was Done**:
  - Provides the foundational runtime for media streaming, file uploads, database queries, and Gemini API proxying.
- **Verification Details**:
  - *Verification 1*: Ran `tsc` build in `server/`, successfully generating `dist/index.js` with 0 errors.
  - *Verification 2*: Started server in runtime test, sent live HTTP GET request to `http://localhost:5000/api/health`, and verified HTTP 200 with `{ status: "ok", app: "MySpoti Server" }`.

#### Step 1.3: Frontend Setup with Vite & Tailwind CSS
- **What Was Done**:
  - Scaffolded React 18 + Vite + TypeScript application in `client/`.
  - Configured Tailwind CSS with custom Spotify design tokens (`#121212`, `#181818`, `#242424`, `#1db954`).
  - Set up custom Spotify-styled scrollbars and range sliders in `client/src/index.css`.
  - Configured Vite reverse proxy to route `/api` and `/uploads` directly to `http://localhost:5000`.
- **Why It Was Done**:
  - Delivers an authentic Spotify dark theme aesthetic with smooth responsive styling and rapid client-server communication without CORS issues.
- **Verification Details**:
  - *Verification 1*: Client production build (`tsc && vite build`) transformed 2,132 modules and created bundles without warnings.
  - *Verification 2*: Started Vite preview server and confirmed HTTP 200 serving `<div id="root">` with the page title.

#### Step 1.4: Adaptive Responsive Shell & Layout
- **What Was Done**:
  - Built responsive layout components:
    - **Sidebar** (`Sidebar.tsx`): Desktop/tablet left navigation with logo, navigation links, categories list, and AI DJ trigger.
    - **Header** (`Header.tsx`): Sticky top navigation with history controls, real-time search bar, active category chip, upload button, and AI DJ button.
    - **Mobile Bottom Navigation** (`MobileNav.tsx`): 5-tab bar (Home, Search, Upload, AI DJ, Library) optimized for 9:16 mobile viewports.
    - **Responsive Shell** (`Shell.tsx`): Integrates sidebar, header, main scroll area, AI drawer slide-over, and persistent bottom player slot.
    - **State Store** (`useAppStore.ts`): Manages navigation, search queries, active category filters, modal toggles, and drawer states.
- **Why It Was Done**:
  - Establishes the full responsive shell capable of fluidly adapting across phones, tablets, laptops, and ultrawide screens.
- **Verification Details**:
  - *Verification 1*: Client build verified with all layout components (`tsc && vite build` succeeded).
  - *Verification 2*: End-to-end workspace build (`npm run build`) succeeded across both server and client packages with exit code 0.

---

## 5. Upcoming Phases Roadmap

- **Phase 2: Database Models & Multi-Format Upload Engine**
  - Step 2.1: SQLite Database setup & migrations (`categories`, `tracks` tables).
  - Step 2.2: Category management APIs (list, create, seed default categories).
  - Step 2.3: Multer file upload pipeline with MIME type checking.
  - Step 2.4: Metadata and video thumbnail extraction service.
  - Step 2.5: Track upload endpoint (`POST /api/tracks/upload`).
  - Step 2.6: Responsive upload modal with drag-and-drop & category selection.
- **Phase 3: Spotify-Inspired Media Player (Audio & Video)**
  - HTTP 206 Partial Content byte-range streaming for instant seeking.
  - Global player Zustand store with queue management.
  - Bottom player bar (desktop full view, mobile mini-player + sheet).
  - Dual-mode MP4 video theater overlay with aspect ratio preservation.
- **Phase 4: Library Browsing, Category Exploration & Search**
  - Category filter carousel with touch-friendly pills.
  - Responsive track card grids and table view.
  - Live real-time search across tracks, categories, and artists.
- **Phase 5: Gemini AI DJ & In-App Assistant**
  - Dynamic user catalog context injection into Gemini 2.5.
  - Mood-based recommendation endpoint (`POST /api/ai/chat`).
  - Slide-over AI DJ drawer with one-click "Play Suggested Queue" button.
- **Phase 6: Polish, Persistence, Responsiveness & Verification**
  - LocalStorage volume & queue persistence.
  - Keyboard shortcuts (Space, Seek, Mute).
  - Cross-aspect-ratio edge testing and end-to-end verification.
