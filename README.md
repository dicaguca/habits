# Habits & PB Tracker

Personal habits and wellness tracking app built with React + Vite + Tailwind CSS.

---

## How to push changes to GitHub

The remote is already configured, so future pushes are just three commands:

```bash
cd "d:\D apps\habits"

git add .
git commit -m "Your description of the change"
git push
```

---

## First time on a new machine

If the repo hasn't been cloned yet on a new machine:

```bash
git clone https://github.com/dicaguca/habits.git "d:\D apps\habits"
cd "d:\D apps\habits"
npm install
npm run dev
```

---

## Running the app locally

```bash
cd "d:\D apps\habits"
npm install    # only needed once
npm run dev    # starts the dev server at http://localhost:5173
```

---

## Building for production

```bash
npm run build
```

Output goes to the `dist/` folder.

---

## Changing MR / SDR activity max counts

The number of activities in the Morning Routine (MR) and Shutdown Routine (SDR) checklists is tracked in [`src/constants.js`](src/constants.js). Trends display completion as a **percentage** so that changing the max doesn't distort historical data.

### Current values

| Routine | Max activities | In effect from |
|---------|---------------|----------------|
| MR | 13 | 2026-06-27 |
| MR (old) | 14 | before 2026-06-27 |
| SDR | 9 | always |

### How to change the MR max again in the future

1. Open `src/constants.js`.
2. Update `MR_MAX_ACTIVITIES_OLD` to the value being retired (e.g. `13`).
3. Update `MR_MAX_ACTIVITIES` to the new value (e.g. `12`).
4. Update `MR_MAX_CHANGE_DATE` to today's date in `'YYYY-MM-DD'` format.

The app uses `MR_MAX_CHANGE_DATE` to decide the spinner limit when entering activities: days **before** the cutoff keep the old max, days **on or after** use the new max. Each saved entry stores its own `maxCount` so historical trend percentages are never recalculated retroactively.
