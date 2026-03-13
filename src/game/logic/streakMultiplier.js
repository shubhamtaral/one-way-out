export function computeStreakMultiplier(combo) {
  return 1 + (combo >= 5 ? Math.floor((combo - 4) / 5) * 0.5 : 0);
}

