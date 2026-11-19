import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { uploadMedia } from '../utils/uploader.js';
import { extractMediaMetadata } from '../utils/metadata.js';
import { 
  insertTrack, 
  getAllTracks, 
  getTrackById, 
  deleteTrack, 
  toggleTrackLike,
  createCategory,
  getCategoryByName,
  getCategoryById
} from '../db.js';

const router = Router();

// GET /api/tracks - Get tracks with filtering (category, search, format, favorites)
router.get('/', (req: Request, res: Response) => {
  try {
    const { category, search, format, favorites } = req.query;
    const isFavoritesOnly = favorites === 'true' || favorites === '1';

    const tracks = getAllTracks(
      category as string | undefined,
      search as string | undefined,
      format as string | undefined,
      isFavoritesOnly
    );

    res.json({
      success: true,
      count: tracks.length,
      tracks: tracks.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        fileName: t.file_name,
        filePath: t.file_path,
        mimeType: t.mime_type,
        format: t.format,
        duration: t.duration,
        categoryId: t.category_id,
        categoryName: t.category_name,
        categoryColor: t.category_color,
        moodTags: JSON.parse(t.mood_tags || '[]'),
        coverArtUrl: t.cover_art_url,
        isFavorite: t.is_favorite === 1,
        createdAt: t.created_at
      }))
    });
  } catch (error: any) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tracks' });
  }
});

// GET /api/tracks/:id - Get track by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const track = getTrackById(req.params.id);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }

    res.json({
      success: true,
      track: {
        id: track.id,
        title: track.title,
        artist: track.artist,
        fileName: track.file_name,
        filePath: track.file_path,
        mimeType: track.mime_type,
        format: track.format,
        duration: track.duration,
        categoryId: track.category_id,
        categoryName: track.category_name,
        categoryColor: track.category_color,
        moodTags: JSON.parse(track.mood_tags || '[]'),
        coverArtUrl: track.cover_art_url,
        isFavorite: track.is_favorite === 1,
        createdAt: track.created_at
      }
    });
  } catch (error: any) {
    console.error('Error fetching track:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch track' });
  }
});

// POST /api/tracks/:id/like - Toggle favorite status
router.post('/:id/like', (req: Request, res: Response) => {
  try {
    const result = toggleTrackLike(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }

    res.json({
      success: true,
      isFavorite: result.isFavorite,
      message: result.isFavorite ? 'Track added to Liked Songs' : 'Track removed from Liked Songs'
    });
  } catch (error: any) {
    console.error('Error toggling track favorite:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle like' });
  }
});

// POST /api/tracks/upload - Upload new track (MP4, MP3, etc.)
router.post('/upload', uploadMedia.single('media'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No media file uploaded' });
    }

    const file = req.file;
    const { 
      title: customTitle, 
      artist: customArtist, 
      categoryId: requestedCategoryId, 
      newCategoryName,
      moodTags: rawMoodTags 
    } = req.body;

    // 1. Extract metadata (duration, embedded art, title/artist)
    const metadata = await extractMediaMetadata(file.path, file.originalname, file.mimetype);

    // 2. Resolve Category
    let finalCategoryId: string | undefined = requestedCategoryId;

    if (newCategoryName && typeof newCategoryName === 'string' && newCategoryName.trim()) {
      const trimmedCategory = newCategoryName.trim();
      const existing = getCategoryByName(trimmedCategory);
      if (existing) {
        finalCategoryId = existing.id;
      } else {
        const created = createCategory(trimmedCategory);
        finalCategoryId = created.id;
      }
    }

    // 3. Resolve Title and Artist
    const finalTitle = (customTitle && customTitle.trim()) ? customTitle.trim() : metadata.title || 'Untitled Track';
    const finalArtist = (customArtist && customArtist.trim()) ? customArtist.trim() : metadata.artist || 'Unknown Artist';

    // 4. Resolve Mood Tags
    let moodTags: string[] = [];
    if (rawMoodTags) {
      if (Array.isArray(rawMoodTags)) {
        moodTags = rawMoodTags;
      } else if (typeof rawMoodTags === 'string') {
        try {
          moodTags = JSON.parse(rawMoodTags);
        } catch {
          moodTags = rawMoodTags.split(',').map(tag => tag.trim()).filter(Boolean);
        }
      }
    }

    // 5. Check for client-captured video frame or cover art
    let finalCoverArtUrl = metadata.coverArtUrl;
    if (!finalCoverArtUrl && req.body.coverArtBase64 && typeof req.body.coverArtBase64 === 'string') {
      try {
        const base64Data = req.body.coverArtBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const artFileName = `frame-${Date.now()}-${uuidv4().substring(0, 8)}.jpg`;
        const uploadsDir = path.dirname(file.path);
        const artFilePath = path.join(uploadsDir, artFileName);
        fs.writeFileSync(artFilePath, buffer);
        finalCoverArtUrl = `/uploads/${artFileName}`;
      } catch (err) {
        console.warn('Failed to save captured video frame:', err);
      }
    }

    // 6. Insert into SQLite
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const relativeFilePath = `uploads/${file.filename}`;

    const newTrack = insertTrack({
      title: finalTitle,
      artist: finalArtist,
      fileName: file.filename,
      filePath: relativeFilePath,
      mimeType: file.mimetype,
      format: ext || metadata.format,
      duration: metadata.duration,
      categoryId: finalCategoryId,
      moodTags,
      coverArtUrl: finalCoverArtUrl,
      isFavorite: false
    });

    res.status(201).json({
      success: true,
      message: 'Media track uploaded successfully',
      track: {
        id: newTrack.id,
        title: newTrack.title,
        artist: newTrack.artist,
        fileName: newTrack.file_name,
        filePath: newTrack.file_path,
        mimeType: newTrack.mime_type,
        format: newTrack.format,
        duration: newTrack.duration,
        categoryId: newTrack.category_id,
        categoryName: newTrack.category_name,
        categoryColor: newTrack.category_color,
        moodTags: JSON.parse(newTrack.mood_tags || '[]'),
        coverArtUrl: newTrack.cover_art_url,
        isFavorite: newTrack.is_favorite === 1,
        createdAt: newTrack.created_at
      }
    });
  } catch (error: any) {
    console.error('Error during media upload:', error);
    res.status(500).json({ success: false, message: error.message || 'Media upload failed' });
  }
});

// DELETE /api/tracks/:id - Delete a track
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = deleteTrack(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }
    res.json({ success: true, message: 'Track deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting track:', error);
    res.status(500).json({ success: false, message: 'Failed to delete track' });
  }
});

export default router;
