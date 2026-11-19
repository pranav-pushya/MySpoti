import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../../uploads');

const ALLOWED_EXTENSIONS = new Set(['.mp4', '.mp3', '.wav', '.ogg', '.flac', '.m4a', '.webm']);
const ALLOWED_MIME_PREFIXES = ['audio/', 'video/'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedExt = ALLOWED_EXTENSIONS.has(ext);
  const isAllowedMime = ALLOWED_MIME_PREFIXES.some(prefix => file.mimetype.startsWith(prefix));

  if (isAllowedExt || isAllowedMime) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}. Supported formats: MP4, MP3, WAV, OGG, FLAC, M4A, WEBM`));
  }
};

export const uploadMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 250 * 1024 * 1024 // 250 MB
  }
});
