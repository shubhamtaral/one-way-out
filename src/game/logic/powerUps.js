export const POWER_UPS = {
  FREEZE_TIME: 'freeze_time', // +5 seconds
  SHIELD: 'shield', // Next mistake doesn't count
  EXTRA_LIFE: 'extra_life', // Regain a life
  SLOW_MOTION: 'slow_motion', // Timer runs at half speed
  DOUBLE_POINTS: 'double_points', // Multiplier is doubled
};

export const POWER_UP_SPAWN_CHANCE = 0.25; // 25% chance per sentence

export function generateRandomPowerUp(rng = Math.random, spawnChance = POWER_UP_SPAWN_CHANCE) {
  if (rng() > spawnChance) return null;
  const types = Object.values(POWER_UPS);
  return types[Math.floor(rng() * types.length)];
}

