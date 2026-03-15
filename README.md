# Pomodoro Timer

A clean, focused Pomodoro timer web app built with React and TypeScript.

## What is the Pomodoro Technique?

The Pomodoro Technique is a time management method where you alternate between focused work intervals and short breaks. After every 4 focus sessions, you earn a longer break.

**Default intervals:**
- Focus — 25 minutes
- Short Break — 5 minutes
- Long Break — 15 minutes

## Features

- Animated circular progress ring that changes color by mode (red = focus, green = short break, blue = long break)
- Start / Pause / Reset controls and a Skip button to jump to the next phase
- Streak dots showing progress toward the next long break
- Adjustable durations via a settings panel (1–90 min focus, 1–30 min short break, 1–60 min long break)
- Session log tracking completed pomodoros, total focus time, and all sessions

## Running locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Tech stack

- **React** — UI component library
- **TypeScript** — typed JavaScript
- **Vite** — fast dev server and build tool
