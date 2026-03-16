import { POWER_UPS } from '../game/logic/powerUps';

export function PowerUpsUI({ activePowerUps, currentLevelPowerUp }) {
  const getPowerUpIcon = (powerUp) => {
    switch (powerUp) {
      case POWER_UPS.FREEZE_TIME:
        return '❄️';
      case POWER_UPS.SHIELD:
        return '🛡️';
      case POWER_UPS.EXTRA_LIFE:
        return '💚';
      case POWER_UPS.SLOW_MOTION:
        return '⏳';
      case POWER_UPS.DOUBLE_POINTS:
        return '⚡';
      default:
        return '✨';
    }
  };

  const getPowerUpName = (powerUp) => {
    switch (powerUp) {
      case POWER_UPS.FREEZE_TIME:
        return 'Freeze Time';
      case POWER_UPS.SHIELD:
        return 'Shield';
      case POWER_UPS.EXTRA_LIFE:
        return 'Extra Life';
      case POWER_UPS.SLOW_MOTION:
        return 'Slow Motion';
      case POWER_UPS.DOUBLE_POINTS:
        return 'Double Points';
      default:
        return 'Power-up';
    }
  };

  const getPowerUpColor = (powerUp) => {
    switch (powerUp) {
      case POWER_UPS.FREEZE_TIME:
        return 'text-blue-400 animate-pulse';
      case POWER_UPS.SHIELD:
        return 'text-yellow-400 animate-pulse';
      case POWER_UPS.EXTRA_LIFE:
        return 'text-green-400 animate-pulse';
      case POWER_UPS.SLOW_MOTION:
        return 'text-purple-400 animate-pulse';
      case POWER_UPS.DOUBLE_POINTS:
        return 'text-red-400 animate-pulse';
      default:
        return 'text-cyan-400 animate-pulse';
    }
  };

  return (
    <div className="space-y-3">
      {/* Active Power-ups */}
      {activePowerUps.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {activePowerUps.map((powerUp, idx) => (
            <div
              key={idx}
              className={`px-3 py-1 rounded border border-${getPowerUpColor(powerUp).split(' ')[0].split('-')[1]}-400/50 bg-${getPowerUpColor(powerUp).split(' ')[0].split('-')[1]}-400/10 backdrop-blur-sm`}
            >
              <span className={getPowerUpColor(powerUp)}>
                {getPowerUpIcon(powerUp)} {getPowerUpName(powerUp)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Available Power-up Next Level */}
      {currentLevelPowerUp && (
        <div className="text-xs text-[var(--color-bone)]/50 flex items-center gap-2">
          <span>Next level:</span>
          <span className={getPowerUpColor(currentLevelPowerUp)}>
            {getPowerUpIcon(currentLevelPowerUp)}
          </span>
        </div>
      )}
    </div>
  );
}
