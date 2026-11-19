import * as mm from 'music-metadata';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const coversDir = path.join(__dirname, '../../uploads/covers');

export interface ExtractedMetadata {
  title?: string;
  artist?: string;
  duration: number; // in seconds
  format: string;
  coverArtUrl?: string;
}

export async function extractMediaMetadata(
  filePath: string,
  originalFilename: string,
  mimetype: string
): Promise<ExtractedMetadata> {
  const ext = path.extname(originalFilename).toLowerCase().replace('.', '');
  
  // Default values
  let cleanName = path.basename(originalFilename, path.extname(originalFilename))
    .replace(/[_-]+/g, ' ')
    .trim();
  
  let result: ExtractedMetadata = {
    title: cleanName,
    artist: 'Unknown Artist',
    duration: 0,
    format: ext || 'mp3'
  };

  try {
    const metadata = await mm.parseFile(filePath, { duration: true });

    if (metadata.common) {
      if (metadata.common.title && metadata.common.title.trim()) {
        result.title = metadata.common.title.trim();
      }
      if (metadata.common.artist && metadata.common.artist.trim()) {
        result.artist = metadata.common.artist.trim();
      }

      // Check for embedded album picture
      const picture = metadata.common.picture && metadata.common.picture[0];
      if (picture && picture.data) {
        if (!fs.existsSync(coversDir)) {
          fs.mkdirSync(coversDir, { recursive: true });
        }
        
        const coverExt = picture.format ? `.${picture.format.split('/')[1] || 'jpg'}` : '.jpg';
        const coverFilename = `cover-${uuidv4()}${coverExt}`;
        const coverFilePath = path.join(coversDir, coverFilename);

        fs.writeFileSync(coverFilePath, picture.data);
        result.coverArtUrl = `/uploads/covers/${coverFilename}`;
      }
    }

    if (metadata.format && metadata.format.duration) {
      result.duration = Math.round(metadata.format.duration);
    }
  } catch (err) {
    console.warn(`Could not extract extended metadata for ${originalFilename}, using defaults:`, err);
  }

  return result;
}
