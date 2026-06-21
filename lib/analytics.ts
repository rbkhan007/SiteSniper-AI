import { getAdminPB } from "@/lib/auth";

async function getPB() {
  return await getAdminPB();
}

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  userId?: string;
  timestamp: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private maxEvents: number = 1000;

  /**
   * Track an event — writes to database + in-memory cache
   */
  async track(
    event: string,
    properties?: Record<string, unknown>,
    userId?: string
  ) {
    this.events.push({
      event,
      properties,
      userId,
      timestamp: Date.now(),
    });

    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    try {
      const pb = await getPB();
      await pb.collection("analytics_events").create({
        event,
        properties: properties ? JSON.stringify(properties) : "",
        user: userId || "",
      });
    } catch {
      // Silently fail — don't block user flow for analytics
    }
  }

  /**
   * Get event count by type from database
   */
  async getEventCounts(): Promise<Record<string, number>> {
    try {
      const pb = await getPB();
      const results = await pb.collection("analytics_events").getList(1, 1000);
      const counts: Record<string, number> = {};
      for (const e of results.items) {
        counts[e.event] = (counts[e.event] || 0) + 1;
      }
      return counts;
    } catch {
      // Fallback to in-memory
      const counts: Record<string, number> = {};
      for (const e of this.events) {
        counts[e.event] = (counts[e.event] || 0) + 1;
      }
      return counts;
    }
  }

  /**
   * Get recent events from database
   */
  async getRecent(limit: number = 50): Promise<AnalyticsEvent[]> {
    try {
      const pb = await getPB();
      const events = await pb.collection("analytics_events").getList(1, limit);
      events.items.sort((a: any, b: any) => (b.created > a.created ? 1 : -1));
      return events.items.map((e) => ({
        event: e.event,
        properties: e.properties ? JSON.parse(e.properties) : {},
        userId: e.user || undefined,
        timestamp: new Date(e.created).getTime(),
      }));
    } catch {
      return this.events.slice(-limit);
    }
  }

  /**
   * Get stats
   */
  async stats() {
    const counts = await this.getEventCounts();
    const totalEvents = Object.values(counts).reduce((a, b) => a + b, 0);
    return {
      totalEvents,
      eventTypes: Object.keys(counts).length,
      oldestEvent: this.events[0]?.timestamp,
      newestEvent: this.events[this.events.length - 1]?.timestamp,
    };
  }
}

const globalForAnalytics = globalThis as unknown as {
  analytics: Analytics | undefined;
};

export const analytics = globalForAnalytics.analytics ?? new Analytics();

if (process.env.NODE_ENV !== "production") {
  globalForAnalytics.analytics = analytics;
}

// Convenience tracking functions (async, fire-and-forget)
export const track = {
  roast: (domain: string, userId?: string) =>
    analytics.track("roast_generated", { domain }, userId),
  emailSent: (domain: string, email: string, userId?: string) =>
    analytics.track("email_sent", { domain, email }, userId),
  campaignCreated: (campaignId: string, userId?: string) =>
    analytics.track("campaign_created", { campaignId }, userId),
  bulkUpload: (campaignId: string, count: number, userId?: string) =>
    analytics.track("bulk_upload", { campaignId, count }, userId),
  upgrade: (tier: string, userId?: string) =>
    analytics.track("upgrade_initiated", { tier }, userId),
  login: (userId?: string) =>
    analytics.track("user_login", {}, userId),
};
