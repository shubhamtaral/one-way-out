import { describe, expect, it } from 'vitest';
import { getSentenceForLevel } from './sentences';

describe('getSentenceForLevel', () => {
  it('returns daily challenge sentence by index when sentencePool is provided', () => {
    const pool = [
      { text: 'A', level: 1 },
      { text: 'B', level: 1 },
      { text: 'C', level: 1 },
    ];

    expect(getSentenceForLevel(1, 'normal', pool).text).toBe('A');
    expect(getSentenceForLevel(2, 'normal', pool).text).toBe('B');
    expect(getSentenceForLevel(99, 'normal', pool).text).toBe('C');
  });

  it('avoids repeating the immediately previous sentence when possible', () => {
    const pool = [
      { text: 'SAME', level: 1 },
      { text: 'OTHER', level: 1 },
    ];

    const rng = () => 0;
    const picked = getSentenceForLevel(1, 'casual', null, 'SAME', 0, rng, pool);
    expect(picked.text).toBe('OTHER');
  });

  it('adjusts effective level upward for high WPM', () => {
    const pool = [
      { text: 'L1', level: 1 },
      { text: 'L3', level: 3 },
    ];

    const rng = () => 0.9999;
    const picked = getSentenceForLevel(1, 'casual', null, null, 200, rng, pool);
    expect(picked.text).toBe('L3');
  });
});

