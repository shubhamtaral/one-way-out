/**
 * Feature Flags Configuration
 * Toggle features on/off for gradual rollout and A/B testing
 */

export const FEATURES = {
  // Sentence distribution by level ranges
  SENTENCE_DISTRIBUTION: true,
  
  // Anti-repetition system (recently used tracking + variety scoring)
  ANTI_REPETITION: true,
  
  // Personalization features (name, location, preferences)
  PERSONALIZATION: true,
  
  // Playstyle adaptation (dynamic theme weighting)
  PLAYSTYLE_ADAPTATION: true,
  
  // AI-generated daily challenge (disabled for now)
  AI_DAILY_CHALLENGE: false,
  
  // Procedural sentence variations (used for distribution)
  PROCEDURAL_VARIATIONS: true,
};

/**
 * Hook to check if a feature is enabled
 */
export function useFeatureFlag(flagName) {
  // Allow environment variable overrides for staging/testing
  const envOverride = import.meta.env?.VITE_FEATURE_?.toLowerCase?.() === 'true';
  
  // Check if flag exists
  if (!(flagName in FEATURES)) {
    console.warn(`Unknown feature flag: ${flagName}`);
    return false;
  }
  
  // Environment variable takes precedence
  if (import.meta.env?.VITE_FEATURE_?.toLowerCase?.() === 'true') {
    return true;
  }
  
  return FEATURES[flagName];
}

/**
 * Get all enabled features (for analytics)
 */
export function getEnabledFeatures() {
  return Object.entries(FEATURES)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);
}

/**
 * Check if user is in an experiment bucket
 * Simple hash-based bucketing (0-99)
 */
export function getExperimentBucket(userId, experimentName) {
  if (!userId) return 0;
  
  const str = `${experimentName}:${userId}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash) % 100; // 0-99
}

/**
 * Check if user is in a specific experiment variant
 * @param {string} userId - User ID (or null for anonymous)
 * @param {string} experimentName - Name of the experiment
 * @param {number} variantPercent - Percentage of users in this variant (0-100)
 */
export function isInExperiment(userId, experimentName, variantPercent) {
  const bucket = getExperimentBucket(userId, experimentName);
  return bucket < variantPercent;
}
