import { describe, expect, it } from 'vitest';
import { detectSite } from '../../src/core/env';

describe('detectSite', () => {
  it('recognizes instagram hostnames', () => {
    expect(detectSite('www.instagram.com')).toBe('instagram');
    expect(detectSite('instagram.com')).toBe('instagram');
  });

  it('recognizes youtube hostnames', () => {
    expect(detectSite('m.youtube.com')).toBe('youtube');
    expect(detectSite('www.youtube.com')).toBe('youtube');
    expect(detectSite('youtube.com')).toBe('youtube');
  });

  it('returns null for unrelated hostnames', () => {
    expect(detectSite('example.com')).toBeNull();
  });
});
