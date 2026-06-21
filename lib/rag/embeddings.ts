/**
 * RAG Embeddings System
 * Local TF-IDF based vector generation — no external API required.
 * Produces lightweight sparse vectors for semantic similarity.
 */

export interface EmbeddingResult {
  embedding: number[];
  dimension: number;
}

export interface ChunkWithScore {
  chunk: string;
  score: number;
  metadata?: Record<string, unknown>;
}

const VOCAB_SIZE = 2048;
const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "both",
  "each", "few", "more", "most", "other", "some", "such", "no", "nor",
  "not", "only", "own", "same", "so", "than", "too", "very", "just",
  "don", "now", "and", "but", "or", "if", "this", "that", "these",
  "those", "it", "its", "i", "me", "my", "we", "our", "you", "your",
  "he", "him", "his", "she", "her", "they", "them", "their", "what",
  "which", "who", "whom",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

function hashToken(token: string): number {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    hash = ((hash << 5) - hash + token.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % VOCAB_SIZE;
}

function tfidfVector(tokens: string[]): number[] {
  const vec = new Array(VOCAB_SIZE).fill(0);
  const freq: Record<string, number> = {};

  for (const t of tokens) {
    freq[t] = (freq[t] || 0) + 1;
  }

  for (const [token, count] of Object.entries(freq)) {
    const idx = hashToken(token);
    // Log-scaled TF: 1 + log(count)
    vec[idx] += 1 + Math.log(count);
  }

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < VOCAB_SIZE; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < VOCAB_SIZE; i++) vec[i] /= norm;

  return vec;
}

/**
 * Generate embeddings for a single text (local TF-IDF)
 */
export function generateEmbedding(text: string): EmbeddingResult {
  const tokens = tokenize(text);
  const embedding = tfidfVector(tokens);
  return { embedding, dimension: VOCAB_SIZE };
}

/**
 * Generate embeddings for multiple texts
 */
export function generateEmbeddings(texts: string[]): EmbeddingResult[] {
  return texts.map((text) => generateEmbedding(text));
}

/**
 * Cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Chunk text into overlapping segments for RAG
 */
export function chunkText(
  text: string,
  chunkSize: number = 500,
  overlap: number = 100
): string[] {
  const chunks: string[] = [];
  const words = text.split(/\s+/);

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
    if (i + chunkSize >= words.length) break;
  }

  return chunks;
}
