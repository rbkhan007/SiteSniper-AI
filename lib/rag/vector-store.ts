/**
 * In-Memory Vector Store for RAG
 * Stores embeddings with metadata for semantic search
 */

import { cosineSimilarity, generateEmbedding, chunkText } from "./embeddings";

export interface VectorEntry {
  id: string;
  text: string;
  embedding: number[];
  metadata: Record<string, unknown>;
  createdAt: number;
}

export interface SearchResult {
  id: string;
  text: string;
  score: number;
  metadata: Record<string, unknown>;
}

class VectorStore {
  private entries: Map<string, VectorEntry> = new Map();
  private maxEntries: number = 10000;
  private ttlMs: number = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Store text with its embedding
   */
  async add(
    id: string,
    text: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    const { embedding } = await generateEmbedding(text);
    
    this.entries.set(id, {
      id,
      text,
      embedding,
      metadata,
      createdAt: Date.now(),
    });

    // Evict old entries if over limit
    if (this.entries.size > this.maxEntries) {
      this.evictOldest();
    }
  }

  /**
   * Add text with automatic chunking
   */
  async addChunked(
    baseId: string,
    text: string,
    metadata: Record<string, unknown> = {}
  ): Promise<number> {
    const chunks = chunkText(text, 500, 100);
    
    for (let i = 0; i < chunks.length; i++) {
      await this.add(`${baseId}:chunk:${i}`, chunks[i], {
        ...metadata,
        chunkIndex: i,
        totalChunks: chunks.length,
      });
    }

    return chunks.length;
  }

  /**
   * Semantic search - find most relevant entries
   */
  async search(
    query: string,
    topK: number = 5,
    minScore: number = 0.5
  ): Promise<SearchResult[]> {
    const { embedding: queryEmbedding } = await generateEmbedding(query);

    const scored: SearchResult[] = [];

    for (const entry of this.entries.values()) {
      if (entry.embedding.length === 0) continue;
      
      const score = cosineSimilarity(queryEmbedding, entry.embedding);
      
      if (score >= minScore) {
        scored.push({
          id: entry.id,
          text: entry.text,
          score,
          metadata: entry.metadata,
        });
      }
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * Get cached result by domain (for deduplication)
   */
  getCached(domain: string): VectorEntry | undefined {
    for (const entry of this.entries.values()) {
      if (
        entry.metadata.domain === domain &&
        entry.metadata.type === "analysis" &&
        Date.now() - entry.createdAt < this.ttlMs
      ) {
        return entry;
      }
    }
    return undefined;
  }

  /**
   * Remove entry by ID
   */
  delete(id: string): boolean {
    return this.entries.delete(id);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.entries.clear();
  }

  /**
   * Get store stats
   */
  stats() {
    return {
      size: this.entries.size,
      maxEntries: this.maxEntries,
      ttlHours: this.ttlMs / (1000 * 60 * 60),
    };
  }

  private evictOldest(): void {
    const entries = Array.from(this.entries.values())
      .sort((a, b) => a.createdAt - b.createdAt);

    const toRemove = entries.slice(0, Math.floor(this.maxEntries * 0.1));
    for (const entry of toRemove) {
      this.entries.delete(entry.id);
    }
  }
}

// Singleton instance
const globalForVectorStore = globalThis as unknown as {
  vectorStore: VectorStore | undefined;
};

export const vectorStore = globalForVectorStore.vectorStore ?? new VectorStore();

if (process.env.NODE_ENV !== "production") {
  globalForVectorStore.vectorStore = vectorStore;
}
