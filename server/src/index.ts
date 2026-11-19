import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import categoriesRouter from './routes/categories.js';
import tracksRouter from './routes/tracks.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'MySpoti Server',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🎵 MySpoti server running at http://localhost:${PORT}`);
});

export default app;
