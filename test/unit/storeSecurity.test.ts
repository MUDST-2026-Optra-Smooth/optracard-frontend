import { describe, it, expect } from 'vitest';
import { encodeStoreId, decodeStoreId } from '../../src/utils/storeSecurity';

describe('storeSecurity unit tests', () => {
  it('encodes store IDs into obfuscated tokens starting with sp_', () => {
    const token = encodeStoreId(42);
    expect(token).toMatch(/^sp_[A-Za-z0-9_-]+$/);
  });

  it('correctly decodes a valid generated token', () => {
    const originalId = 99;
    const token = encodeStoreId(originalId);
    const decodedId = decodeStoreId(token);
    expect(decodedId).toBe(originalId);
  });

  it('supports legacy numeric IDs for backwards compatibility', () => {
    expect(decodeStoreId('123')).toBe(123);
    expect(decodeStoreId('1')).toBe(1);
  });

  it('rejects invalid or tampered tokens', () => {
    expect(decodeStoreId('sp_invalidbase64!@#')).toBeNull();
    expect(decodeStoreId('sp_dGFtcGVyZWQ=')).toBeNull();
    expect(decodeStoreId('not_a_valid_id')).toBeNull();
    expect(decodeStoreId('-5')).toBeNull();
    expect(decodeStoreId('0')).toBeNull();
  });

  it('handles null, undefined, and the special "my" token', () => {
    expect(decodeStoreId(undefined)).toBeNull();
    expect(decodeStoreId('')).toBeNull();
    expect(decodeStoreId('my')).toBeNull();
  });
});

