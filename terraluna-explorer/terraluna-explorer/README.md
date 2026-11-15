# TerraLuna Explorer – From Earth to Moon

Interactive web app comparing Earth's extreme environments with the lunar polar environment, using open NASA, ESA, CSA and JAXA data. Built for the NASA International Space Apps Challenge.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build in dist/
```

Optional backend (the site works without it):

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000     # docs at http://localhost:8000/docs
```

Quick preview without npm: `python3 tools/make_standalone.py`, then open `dist-standalone/terraluna-explorer.html` in a browser with internet access (loads React, Recharts, Leaflet and Tailwind from CDNs).

## Pages

| Page | What it does |
|---|---|
| Home | Hero, headline, Explore Earth / Explore Moon, project summary, source list |
| Earth Explorer | Leaflet map with live NASA GIBS layers (true colour, land surface temperature, NDVI, IMERG rainfall, snow/ice), date picker, two-date blend for change, extreme-place presets, live NASA CMR dataset search, Worldview deep links |
| Moon Explorer | Leaflet map (EPSG:4326) with NASA Moon Trek LRO WAC and LOLA tiles, south polar crater markers, polar view, Diviner temperature chart (cited literature values), PDS/LRO links |
| Compare | Side-by-side table with Measured / Derived / Interpretation / Model tags, temperature chart (K or °C), labelled illustrative day curve |
| Dashboard | Live NASA POWER monthly T2M and precipitation for any lat/lon, stats, charts, dataset/units/location/date metadata, CSV download, dataset registry |
| AI Assistant | Retrieval over a cited knowledge base plus summaries computed from loaded Dashboard data; says "no sourced answer" instead of guessing |
| About | Problem, solution, sources, labelling policy, limitations, references, attribution |

## Data honesty

- **Live:** GIBS tiles, NASA POWER, NASA CMR, Moon Trek tiles.
- **Literature values (cited, not live):** Earth temperature records (WMO, Scambos et al. 2018), Moon extremes (Paige et al. 2010, Williams et al. 2017), LCROSS water detection (Colaprete et al. 2010). See `src/lib/data.js`.
- **Illustrative model (labelled):** the lunar equatorial day curve on the Compare page.
- **Link only:** PDS, Diviner raw products, Copernicus, RADARSAT/RCM, JAXA G-Portal (registration or authentication required). The backend adds a public Copernicus catalogue search.

## Layout

```
src/lib/data.js   reference data and layer definitions (every value cited)
src/lib/api.js    GIBS URLs, NASA POWER, NASA CMR, CSV export
src/lib/kb.js     assistant knowledge base
src/pages/*       the seven pages
backend/main.py   optional FastAPI + Pandas/NumPy service
tools/make_standalone.py   single-file CDN build
```

## Status

The source passed syntax checks, but it was written in an environment with no network access, so it has not been run in a browser against the live NASA services. First things to verify after `npm run dev`: the GIBS layer IDs in `GIBS_LAYERS`, and the Moon Trek tile URLs and `zoomOffset` in `MoonExplorer.jsx`. The map pages show an error banner if tiles fail.

## Hosting on GitHub Pages

Two options:

1. **Automatic build (recommended):** push this repo to GitHub, then go to Settings → Pages → Source: **GitHub Actions**. `.github/workflows/deploy.yml` builds the Vite app and publishes it on every push to `main`.
2. **No build:** Settings → Pages → Source: **Deploy from a branch**, branch `main`, folder `/docs`. `docs/index.html` is the single-file CDN build (regenerate with `python3 tools/make_standalone.py` and copy it to `docs/index.html`).

Navigation uses hash routes (`#/earth`), so no server rewrite rules are needed.
