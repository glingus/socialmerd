export type Site = 'instagram' | 'youtube';

export function detectSite(hostname = location.hostname): Site | null {
  if (hostname === 'www.instagram.com' || hostname === 'instagram.com') {
    return 'instagram';
  }
  if (
    hostname === 'm.youtube.com' ||
    hostname === 'www.youtube.com' ||
    hostname === 'youtube.com'
  ) {
    return 'youtube';
  }
  return null;
}
