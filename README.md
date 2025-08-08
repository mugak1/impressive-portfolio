# Impressive Frontend Portfolio (Static + PWA)

A sleek, high‑performance portfolio that runs without frameworks. It’s accessible, fast, and perfect for GitHub Pages.

## Features
- ⚡️ Lighthouse‑friendly (fast, responsive, installable)
- ♿ Accessible modals, keyboard navigation, color‑contrast
- 🧩 Web Components (`<project-card>`), Canvas visuals
- 🎛 Design tokens + theme toggle (light/dark)
- 🧭 Search + tag filters on projects
- 📦 PWA: offline caching, install prompt
- 🧹 No build step — deploy as static files

## Replace these placeholders
- `Alex Dev` → your name (in `index.html`, `manifest.webmanifest`)
- `your.email@example.com` → your email (in `index.html`)
- social links in the JSON‑LD block
- update `data/projects.json` with your own projects & links

## Run locally
Just open `index.html` in your browser (double‑click). For full PWA behavior, serve locally:
```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## License
MIT — tweak and ship it!
