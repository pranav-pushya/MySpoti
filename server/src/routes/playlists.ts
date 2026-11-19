import { Router, Request, Response } from 'express';
import { 
  getAllPlaylists, 
  getPlaylistById, 
  createPlaylist, 
  deletePlaylist, 
  addTrackToPlaylist, 
  removeTrackFromPlaylist 
} from '../db.js';

const router = Router();

// GET /api/playlists - List all playlists
router.get('/', (req: Request, res: Response) => {
  try {
    const playlists = getAllPlaylists();
    res.json({
      success: true,
      playlists: playlists.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        coverArtUrl: p.cover_art_url,
        trackCount: p.track_count,
        createdAt: p.created_at
      }))
    });
  } catch (error: any) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch playlists' });
  }
});

// POST /api/playlists - Create new playlist
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Playlist name is required' });
    }

    const playlist = createPlaylist(name.trim(), description);
    res.status(201).json({
      success: true,
      message: 'Playlist created',
      playlist: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        coverArtUrl: playlist.cover_art_url,
        trackCount: 0,
        tracks: [],
        createdAt: playlist.created_at
      }
    });
  } catch (error: any) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ success: false, message: 'Failed to create playlist' });
  }
});

// GET /api/playlists/:id - Get playlist by ID with tracks
router.get('/:id', (req: Request, res: Response) => {
  try {
    const playlist = getPlaylistById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    res.json({
      success: true,
      playlist: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        coverArtUrl: playlist.cover_art_url,
        trackCount: playlist.tracks.length,
        createdAt: playlist.created_at,
        tracks: playlist.tracks.map(t => ({
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
      }
    });
  } catch (error: any) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch playlist' });
  }
});

// DELETE /api/playlists/:id - Delete playlist
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = deletePlaylist(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    res.json({ success: true, message: 'Playlist deleted' });
  } catch (error: any) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ success: false, message: 'Failed to delete playlist' });
  }
});

// POST /api/playlists/:id/tracks - Add track to playlist
router.post('/:id/tracks', (req: Request, res: Response) => {
  try {
    const { trackId } = req.body;
    if (!trackId) {
      return res.status(400).json({ success: false, message: 'trackId is required' });
    }

    const added = addTrackToPlaylist(req.params.id, trackId);
    if (!added) {
      return res.status(400).json({ success: false, message: 'Track already in playlist or playlist not found' });
    }

    res.json({ success: true, message: 'Track added to playlist' });
  } catch (error: any) {
    console.error('Error adding track to playlist:', error);
    res.status(500).json({ success: false, message: 'Failed to add track to playlist' });
  }
});

// DELETE /api/playlists/:id/tracks/:trackId - Remove track from playlist
router.delete('/:id/tracks/:trackId', (req: Request, res: Response) => {
  try {
    const removed = removeTrackFromPlaylist(req.params.id, req.params.trackId);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Track not found in playlist' });
    }
    res.json({ success: true, message: 'Track removed from playlist' });
  } catch (error: any) {
    console.error('Error removing track from playlist:', error);
    res.status(500).json({ success: false, message: 'Failed to remove track from playlist' });
  }
});

export default router;
