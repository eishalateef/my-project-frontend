/**
 * Unified image URL resolver for FlexiStore Pro / Khaam Poshak.
 * Resolves local uploaded assets against VITE_API_BASE_URL when deployed,
 * or leaves them relative for Vite proxy in development.
 */
export function getImageUrl(
  path,
  fallback = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80'
) {
  if (!path) return fallback;
  if (typeof path !== 'string') return fallback;

  // If already absolute URL or base64 data URI, return as-is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('//')) {
    return path;
  }

  const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // If API base URL is provided (e.g. Render backend), prepend it
  if (apiBase) {
    return `${apiBase}${cleanPath}`;
  }

  // Local development via Vite proxy
  return cleanPath;
}

export default getImageUrl;
