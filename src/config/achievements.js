export const ACHIEVEMENTS = {
  // Level achievements
  survivor: {
    id: 'survivor',
    name: 'Survivor',
    description: 'Reach level 5',
    icon: '🌟',
    check: (stats) => stats.level >= 5,
  },
  fighter: {
    id: 'fighter',
    name: 'Fighter',
    description: 'Reach level 10',
    icon: '⚔️',
    check: (stats) => stats.level >= 10,
  },
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    description: 'Reach level 20',
    icon: '🛡️',
    check: (stats) => stats.level >= 20,
  },
  legend: {
    id: 'legend',
    name: 'Legend',
    description: 'Reach level 30',
    icon: '👑',
    check: (stats) => stats.level >= 30,
  },
  immortal: {
    id: 'immortal',
    name: 'Immortal',
    description: 'Reach level 50',
    icon: '💀',
    check: (stats) => stats.level >= 50,
  },

  // Combo achievements
  combo3: {
    id: 'combo3',
    name: 'Combo Starter',
    description: 'Get a 3x combo',
    icon: '🔥',
    check: (stats) => stats.maxCombo >= 3,
  },
  combo5: {
    id: 'combo5',
    name: 'On Fire',
    description: 'Get a 5x combo',
    icon: '🔥',
    check: (stats) => stats.maxCombo >= 5,
  },
  combo10: {
    id: 'combo10',
    name: 'Unstoppable',
    description: 'Get a 10x combo',
    icon: '💥',
    check: (stats) => stats.maxCombo >= 10,
  },
  combo15: {
    id: 'combo15',
    name: 'Mythical',
    description: 'Get a 15x combo',
    icon: '🦄',
    check: (stats) => stats.maxCombo >= 15,
  },
  combo20: {
    id: 'combo20',
    name: 'Godlike',
    description: 'Get a 20x combo',
    icon: '🌋',
    check: (stats) => stats.maxCombo >= 20,
  },

  // WPM achievements
  wpm20: {
    id: 'wpm20',
    name: 'Keyboard Searcher',
    description: 'Reach 20 WPM',
    icon: '🔍',
    check: (stats) => stats.wpm >= 20,
  },
  wpm30: {
    id: 'wpm30',
    name: 'One Finger Wonder',
    description: 'Reach 30 WPM',
    icon: '👆',
    check: (stats) => stats.wpm >= 30,
  },
  wpm40: {
    id: 'wpm40',
    name: 'Sarkari Babu',
    description: 'Reach 40 WPM',
    icon: '📝',
    check: (stats) => stats.wpm >= 40,
  },
  wpm50: {
    id: 'wpm50',
    name: 'Data Entry Pro',
    description: 'Reach 50 WPM',
    icon: '💻',
    check: (stats) => stats.wpm >= 50,
  },
  wpm60: {
    id: 'wpm60',
    name: 'Typist Ji',
    description: 'Reach 60 WPM',
    icon: '⌨️',
    check: (stats) => stats.wpm >= 60,
  },
  wpm70: {
    id: 'wpm70',
    name: 'Cyber Cafe Owner',
    description: 'Reach 70 WPM',
    icon: '🏪',
    check: (stats) => stats.wpm >= 70,
  },
  wpm80: {
    id: 'wpm80',
    name: 'High Court Steno',
    description: 'Reach 80 WPM',
    icon: '⚖️',
    check: (stats) => stats.wpm >= 80,
  },
  wpm90: {
    id: 'wpm90',
    name: 'Typewriter Machine',
    description: 'Reach 90 WPM',
    icon: '🖨️',
    check: (stats) => stats.wpm >= 90,
  },
  wpm100: {
    id: 'wpm100',
    name: 'Chitragupta',
    description: 'Reach 100 WPM',
    icon: '📜',
    check: (stats) => stats.wpm >= 100,
  },

  // Difficulty achievements
  nightmareWin: {
    id: 'nightmareWin',
    name: 'Nightmare Survivor',
    description: 'Reach level 10 on Nightmare',
    icon: '😈',
    check: (stats) => stats.difficulty === 'nightmare' && stats.level >= 10,
  },
  nightmareMaster: {
    id: 'nightmareMaster',
    name: 'Nightmare Master',
    description: 'Reach level 20 on Nightmare',
    icon: '👹',
    check: (stats) => stats.difficulty === 'nightmare' && stats.level >= 20,
  },
  nightmareGod: {
    id: 'nightmareGod',
    name: 'Nightmare God',
    description: 'Reach level 30 on Nightmare',
    icon: '💀',
    check: (stats) => stats.difficulty === 'nightmare' && stats.level >= 30,
  },
  casualMaster: {
    id: 'casualMaster',
    name: 'Casual Master',
    description: 'Reach level 30 on Casual',
    icon: '🎮',
    check: (stats) => stats.difficulty === 'casual' && stats.level >= 30,
  },

  // Game Mode achievements
  dailyPlayer: {
    id: 'dailyPlayer',
    name: 'Daily Routine',
    description: 'Play a Daily Challenge',
    icon: '📅',
    check: (stats) => stats.gameMode === 'daily',
  },
  dailyMaster: {
    id: 'dailyMaster',
    name: 'Daily Master',
    description: 'Reach level 15 in Daily Challenge',
    icon: '🌞',
    check: (stats) => stats.gameMode === 'daily' && stats.level >= 15,
  },
  practiceNovice: {
    id: 'practiceNovice',
    name: 'Practice Makes Perfect',
    description: 'Practice 10 sentences',
    icon: '📚',
    check: (stats) => stats.gameMode === 'practice' && stats.totalPractice >= 10,
  },
  practiceMaster: {
    id: 'practiceMaster',
    name: 'Training Montage',
    description: 'Type 50 perfect sentences in Practice Mode',
    icon: '🏋️‍♂️',
    check: (stats) => stats.gameMode === 'practice' && stats.practicePerfect >= 50,
  },

  // Special achievements
  perfect5: {
    id: 'perfect5',
    name: 'Perfect Run',
    description: 'Complete 5 levels without mistakes',
    icon: '✨',
    check: (stats) => stats.perfectStreak >= 5,
  },
  perfect10: {
    id: 'perfect10',
    name: 'Flawless Execution',
    description: 'Complete 10 levels without mistakes',
    icon: '💎',
    check: (stats) => stats.perfectStreak >= 10,
  },
  firstDeath: {
    id: 'firstDeath',
    name: 'Welcome to Hell',
    description: 'Die for the first time',
    icon: '🩸',
    check: (stats) => stats.totalGames >= 1,
  },
  dedicated: {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Play 10 games',
    icon: '🎯',
    check: (stats) => stats.totalGames >= 10,
  },
  played20: {
    id: 'played20',
    name: 'Regular Player',
    description: 'Play 20 games',
    icon: '🎮',
    check: (stats) => stats.totalGames >= 20,
  },
  played30: {
    id: 'played30',
    name: 'Enthusiast',
    description: 'Play 30 games',
    icon: '🎲',
    check: (stats) => stats.totalGames >= 30,
  },
  played40: {
    id: 'played40',
    name: 'Addict',
    description: 'Play 40 games',
    icon: '🕹️',
    check: (stats) => stats.totalGames >= 40,
  },
  veteran: {
    id: 'veteran',
    name: 'Veteran',
    description: 'Play 50 games',
    icon: '🏅',
    check: (stats) => stats.totalGames >= 50,
  },
  played60: {
    id: 'played60',
    name: 'Hardcore',
    description: 'Play 60 games',
    icon: '🔥',
    check: (stats) => stats.totalGames >= 60,
  },
  played70: {
    id: 'played70',
    name: 'Obsessed',
    description: 'Play 70 games',
    icon: '👀',
    check: (stats) => stats.totalGames >= 70,
  },
  played80: {
    id: 'played80',
    name: 'No Life',
    description: 'Play 80 games',
    icon: '👻',
    check: (stats) => stats.totalGames >= 80,
  },
  played90: {
    id: 'played90',
    name: 'Resident',
    description: 'Play 90 games',
    icon: '🏠',
    check: (stats) => stats.totalGames >= 90,
  },
  played100: {
    id: 'played100',
    name: 'Centurion',
    description: 'Play 100 games',
    icon: '💯',
    check: (stats) => stats.totalGames >= 100,
  },
  
  // Secret / Easter Egg achievements
  theMatrix: {
    id: 'theMatrix',
    name: 'Glitch in the System',
    description: 'Discover the secret code',
    icon: '🕶️',
    check: (stats) => stats.konamiCodeUnlocked === true,
  },
  devBlessing: {
    id: 'devBlessing',
    name: 'Developer\'s Blessing',
    description: 'Summon the creator',
    icon: '👨‍💻',
    check: (stats) => stats.creatorUnlocked === true,
  },
  jumpscare: {
    id: 'jumpscare',
    name: 'Curiosity Killed the Cat',
    description: 'Found the jumpscare secret',
    icon: '👻',
    check: (stats) => stats.jumpscareUnlocked === true,
  },
  error404: {
    id: 'error404',
    name: 'Error 404: Skill Not Found',
    description: 'Die exactly on level 40',
    icon: '⛔',
    check: (stats) => stats.error404Unlocked === true,
  },

  // Story achievements
  story_last_commute: {
    id: 'story_last_commute',
    name: 'End of the Line',
    description: 'Complete "The Last Commute"',
    icon: '🚇',
    check: (stats) => stats.story_last_commuteUnlocked === true,
  },
  story_notification: {
    id: 'story_notification',
    name: 'Read Receipt',
    description: 'Complete "Unread"',
    icon: '📱',
    check: (stats) => stats.story_notificationUnlocked === true,
  },
  story_overnight: {
    id: 'story_overnight',
    name: 'Clocking Out',
    description: 'Complete "Overnight Shift"',
    icon: '🏢',
    check: (stats) => stats.story_overnightUnlocked === true,
  },
  story_grocery_run: {
    id: 'story_grocery_run',
    name: 'Price Check',
    description: 'Complete "Aisle 9"',
    icon: '🛒',
    check: (stats) => stats.story_grocery_runUnlocked === true,
  },
  story_the_neighbour: {
    id: 'story_the_neighbour',
    name: 'Next Door',
    description: 'Complete "Unit 4B"',
    icon: '🔑',
    check: (stats) => stats.story_the_neighbourUnlocked === true,
  },
};

export function getUnlockedAchievements(stats) {
  return Object.values(ACHIEVEMENTS).filter(a => a.check(stats));
}

export function getNewAchievements(stats, previouslyUnlocked = []) {
  const currentUnlocked = getUnlockedAchievements(stats);
  return currentUnlocked.filter(a => !previouslyUnlocked.includes(a.id));
}
