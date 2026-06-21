/**
 * Security Utilities
 * Input sanitization, CSP, and protection helpers
 */

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate domain format
 */
export function isValidDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

/**
 * Sanitize domain input
 */
export function sanitizeDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-z0-9.-]/g, "");
}

/**
 * Generate nonce for CSP
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * Check if request is from a trusted origin
 */
export function isTrustedOrigin(origin: string): boolean {
  const trusted = [
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000",
    "https://localhost:3000",
  ].filter(Boolean);

  return trusted.includes(origin);
}

/**
 * Mask sensitive data for logging
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const maskedLocal = local[0] + "***" + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
}

/**
 * Mask API key for logging
 */
export function maskApiKey(key: string): string {
  if (key.length <= 8) return "***";
  return key.slice(0, 4) + "***" + key.slice(-4);
}
