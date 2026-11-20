# 🚀 MySpoti Deployment & Multi-Device Sync Guide

This guide explains how to deploy **MySpoti** on Vercel, sync music and video playback seamlessly between your mobile phones, tablets, and computers, and install MySpoti as a native PWA app.

---

## 📱 Part 1: Installing MySpoti as an App (PWA)

MySpoti is a Progressive Web App (PWA) that installs directly on your home screen or desktop without going through an app store.

### Bottom-Left Install Popup
When you open MySpoti on your phone or tablet:
- A Spotify-themed **"Install MySpoti App"** popup will automatically appear in the **bottom-left corner** (above the bottom navigation bar).
- **On Android / Chrome / Edge**: Tap the green **"Install"** button. The browser will add MySpoti directly to your app drawer and home screen.
- **On iOS / Safari (iPhone & iPad)**: Tap the popup to view the 3-step guide:
  1. Tap the Safari **Share** icon (square with arrow).
  2. Scroll down and tap **"Add to Home Screen"**.
  3. Tap **Add** in the top right.

### Benefits of the Installed App
- **Full-Screen Immersion**: Runs without browser address bars or navigation clutter.
- **System Lockscreen Controls**: MediaSession integration allows you to pause, skip, and scrub tracks directly from your phone lockscreen, smartwatch, or Bluetooth headphones.
- **Background Audio**: Seamless audio playback while using other apps.

---

## ⚡ Part 2: Deploying the Frontend on Vercel

The frontend is a high-performance React + Vite TypeScript SPA pre-configured with `vercel.json` rewrites.

### Step-by-Step Vercel Deployment

1. **Push your code to GitHub**:
   Ensure your latest commits are pushed to your repository (`https://github.com/pranav-pushya/MySpoti.git`).

2. **Import into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
   - Select your GitHub repository: `pranav-pushya/MySpoti`.

3. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (or `client`)
   - **Build Command**: `npm --prefix client run build` (automatic via `vercel.json`)
   - **Output Directory**: `client/dist` (automatic via `vercel.json`)

4. **Environment Variables**:
   Under **Environment Variables**, add:
   - `VITE_API_URL`: The URL of your running backend (e.g., `https://myspoti-api.onrender.com` or your Cloudflare tunnel URL).
   *(If running locally over LAN Wi-Fi, you can leave this empty).*

5. **Deploy**:
   Click **Deploy**. In under a minute, your frontend will be live at `https://myspoti.vercel.app`!

---

## 🔄 Part 3: Syncing Between Devices

MySpoti features **Spotify Connect** style cross-device synchronization:
- All uploaded tracks, MP4 videos, categories, playlists, and liked songs are saved in the central backend database.
- Every device on the network automatically discovers other connected devices and allows 1-click playback transfer!

### Method A: Local Wi-Fi / LAN Sync (Zero Setup)
Both the server and client now bind to `0.0.0.0`, meaning any device on your home or office Wi-Fi network can connect instantly.

1. On your computer, run:
   ```bash
   npm run dev
   ```
2. Terminal will display your local network IP:
   ```
   🎵 MySpoti server running on port 5000
      ➜ Local:   http://localhost:5000
      ➜ Network: http://192.168.1.15:5000

   ➜  Local:   http://localhost:3000/
   ➜  Network: http://192.168.1.15:3000/
   ```
3. Open `http://192.168.1.15:3000` on your iPhone, iPad, or Android phone.
4. **Done!** Both devices are now connected to the exact same library.

---

### Method B: Free Cloudflare Tunnel (Listen Anywhere in the World)
If you want to access your computer's music library and MP4 videos from your phone while outside your home (cellular data / other Wi-Fi), use a free Cloudflare Tunnel:

1. Download [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/).
2. Run a free instant tunnel to your backend port:
   ```bash
   cloudflared tunnel --url http://localhost:5000
   ```
3. Cloudflare gives you a secure public URL (e.g., `https://random-words.trycloudflare.com`).
4. Set this URL as `VITE_API_URL` in your Vercel project settings:
   ```
   VITE_API_URL = https://random-words.trycloudflare.com
   ```
5. Now you can open `https://myspoti.vercel.app` on your phone or tablet anywhere in the world and stream your home PC's music and videos!

---

### Method C: Free Cloud Backend (Render / Railway / Fly.io)
If you want a dedicated cloud server:

1. Create a free account on [Render.com](https://render.com).
2. Click **New Web Service** and connect `https://github.com/pranav-pushya/MySpoti`.
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `PORT`: `5000`
     - `GROQ_API_KEY`: *(your Groq API key for AI DJ)*
     - `GEMINI_API_KEY`: *(optional Gemini key)*
4. Once deployed, Render gives you a URL (e.g. `https://myspoti-server.onrender.com`).
5. In Vercel, set `VITE_API_URL = https://myspoti-server.onrender.com`.

---

## 🎛️ Part 4: Using Spotify Connect Device Sync

Once multiple devices are open:
1. Tap the **Cast / Device icon** (`<Cast />`) on the bottom player bar (next to volume slider on desktop, or inside the full-screen sheet on mobile).
2. The **"Connect to a Device"** modal opens:
   - Displays **This Device** (e.g., "iPhone", "iPad", or "Windows PC").
   - Displays all other active devices on your account.
3. Tap **"Send Audio"** or **"Play Here"** to instantly transfer playback from your computer to your phone, or use your phone as a remote control!
