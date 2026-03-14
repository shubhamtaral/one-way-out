import { describe, expect, it } from 'vitest';
import { computeWpm } from './wpm';

describe('computeWpm', () => {
  it('returns 0 when start time missing', () => {
    expect(computeWpm({ totalChars: 50, startMs: null, nowMs: Date.now() })).toBe(0);
  });

  it('returns 0 when elapsed time too small', () => {
    const startMs = 1000;
    const nowMs = startMs + 100; // ~0.0016 min
    expect(computeWpm({ totalChars: 50, startMs, nowMs })).toBe(0);
  });

  it('computes capped WPM', () => {
    const startMs = 0;
    const nowMs = 60_000; // 1 minute
    const wpm = computeWpm({ totalChars: 5000, startMs, nowMs, cap: 250 });
    expect(wpm).toBe(250);
  });
});

