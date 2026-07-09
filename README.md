# ValMaps — Valorant Strategy Planner

A tactics board for Valorant. Pick a map, place agents and their abilities, draw movement
arrows and notes, then save the play or export it as an image to share with your team.

## Features

- **13 competitive maps** (Ascent, Bind, Breeze, Haven, Icebox, Split, Fracture, Pearl,
  Lotus, Sunset, Abyss, Corrode, Summit) with real minimap images.
- **Full agent roster** (29 agents) grouped by role, with portrait icons. Up to 5 agents
  per side, one of each, tracked separately for Attack (blue) and Defense (red).
- **Ability markers** for every agent's real kit — smokes, walls, mollies, flashes,
  recon, traps, heals and ultimates each render with a distinct shape and size.
- **Drawing tools**: movement arrows (drag to draw), text notes, an eraser, and a select
  tool for moving/rotating markers. `Delete`/`Backspace` removes the selection.
- **Save / load strategies** to localStorage (map, round type, and every marker), and
  **export the board as a PNG**.

## How the tools behave

**Select is the default, and the board always comes back to it.** Placement tools are
one-shot: drop an agent, ability, arrow, or note and the tool snaps straight back to
Select, so your next click drags markers instead of accidentally placing another one.

- **`Esc`** returns to Select at any time.
- **Clicking the active tool again** toggles it off, back to Select.
- **Erase is the exception** — it stays on so you can clear several markers in a row;
  switch tools (or press `Esc`) when you're done.

| Tool | What it does |
| --- | --- |
| Select | Click to select, drag to move (or rotate walls). Multi-select supported. The default mode. |
| Agent | Click the map to place the agent chosen in the side panel, then back to Select |
| Ability | Pick any agent's ability in the side panel, click the map to place it, then back to Select |
| Arrow | Drag on the map to draw a movement arrow (colored by team side), then back to Select |
| Text | Click the map to drop an editable note; returns to Select once you finish typing |
| Erase | Click markers to delete them — stays active until you switch tools |

## Getting started

```bash
npm install
npm start        # dev server on http://localhost:3000
npm test         # unit tests
npm run build    # production build in ./build
```

Map minimaps and agent icons live in `public/assets/` and were sourced from the
community [valorant-api.com](https://valorant-api.com) media CDN. Game assets are the
property of Riot Games; this is an unofficial fan tool.
