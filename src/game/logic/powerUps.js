export const POWER_UPS = {
  FREEZE_TIME: 'freeze_time', // +5 seconds
  SHIELD: 'shield', // Next mistake doesn't count
  EXTRA_LIFE: 'extra_life', // Regain a life
  SLOW_MOTION: 'slow_motion', // Timer runs at half speed
  DOUBLE_POINTS: 'double_points', // Multiplier is doubled
};

export const POWER_UP_SPAWN_CHANCE = 0.25; // 25% chance per sentence

export function getPowerUpChance(level) {
  // Increase chance by 2% every 3 levels
  const extraChance = Math.floor((level - 1) / 3) * 0.02;
  return Math.min(0.5, POWER_UP_SPAWN_CHANCE + extraChance); // Cap at 50%
}

export function generateRandomPowerUp(rng = Math.random, level = 1) {
  const spawnChance = getPowerUpChance(level);
  if (rng() > spawnChance) return null;
  const types = Object.values(POWER_UPS);
  return types[Math.floor(rng() * types.length)];
}

