/**
 * Multi-Layer Caching System
 * L1: In-memory LRU cache (fast, ephemeral)
 * L2: Database cache (persistent, slower)
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  hits: number;
}

class MemoryCache {
  private store: Map<string, CacheEntry<unknown>> = new Map();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 1000, defaultTTLSeconds: number = 300) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTLSeconds * 1000;
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    entry.hits++;
    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttlSeconds?: number): void {
    // Evict if at capacity
    if (this.store.size >= this.maxSize) {
      this.evictLRU();
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL),
      hits: 0,
    });
  }

  /**
   * Get or compute value
   */
  async getOrCompute<T>(
    key: string,
    compute: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    const value = await compute();
    this.set(key, value, ttlSeconds);
    return value;
  }

  /**
   * Delete entry
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get cache stats
   */
  stats() {
    let totalHits = 0;
    let expired = 0;

    for (const entry of this.store.values()) {
      totalHits += entry.hits;
      if (Date.now() > entry.expiresAt) expired++;
    }

    return {
      size: this.store.size,
      maxSize: this.maxSize,
      totalHits,
      expired,
    };
  }

  private evictLRU(): void {
    const entries = Array.from(this.store.entries())
      .sort((a, b) => a[1].hits - b[1].hits);

    const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.1));
    for (const [key] of toRemove) {
      this.store.delete(key);
    }
  }
}

// Singleton instance
const globalForCache = globalThis as unknown as {
  memoryCache: MemoryCache | undefined;
};

export const memoryCache = globalForCache.memoryCache ?? new MemoryCache(2000, 600);

if (process.env.NODE_ENV !== "production") {
  globalForCache.memoryCache = memoryCache;
}

/**
 * Cache key generators
 */
export const cacheKeys = {
  profile: (userId: string) => `profile:${userId}`,
  campaign: (campaignId: string) => `campaign:${campaignId}`,
  campaignLeads: (campaignId: string) => `campaign:${campaignId}:leads`,
  lead: (leadId: string) => `lead:${leadId}`,
  stats: (userId: string) => `stats:${userId}`,
  roast: (domain: string) => `roast:${domain}`,
  scrape: (domain: string) => `scrape:${domain}`,
} as const;

/**
 * Cache TTL constants (seconds)
 */
export const cacheTTL = {
  profile: 300,      // 5 minutes
  campaign: 60,      // 1 minute
  leads: 30,         // 30 seconds
  stats: 120,        // 2 minutes
  roast: 3600,       // 1 hour (roasts don't change)
  scrape: 1800,      // 30 minutes
} as const;
