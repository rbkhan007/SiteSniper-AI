/**
 * Advanced Rate Limiter
 * Sliding window algorithm with per-user and per-IP tracking
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
  blocked: boolean;
  blockedUntil?: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs?: number;
  keyPrefix?: string;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup stale entries every 5 minutes
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  /**
   * Register a rate limit configuration
   */
  register(name: string, config: RateLimitConfig) {
    this.configs.set(name, config);
  }

  /**
   * Check and increment rate limit
   */
  check(
    name: string,
    key: string
  ): { allowed: boolean; remaining: number; resetMs: number } {
    const config = this.configs.get(name);
    if (!config) {
      return { allowed: true, remaining: 999, resetMs: 0 };
    }

    const fullKey = `${config.keyPrefix || name}:${key}`;
    const now = Date.now();
    const entry = this.store.get(fullKey);

    // Check if blocked
    if (entry?.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetMs: entry.blockedUntil - now,
      };
    }

    // New window or expired
    if (!entry || now - entry.windowStart > config.windowMs) {
      this.store.set(fullKey, {
        count: 1,
        windowStart: now,
        blocked: false,
      });
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetMs: config.windowMs,
      };
    }

    // Within window
    if (entry.count >= config.maxRequests) {
      // Block if configured
      if (config.blockDurationMs) {
        entry.blocked = true;
        entry.blockedUntil = now + config.blockDurationMs;
      }
      return {
        allowed: false,
        remaining: 0,
        resetMs: config.windowMs - (now - entry.windowStart),
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetMs: config.windowMs - (now - entry.windowStart),
    };
  }

  /**
   * Get rate limit headers
   */
  getHeaders(name: string, key: string): Record<string, string> {
    const config = this.configs.get(name);
    if (!config) return {};

    const result = this.check(name, key);
    return {
      "X-RateLimit-Limit": String(config.maxRequests),
      "X-RateLimit-Remaining": String(result.remaining),
      "X-RateLimit-Reset": String(Math.ceil(result.resetMs / 1000)),
      ...(result.allowed ? {} : { "Retry-After": String(Math.ceil(result.resetMs / 1000)) }),
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      const config = this.configs.get(key.split(":")[0]);
      if (config && now - entry.windowStart > config.windowMs * 2) {
        this.store.delete(key);
      }
    }
  }

  stats() {
    return {
      entries: this.store.size,
      configs: Array.from(this.configs.keys()),
    };
  }
}

// Singleton
const globalForRateLimiter = globalThis as unknown as {
  rateLimiter: RateLimiter | undefined;
};

export const rateLimiter = globalForRateLimiter.rateLimiter ?? new RateLimiter();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimiter.rateLimiter = rateLimiter;
}

// Register default configurations
rateLimiter.register("public-api", {
  windowMs: 60 * 1000,     // 1 minute
  maxRequests: 10,
  keyPrefix: "ratelimit:public",
});

rateLimiter.register("pipeline", {
  windowMs: 60 * 1000,     // 1 minute
  maxRequests: 20,
  blockDurationMs: 60 * 1000,  // Block for 1 minute on abuse
  keyPrefix: "ratelimit:pipeline",
});

rateLimiter.register("auth", {
  windowMs: 15 * 60 * 1000,  // 15 minutes
  maxRequests: 5,
  blockDurationMs: 30 * 60 * 1000,  // Block for 30 minutes
  keyPrefix: "ratelimit:auth",
});

rateLimiter.register("bulk-upload", {
  windowMs: 60 * 1000,
  maxRequests: 5,
  keyPrefix: "ratelimit:bulk",
});
