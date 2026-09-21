const STORE_SALT = 83719;

/**
 * Encodes a numeric store ID into an obfuscated, non-sequential token
 * to prevent sequential URL traversal and enumeration (e.g., store 1, 2, 3...).
 */
export function encodeStoreId(storeId: number): string {
  try {
    const raw = `opt_${storeId * STORE_SALT}_${storeId}`;
    return 'sp_' + btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return String(storeId);
  }
}

/**
 * Decodes a secure store token back into its numeric store ID.
 * Returns null if the token is invalid or tampered with.
 */
export function decodeStoreId(token?: string): number | null {
  if (!token || token === 'my') return null;

  if (token.startsWith('sp_')) {
    try {
      let base64 = token.slice(3).replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      const decoded = atob(base64);
      const match = decoded.match(/^opt_(\d+)_(\d+)$/);
      if (match) {
        const computed = Number(match[1]);
        const id = Number(match[2]);
        if (computed === id * STORE_SALT && id > 0) {
          return id;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  // Fallback for legacy numeric IDs
  const num = Number(token);
  if (Number.isInteger(num) && num > 0) {
    return num;
  }
  return null;
}

