import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../data/myspoti.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance & enable foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string;
  created_at: string;
}

export interface DbTrack {
  id: string;
  title: string;
  artist: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  format: string;
  duration: number;
  category_id?: string;
  mood_tags: string;
  cover_art_url?: string;
  created_at: string;
}

// Initialize tables
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tracks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL DEFAULT 'Unknown Artist',
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      format TEXT NOT NULL,
      duration REAL NOT NULL DEFAULT 0,
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      mood_tags TEXT DEFAULT '[]',
      cover_art_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_tracks_category ON tracks(category_id);
    CREATE INDEX IF NOT EXISTS idx_tracks_format ON tracks(format);
  `);

  // Seed default categories if empty
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM categories');
  const result = countStmt.get() as { count: number };

  if (result.count === 0) {
    const seedCategories = [
      { name: 'Chill & Relax', color: '#1db954', icon: 'coffee' },
      { name: 'Workout Beats', color: '#e91429', icon: 'zap' },
      { name: 'Lo-Fi Focus', color: '#8c67ac', icon: 'book' },
      { name: 'Pop Hits', color: '#1e3264', icon: 'music' },
      { name: 'Rock Classics', color: '#e8115b', icon: 'flame' },
      { name: 'Ambient Vibes', color: '#27856a', icon: 'wind' }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO categories (id, name, slug, color, icon)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const cat of seedCategories) {
      const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      insertStmt.run(uuidv4(), cat.name, slug, cat.color, cat.icon);
    }
    console.log('🌱 Seeded default categories into SQLite database');
  }
}

// Category Helper Functions
export function getCategoriesWithCount(): Array<DbCategory & { track_count: number }> {
  const stmt = db.prepare(`
    SELECT c.*, COUNT(t.id) as track_count
    FROM categories c
    LEFT JOIN tracks t ON c.id = t.category_id
    GROUP BY c.id
    ORDER BY c.name ASC
  `);
  return stmt.all() as Array<DbCategory & { track_count: number }>;
}

export function getCategoryById(id: string): DbCategory | undefined {
  const stmt = db.prepare('SELECT * FROM categories WHERE id = ?');
  return stmt.get(id) as DbCategory | undefined;
}

export function getCategoryByName(name: string): DbCategory | undefined {
  const stmt = db.prepare('SELECT * FROM categories WHERE LOWER(name) = LOWER(?)');
  return stmt.get(name) as DbCategory | undefined;
}

export function createCategory(name: string, color?: string, icon?: string): DbCategory {
  const id = uuidv4();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const finalColor = color || '#1db954';

  const stmt = db.prepare(`
    INSERT INTO categories (id, name, slug, color, icon)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, name.trim(), slug, finalColor, icon || null);

  return getCategoryById(id)!;
}

// Track Helper Functions
export function getAllTracks(categoryId?: string, search?: string, format?: string) {
  let query = `
    SELECT t.*, c.name as category_name, c.color as category_color
    FROM tracks t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (categoryId) {
    query += ' AND t.category_id = ?';
    params.push(categoryId);
  }

  if (format) {
    query += ' AND t.format = ?';
    params.push(format.toLowerCase());
  }

  if (search) {
    query += ' AND (t.title LIKE ? OR t.artist LIKE ? OR c.name LIKE ? OR t.mood_tags LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  query += ' ORDER BY t.created_at DESC';

  const stmt = db.prepare(query);
  return stmt.all(...params) as Array<DbTrack & { category_name?: string; category_color?: string }>;
}

export function getTrackById(id: string) {
  const stmt = db.prepare(`
    SELECT t.*, c.name as category_name, c.color as category_color
    FROM tracks t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?
  `);
  return stmt.get(id) as (DbTrack & { category_name?: string; category_color?: string }) | undefined;
}

export function insertTrack(track: {
  id?: string;
  title: string;
  artist?: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  format: string;
  duration?: number;
  categoryId?: string;
  moodTags?: string[];
  coverArtUrl?: string;
}) {
  const id = track.id || uuidv4();
  const stmt = db.prepare(`
    INSERT INTO tracks (
      id, title, artist, file_name, file_path, mime_type, format, duration, category_id, mood_tags, cover_art_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    track.title,
    track.artist || 'Unknown Artist',
    track.fileName,
    track.filePath,
    track.mimeType,
    track.format.toLowerCase(),
    track.duration || 0,
    track.categoryId || null,
    JSON.stringify(track.moodTags || []),
    track.coverArtUrl || null
  );

  return getTrackById(id)!;
}

export function deleteTrack(id: string): boolean {
  const stmt = db.prepare('DELETE FROM tracks WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export { db };
