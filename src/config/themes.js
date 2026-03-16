export const THEMES = {
  normal: {
    id: 'normal',
    name: 'Normal',
    icon: '👻',
    colors: {
      bone: '#D4AF37',
      bloodBright: '#FF4444',
      void: '#0a0a0a',
    },
    unlocked: true,
  },
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    icon: '🌙',
    colors: {
      bone: '#888888',
      bloodBright: '#CC3333',
      void: '#0a0a0a',
    },
    unlockedBy: 'fighter', // Reach level 10
  },
  bloodRed: {
    id: 'bloodRed',
    name: 'Blood Red',
    icon: '🩸',
    colors: {
      bone: '#FF6666',
      bloodBright: '#FF0000',
      void: '#330000',
    },
    unlockedBy: 'legend', // Reach level 30
  },
  neon: {
    id: 'neon',
    name: 'Neon Nightmare',
    icon: '⚡',
    colors: {
      bone: '#FF00FF', // Neon Magenta
      bloodBright: '#00FFFF', // Neon Cyan
      void: '#120422', // Deep Space Purple
    },
    unlockedBy: 'wpm50', // Reach 50 WPM
  },
  ice: {
    id: 'ice',
    name: 'Frozen Wasteland',
    icon: '❄️',
    colors: {
      bone: '#00FFFF',
      bloodBright: '#00CCFF',
      void: '#001a33',
    },
    unlockedBy: 'addict', // Play 40 games
  },
  matrix: {
    id: 'matrix',
    name: 'The Matrix',
    icon: '🕶️',
    colors: {
      bone: '#00FF41',
      bloodBright: '#008F11',
      void: '#000000',
    },
    unlockedBy: 'theMatrix', // Easter egg
  },
};

export function getUnlockedThemes(achievements) {
  const unlocked = {};

  Object.entries(THEMES).forEach(([key, theme]) => {
    if (theme.unlocked) {
      unlocked[key] = theme;
    } else if (theme.unlockedBy && achievements?.includes(theme.unlockedBy)) {
      unlocked[key] = theme;
    }
  });

  return unlocked;
}

export function applyTheme(themeId) {
  const theme = THEMES[themeId];
  if (!theme) return;

  const root = document.documentElement;
  root.style.setProperty('--color-bone', theme.colors.bone);
  root.style.setProperty('--color-blood-bright', theme.colors.bloodBright);
  root.style.setProperty('--color-void', theme.colors.void);

  localStorage.setItem('oneWayOut_selectedTheme', themeId);
}

export function initTheme() {
  const savedTheme = localStorage.getItem('oneWayOut_selectedTheme') || 'normal';
  applyTheme(savedTheme);
  return savedTheme;
}
