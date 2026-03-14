import { describe, expect, it } from 'vitest';
import { computeStreakMultiplier } from './streakMultiplier';

describe('computeStreakMultiplier', () => {
  it('is 1x below 5 combo', () => {
    expect(computeStreakMultiplier(0)).toBe(1);
    expect(computeStreakMultiplier(4)).toBe(1);
  });

  it('matches the in-game multiplier math', () => {
    expect(computeStreakMultiplier(5)).toBe(1);
    expect(computeStreakMultiplier(8)).toBe(1);
    expect(computeStreakMultiplier(9)).toBe(1.5);
    expect(computeStreakMultiplier(14)).toBe(2);
  });
});

