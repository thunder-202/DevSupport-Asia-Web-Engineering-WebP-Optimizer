/**
 * Normalizes any GitHub URL or shorthand input into a valid, safe HTTPS link.
 * Prevents 404 errors caused by relative URLs (e.g. href="github.com/...") or broken protocols.
 */
export function normalizeGithubUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (!url) return '';

  // Remove surrounding quotes or backticks if any
  url = url.replace(/^["'`]|["'`]$/g, '').trim();

  // If already absolute protocol
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return url;
  }

  // If it starts with github.com or www.github.com
  if (url.startsWith('github.com/') || url.startsWith('www.github.com/')) {
    return `https://${url.replace(/^www\./, '')}`;
  }

  // If only a handle or repo path e.g. "nayem1816/e-shop" or "nayem1816"
  const cleanPath = url.replace(/^\/+/, '');
  return `https://github.com/${cleanPath}`;
}

/**
 * Returns a clean, readable display label for a GitHub URL.
 */
export function getGithubDisplay(url?: string): string {
  if (!url) return '';
  const clean = url.trim();
  return clean.replace(/^https?:\/\/(www\.)?github\.com\/?/i, 'github.com/');
}

/**
 * Normalizes any live project URL to ensure it has https:// and does not resolve relatively.
 */
export function normalizeWebUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (!url) return '';
  url = url.replace(/^["'`]|["'`]$/g, '').trim();
  if (!url) return '';
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return url;
  }
  return `https://${url}`;
}
