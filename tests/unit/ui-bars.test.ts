import { describe, expect, it } from 'vitest';
import { computeBarHeights } from '../../src/core/ui/bars';

describe('computeBarHeights', () => {
  it('scales the max value to 100%', () => {
    const heights = computeBarHeights([
      { label: 'a', value: 10 },
      { label: 'b', value: 20 },
    ]);
    expect(heights[1]?.heightPercent).toBe(100);
    expect(heights[0]?.heightPercent).toBe(50);
  });

  it('gives every bar 0% when all values are zero', () => {
    const heights = computeBarHeights([
      { label: 'a', value: 0 },
      { label: 'b', value: 0 },
    ]);
    expect(heights.every((h) => h.heightPercent === 0)).toBe(true);
  });

  it('preserves label and value alongside the computed height', () => {
    const heights = computeBarHeights([{ label: 'lun', value: 42 }]);
    expect(heights[0]).toEqual({ label: 'lun', value: 42, heightPercent: 100 });
  });
});
