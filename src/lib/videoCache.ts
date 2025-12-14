/**
 * Video caching utility using Cache API
 * Stores recently viewed videos in browser cache for instant playback
 */

const CACHE_NAME = 'spotlux-video-cache';
const MAX_CACHED_VIDEOS = 5; // LRU limit

interface CacheMetadata {
  url: string;
  timestamp: number;
}

/**
 * Get or create the video cache
 */
async function getCache(): Promise<Cache | null> {
  // Check if Cache API is available (browser only, not SSR)
  if (typeof window === 'undefined' || !window.caches) {
    return null;
  }
  return await caches.open(CACHE_NAME);
}

/**
 * Get cache metadata from localStorage
 */
function getCacheMetadata(): CacheMetadata[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('video-cache-metadata');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save cache metadata to localStorage
 */
function saveCacheMetadata(metadata: CacheMetadata[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('video-cache-metadata', JSON.stringify(metadata));
  } catch (err) {
    console.error('Failed to save cache metadata:', err);
  }
}

/**
 * Update metadata with new entry and enforce LRU eviction
 */
async function updateMetadata(url: string): Promise<void> {
  let metadata = getCacheMetadata();

  // Remove existing entry if present
  metadata = metadata.filter((entry) => entry.url !== url);

  // Add new entry at the end (most recent)
  metadata.push({ url, timestamp: Date.now() });

  // Enforce LRU eviction if over limit
  if (metadata.length > MAX_CACHED_VIDEOS) {
    const toEvict = metadata.shift(); // Remove oldest
    if (toEvict) {
      const cache = await getCache();
      if (cache) {
        await cache.delete(toEvict.url);
      }
    }
  }

  saveCacheMetadata(metadata);
}

/**
 * Check if a video URL is cached
 */
export async function isVideoCached(url: string): Promise<boolean> {
  try {
    const cache = await getCache();
    if (!cache) return false;
    const response = await cache.match(url);
    return response !== undefined;
  } catch (err) {
    console.error('Failed to check cache:', err);
    return false;
  }
}

/**
 * Get a video from cache or network
 * Returns a blob URL that can be used as video src
 */
export async function getVideo(url: string): Promise<string> {
  try {
    const cache = await getCache();

    // If cache not available (SSR or unsupported browser), return original URL
    if (!cache) {
      return url;
    }

    let response = await cache.match(url);

    if (response) {
      // Cache hit - update metadata timestamp
      await updateMetadata(url);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }

    // Cache miss - fetch from network
    response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }

    // Clone response before consuming (needed for both cache and blob)
    const responseClone = response.clone();

    // Store in cache
    await cache.put(url, response);
    await updateMetadata(url);

    // Return blob URL
    const blob = await responseClone.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Failed to get video from cache:', err);
    // Fallback to original URL
    return url;
  }
}

/**
 * Preload a video into cache (doesn't return blob URL)
 */
export async function preloadVideo(url: string): Promise<void> {
  try {
    // Check if already cached
    if (await isVideoCached(url)) {
      return;
    }

    const cache = await getCache();
    if (!cache) return; // Cache not available

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to preload video: ${response.statusText}`);
    }

    await cache.put(url, response);
    await updateMetadata(url);
  } catch (err) {
    console.error('Failed to preload video:', err);
  }
}

/**
 * Clear all cached videos
 */
export async function clearVideoCache(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    if (window.caches) {
      await caches.delete(CACHE_NAME);
    }
    localStorage.removeItem('video-cache-metadata');
  } catch (err) {
    console.error('Failed to clear video cache:', err);
  }
}
