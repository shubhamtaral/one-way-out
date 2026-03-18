# ☠️ One Way Out

A tense typing survival game. Type fast or die trying.

![One Way Out](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan)

## 🎮 Play Now
(Live Now)
**[one-way-out.tusharkonde.cloud](https://one-way-out.tusharkonde.cloud/)** OR
**[onewayout.shubhamtaral.in](https://onewayout.shubhamtaral.in/)**

## 📖 About

Type each sentence exactly as shown before time runs out. Every mistake costs a life. The clock gets faster. How long can you survive?

Featuring 200+ creepy horror-themed sentences that get progressively more terrifying as you advance.

## ✨ Features

### Core Gameplay
- ⌨️ **Real-time typing validation** — instant feedback on every keystroke
- ⏱️ **Dynamic timer** — starts at 15s, decreases as you level up
- 💀 **Lives system** — 5 mistakes and it's over
- 🔥 **Combo system** — chain perfect sentences for streaks
- 📊 **WPM tracking** — see your typing speed in real-time

### Game Modes
| Mode | Lives | Timer | Description |
|------|-------|-------|-------------|
| 🟢 **Casual** | 7 | Slow (20s→8s) | For beginners |
| 🟡 **Normal** | 5 | Medium (15s→5s) | The standard experience |
| 🔴 **Nightmare** | 3 | Fast (12s→4s) | No mercy |
| 📅 **Daily Challenge** | 5 | Fixed (12s) | Same sentences for everyone, one attempt per day |

### Progression
- 🏆 **17 Achievements** — unlock milestones for levels, combos, WPM, and more
- 📈 **Stats Dashboard** — track your total games, best scores, and improvement
- 🏅 **Personal Bests** — saved locally, compete against yourself

### Social
- 📤 **Share Score** — generate a shareable card with your stats
- 🐦 **Twitter/X Integration** — one-click share to Twitter
- 💬 **WhatsApp Integration** — share with friends directly

### Polish
- 🎨 **Dark horror theme** — black, bone white, blood red
- 🔊 **Atmospheric audio** — heartbeat, keystrokes, horror sounds
- 📱 **Mobile support** — virtual keyboard for touchscreen devices
- ✨ **Visual effects** — screen shake, red flash, timer pulse

## 🛠️ Tech Stack

- **Framework:** React 19
- **Build:** Vite 7
- **Styling:** Tailwind CSS 4
- **Audio:** Web Audio API (procedural sounds)
- **Storage:** localStorage

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/Tusharx1143/one-way-out.git
cd one-way-out

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# (Optional) Build & run Docker image
docker build -t one-way-out .
docker run -p 8080:80 one-way-out
```

## 📁 Project Structure

```
src/
├── components/
│   ├── StartScreen.jsx      # Main menu, difficulty select, stats
│   ├── GameScreen.jsx       # Active gameplay
│   ├── GameOverScreen.jsx   # Death screen with stats
│   ├── SentenceDisplay.jsx  # Sentence rendering with highlighting
│   ├── StatsBar.jsx         # Level, timer, lives, WPM display
│   ├── VirtualKeyboard.jsx  # Mobile touch keyboard
│   ├── ShareCard.jsx        # Social sharing modal
│   ├── AchievementPopup.jsx # Achievement unlock notification
│   └── Creature.jsx         # (Placeholder for future horror elements)
├── hooks/
│   ├── useGame.js           # Core game logic
│   ├── useSound.js          # Audio system
│   └── useStats.js          # Persistent stats & achievements
├── config/
│   ├── difficulty.js        # Difficulty mode settings
│   ├── achievements.js      # Achievement definitions
│   └── dailyChallenge.js    # Daily challenge seeding
└── data/
    └── sentences.json       # 115 horror sentences
```

## 🧱 Architecture (high level)

- **Core game loop (`useGame`)**: Manages game state (mode, difficulty, level, timer, sentences, mistakes, power-ups, streak multiplier, endless lives) and exposes callbacks like `startGame`, `startDailyChallenge`, `startEndlessMode`, and `handleType` for the UI to drive.
- **Stats & achievements (`useStats`)**: Listens for completed games via `recordGame`, updates local stats in `localStorage`, computes new achievements, and schedules leaderboard/Firebase syncs when a user is logged in.
- **Audio system (`useSound`)**: Provides functions (`playKeystroke`, `playError`, `playSuccess`, `playGameOver`, `playTick`, `playWarningTick`, `startHeartbeat`, `updateHeartbeat`, `stopHeartbeat`) that `useGame` calls to keep sound and heartbeat tightly in sync with mistakes and time pressure.
- **Remote services (`services/leaderboard`)**: Wraps Firebase Firestore calls for saving user profiles, pushing scores (normal + daily), fetching leaderboards with time filters, and saving achievements.
- **Config & data (`config/*`, `data/*`)**: Difficulty presets, achievements, daily challenge seeding, and sentence pools live in config/data modules so the hooks stay focused on behavior instead of constants.

## 🏆 Achievements

| Achievement | Requirement |
|-------------|-------------|
| 🌟 Survivor | Reach level 5 |
| ⚔️ Fighter | Reach level 10 |
| 🛡️ Warrior | Reach level 20 |
| 👑 Legend | Reach level 30 |
| 💀 Immortal | Reach level 50 |
| 🔥 Combo Starter | Get a 3x combo |
| 🔥 On Fire | Get a 5x combo |
| 💥 Unstoppable | Get a 10x combo |
| 🦄 Mythical | Get a 15x combo |
| 🌋 Godlike | Get a 20x combo |
| 🔍 Keyboard Searcher | Reach 20 WPM |
| 👆 One Finger Wonder | Reach 30 WPM |
| 📝 Sarkari Babu | Reach 40 WPM |
| 💻 Data Entry Pro | Reach 50 WPM |
| ⌨️ Typist Ji | Reach 60 WPM |
| 🏪 Cyber Cafe Owner | Reach 70 WPM |
| ⚖️ High Court Steno | Reach 80 WPM |
| 🖨️ Typewriter Machine | Reach 90 WPM |
| 📜 Chitragupta | Reach 100 WPM |
| 😈 Nightmare Survivor | Level 10 on Nightmare |
| 👹 Nightmare Master | Level 20 on Nightmare |
| 💀 Nightmare God | Level 30 on Nightmare |
| 🎮 Casual Master | Reach level 30 on Casual |
| 📅 Daily Routine | Play a Daily Challenge |
| 🌞 Daily Master | Reach level 15 in Daily Challenge |
| 📚 Practice Makes Perfect | Practice 10 sentences |
| 🏋️‍♂️ Training Montage | Type 50 perfect sentences in Practice Mode |
| ✨ Perfect Run | 5 levels without mistakes |
| 💎 Flawless Execution | 10 levels without mistakes |
| 🩸 Welcome to Hell | Die for the first time |
| 🎯 Dedicated | Play 10 games |
| 🎮 Regular Player | Play 20 games |
| 🎲 Enthusiast | Play 30 games |
| 🕹️ Addict | Play 40 games |
| 🏅 Veteran | Play 50 games |
| 🔥 Hardcore | Play 60 games |
| 👀 Obsessed | Play 70 games |
| 👻 No Life | Play 80 games |
| 🏠 Resident | Play 90 games |
| 💯 Centurion | Play 100 games |
| 🕶️ Glitch in the System | Discover the secret code |
| 👨‍💻 Developer's Blessing | Summon the creator |
| 👻 Curiosity Killed the Cat | Found the jumpscare secret |
| ⛔ Error 404: Skill Not Found | Die exactly on level 40 |

## 🤫 Secrets & Easter Eggs

There are hidden secrets scattered throughout the game! Some hints for dedicated hunters:
- **Up, Up, Down, Down...** you know the rest. Try it on the main menu.
- **Who made this game?** Maybe typing their GitHub handle will trigger something...
- **"JUMPSCARE"** type it if you dare...
- **404 Not Found:** Precision dying will reward you...

## 📜 License

MIT

## 🤝 Contributing

PRs are very welcome! See `CONTRIBUTING.md` for:
- How to run the project locally (dev, lint, tests)
- Where to add sentences, achievements, and themes
- How Firebase/leaderboards are wired up
- Guidelines for PRs and code style

---

**Type fast. Stay alive. Find your way out.** ☠️
