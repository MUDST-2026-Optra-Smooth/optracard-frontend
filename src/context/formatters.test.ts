import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate } from './formatters';

describe('formatters unit tests', () => {
  describe('formatPrice', () => {
    it('formats numbers into Thai Baht currency format', () => {
      const formatted = formatPrice(1500);
      // In th-TH, 1500 becomes ฿1,500.00 (with possible non-breaking space)
      expect(formatted).toContain('1,500');
      expect(formatted).toMatch(/฿|THB/);
    });

    it('formats zero correctly', () => {
      const formatted = formatPrice(0);
      expect(formatted).toContain('0');
      expect(formatted).toMatch(/฿|THB/);
    });
  });

  describe('formatDate', () => {
    it('formats ISO dates into en-GB day/month/year format', () => {
      const formatted = formatDate('2026-05-15T10:00:00Z');
      expect(formatted).toBe('15/05/2026');
    });

    it('handles short date formats correctly', () => {
      const formatted = formatDate('2026-12-01');
      expect(formatted).toBe('01/12/2026');
    });
  });
});

