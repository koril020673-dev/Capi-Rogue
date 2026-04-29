# CapiRogue2 Development Status

Last updated: 2026-04-29

## Project Overview

CapiRogue2 is a Vite + React browser game prototype. The app uses Zustand for global game state and is organized around screen-based flow.

Current entry points:

- `index.html`: Vite HTML entry.
- `src/main.jsx`: React mount entry.
- `src/App.jsx`: Screen router based on `screen` state from `useGameStore`.
- `src/store/useGameStore.js`: Main game state and actions.

## Tech Stack

- React 18
- Vite 6
- Zustand 5
- CSS in `src/styles/global.css`

`package.json` scripts:

```powershell
npm run dev
npm run build
npm run preview
```

## How To Run

This project should be run through Vite, not by directly opening `index.html`.

```powershell
cd "C:\Users\ASUS\OneDrive - 제주대학교\바탕 화면\개발\캐피로그3"
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal, usually:

```text
http://127.0.0.1:5173
```

Current environment note: `node` and `npm` were not available from the terminal when checked. Install Node.js LTS, restart VS Code, then run the commands above.

## Current Structure

```text
src/
  components/
    BackgroundScene.jsx
    DemandMap.jsx
    EventCard.jsx
    RightPanel.jsx
    StatusBar.jsx
    StrategyWarning.jsx
    TabBar.jsx
  constants/
    advisors.js
    consumerGroups.js
    economy.js
    rewards.js
    rivals.js
    strategies.js
    events/
      external.js
      internal.js
  logic/
    advisorEngine.js
    brandQualityEngine.js
    creditEngine.js
    demandEngine.js
    econEngine.js
    eventEngine.js
    healthEngine.js
    marketEngine.js
    momentumEngine.js
    rewardEngine.js
    rivalEngine.js
    saveEngine.js
    settlementEngine.js
  screens/
    AdvisorSelectScreen.jsx
    EventScreen.jsx
    GameOverScreen.jsx
    LoginScreen.jsx
    MainScreen.jsx
    ResultScreen.jsx
    RewardScreen.jsx
    SettlementScreen.jsx
    TitleScreen.jsx
  store/
    useGameStore.js
  styles/
    global.css
```

## Implemented Flow

Known screen IDs are defined in `src/store/useGameStore.js`:

- `login`
- `title`
- `advisor-select`
- `main`
- `event`
- `settlement`
- `result`
- `reward`
- `game-over`

`src/App.jsx` renders screens from that state and wraps the app in `BackgroundScene`.

The store includes state and actions for:

- Login / guest mode
- Advisor selection
- Starting a run
- Strategy selection
- Market preview
- Events
- Settlement / result / reward flow
- Health, credit, economic phase, rival, and save-related logic through separate engine modules

## Current Known Issues

- Node.js/npm is not installed or not available in PATH, so the app cannot currently be launched from the terminal.
- The main gameplay UI received a first-pass Korean text and flow cleanup on 2026-04-29.
- No Git repository is currently initialized in this folder.
- No `node_modules` or package lock file was observed, so dependencies likely have not been installed yet.

## Suggested Next Steps

1. Install Node.js LTS and confirm:

   ```powershell
   node --version
   npm --version
   ```

2. Install dependencies:

   ```powershell
   npm install
   ```

3. Start the app:

   ```powershell
   npm run dev
   ```

4. Fix corrupted Korean UI strings, starting with `src/screens/MainScreen.jsx`.

5. Run a production build once dependencies are installed:

   ```powershell
   npm run build
   ```

6. Consider initializing Git:

   ```powershell
   git init
   git add .
   git commit -m "Initial CapiRogue2 prototype"
   ```
