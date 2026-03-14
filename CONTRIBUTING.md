## Contributing to One Way Out

Thanks for your interest in contributing to **One Way Out** – a tense horror typing game. This document covers how to run the project, where things live, and how to propose changes safely.

---

## Local setup

1. **Clone and install**

```bash
git clone https://github.com/Tusharx1143/one-way-out.git
cd one-way-out
npm install
```

2. **Run the dev server**

```bash
npm run dev
```

By default, Vite serves the app on `http://localhost:5173` (or the next free port).

3. **Build and preview**

```bash
npm run build
npm run preview
```

4. **Lint and tests**

```bash
npm run lint      # ESLint
npm run test      # Vitest (single run)
npm run test:watch
```

Please make sure lint and tests pass before opening a PR.

---

## Project layout (where to change what)

- `src/hooks/useGame.js`  
  Core gameplay state machine – levels, timer, modes (`normal`, `daily`, `endless`), power-ups, streak multiplier, sentence selection, and best score tracking.

- `src/hooks/useStats.js`  
  Tracks aggregate stats (total games, best level/WPM/combo, achievements) in `localStorage` and syncs them to Firebase via `services/leaderboard`.

- `src/hooks/useSound.js`  
  Procedural horror audio and heartbeat logic. `useGame` calls into this hook to play sounds in reaction to events.

- `src/services/leaderboard.js`  
  All Firebase/Firestore interactions for profiles, leaderboards (global/time-filtered), daily challenge scores, and achievements.

- `src/config`  
  - `difficulty.js` – difficulty presets and timer/mistake rules  
  - `achievements.js` – achievement definitions and thresholds  
  - `dailyChallenge.js` – daily seeding, sentence selection, and IDs

- `src/data/sentences.json`  
  Horror sentence pool. Add new content here (keeping tone consistent).

- `src/components`  
  Screens (`StartScreen`, `GameScreen`, `GameOverScreen`), UI primitives (`StatsBar`, `SentenceDisplay`, `AchievementPopup`, `ShareCard`, etc.).

---

## Working with Firebase and leaderboards

- Firebase is initialized in `src/config/firebase.js`.  
  If you fork the project and want your own backend:
  - Create a Firebase project.
  - Enable Firestore and Authentication (Google sign-in).
  - Replace the config values in `firebase.js` with your project’s values.

- Leaderboard and profile logic lives in `src/services/leaderboard.js`:
  - `saveUserProfile` / `getUserProfile`
  - `submitScore` / `getLeaderboard`
  - `submitDailyScore` / `getDailyLeaderboard`
  - `saveAchievements`

When testing leaderboard behavior locally, make sure your Firebase security rules and indexes allow the queries from `leaderboard.js`.

---

## Common contribution ideas

- **Content**
  - Add more horror sentences in `src/data/sentences.json`.
  - Add or tune achievements in `src/config/achievements.js`.
  - Propose new visual themes or polish existing ones.

- **Gameplay**
  - Adjust difficulty curves in `src/config/difficulty.js`.
  - Refine power-up behavior or streak multiplier tuning.
  - Improve accessibility (color contrast, keybindings, etc.).

- **Online features**
  - Improve leaderboard UX.
  - Add better error handling / fallback UI when Firebase is unavailable.

---

## PR guidelines

- **Keep changes focused**: One feature or refactor per PR when possible.
- **Tests and linting**: Run `npm run lint` and `npm run test` locally and fix issues before submitting.
- **No secrets**: Do not commit personal Firebase keys, `.env` files, or other secrets.
- **Describe the change**: In your PR description, explain:
  - What you changed.
  - Why you changed it (motivation).
  - How you tested it (manual steps and/or tests).

Thanks again for helping make **One Way Out** better.

