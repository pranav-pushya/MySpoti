/**
 * MySpoti API & Media URL configuration helper.
 * Supports local development proxy and remote Vercel-to-backend deployments.
 */

// Reads VITE_API_URL if configured (e.g., https://my-backend.onrender.com or http://192.168.1.15:5000)
// Otherwise defaults to empty string so standard relative proxy paths (/api and /uploads) work out of the box.
export const API_BASE_URL: string = (
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') || ''
);

/**
 * Returns the fully qualified API URL for a given endpoint.
 * @param path - e.g. "/api/tracks" or "api/tracks"
 */
export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Returns the fully qualified URL for media assets (audio/video streams, cover artwork).
 * If the path is already an absolute URL (http/https/data:), it returns it unchanged.
 * @param path - e.g. "/uploads/cover-123.jpg" or "/api/stream/abc"
 */
export const getMediaUrl = (path?: string | null): string => {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
