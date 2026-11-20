import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import categoriesRouter from './routes/categories.js';
import tracksRouter from './routes/tracks.js';
import streamRouter from './routes/stream.js';
import aiRouter from './routes/ai.js';
import playlistsRouter from './routes/playlists.js';
import syncRouter from './routes/sync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from both root and server directories
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite database
initDb();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/tracks', tracksRouter);
app.use('/api/playlists', playlistsRouter);
app.use('/api/stream', streamRouter);
app.use('/api/ai', aiRouter);
app.use('/api/sync', syncRouter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'MySpoti Server',
    timestamp: new Date().toISOString()
  });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🎵 MySpoti server running on port ${PORT}`);
  console.log(`   ➜ Local:   http://localhost:${PORT}`);

  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          console.log(`   ➜ Network: http://${iface.address}:${PORT}`);
        }
      }
    }
  } catch {
    // ignore
  }
});

export default app;
