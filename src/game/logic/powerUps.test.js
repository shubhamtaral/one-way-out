import { describe, expect, it } from 'vitest';
import { POWER_UPS, generateRandomPowerUp } from './powerUps';

describe('generateRandomPowerUp', () => {
  it('returns null when roll is above spawn chance', () => {
    const rng = () => 0.9;
    expect(generateRandomPowerUp(rng, 0.2)).toBeNull();
  });

  it('returns a deterministic power-up when roll is within spawn chance', () => {
    const rolls = [0.0, 0.0];
    const rng = () => rolls.shift() ?? 0.0;

    const result = generateRandomPowerUp(rng, 0.2);
    expect(Object.values(POWER_UPS)).toContain(result);
    expect(result).toBe(POWER_UPS.FREEZE_TIME);
  });
});

