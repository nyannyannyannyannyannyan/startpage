# startpage

Minimal browser startpage with a dynamic grid layout, live Casio FX-9860GII calculator clock, Google search, quick links, and full drag-and-drop customization.

## features

- **Casio FX-9860GII clock** — bitmap calculator font, live HH:MM:SS, scales with card size (`container-type: inline-size`)
- **Google search** — spans 6 columns, opens results in a new tab
- **Quick links** — 9 icon-only links (GitHub, Reddit, YouTube, Gmail, Gemini, WhatsApp, Telegram, Facebook, Instagram)
- **16×12 grid** — cards can be freely repositioned via drag & drop
- **Resizable cards** — drag the bottom-right corner handle to change column/row span
- **Save layout** — click "save layout" to persist positions/spans to localStorage
- **Smooth animations** — staggered entrance + FLIP animation on drag drop (Anime.js)

## usage

Open `index.html` in a browser. Drag cards to rearrange, resize from the corner handle, and click "save layout" to store your layout.

## files

| File | Description |
|---|---|
| `index.html` | 12 grid-aligned cards + save card |
| `style.css` | Grid, monochrome theme, resize handle, @font-face |
| `script.js` | Clock, greeting, drag & drop (FLIP), resize, save/load |
| `assets/casio-fx-9860gii.ttf` | Casio calculator bitmap font |
