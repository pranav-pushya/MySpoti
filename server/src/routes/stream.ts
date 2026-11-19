import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTrackById } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// GET /api/stream/:id - HTTP 206 Partial Content range streaming
router.get('/:id', (req: Request, res: Response) => {
  try {
    const track = getTrackById(req.params.id);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Track not found' });
    }

    const fullFilePath = path.join(__dirname, '../../', track.file_path);

    if (!fs.existsSync(fullFilePath)) {
      return res.status(404).json({ success: false, message: 'Media file missing on server' });
    }

    const stat = fs.statSync(fullFilePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // MIME type resolution
    const mimeType = track.mime_type || (track.format === 'mp4' ? 'video/mp4' : 'audio/mpeg');

    if (range) {
      // Parse Range header (e.g., "bytes=1048576-")
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize || start > end) {
        res.status(416).set({
          'Content-Range': `bytes */${fileSize}`
        });
        return res.end();
      }

      const chunkSize = (end - start) + 1;
      const fileStream = fs.createReadStream(fullFilePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mimeType,
        'Cache-Control': 'no-cache'
      });

      fileStream.pipe(res);
    } else {
      // Entire file streaming
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes'
      });
      fs.createReadStream(fullFilePath).pipe(res);
    }
  } catch (error: any) {
    console.error('Streaming error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Streaming failed' });
    }
  }
});

export default router;
