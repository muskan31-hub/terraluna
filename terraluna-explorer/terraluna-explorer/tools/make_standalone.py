#!/usr/bin/env python3
"""Build a single-file version of TerraLuna Explorer that runs without npm.

It concatenates the React source in src/ into one script, swaps the module imports for
CDN globals (React, Recharts, Leaflet, Tailwind Play CDN, Babel standalone), and writes
dist-standalone/terraluna-explorer.html. Open that file in a browser with internet access.

The Vite project in this folder remains the main project; this is a convenience build for
quick previews and demos.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
ORDER = [
    "lib/data.js", "lib/api.js", "lib/kb.js",
    "components/ui.jsx",
    "pages/Home.jsx", "pages/EarthExplorer.jsx", "pages/MoonExplorer.jsx", "pages/Compare.jsx",
    "pages/Dashboard.jsx", "pages/Assistant.jsx", "pages/About.jsx",
    "App.jsx", "main.jsx",
]

PREAMBLE = """
const { useState, useEffect, useMemo, useRef } = React;
const { createRoot } = ReactDOM;
const { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Legend } = Recharts;
const L = window.L;
"""


def transform(text: str) -> str:
    out = []
    for line in text.splitlines():
        if re.match(r"^\s*import\s.+;\s*$", line):
            continue
        line = re.sub(r"^export default function ", "function ", line)
        line = re.sub(r"^export (async )?function ", lambda m: (m.group(1) or "") + "function ", line)
        line = re.sub(r"^export const ", "const ", line)
        out.append(line)
    return "\n".join(out)


def main() -> None:
    parts = []
    for rel in ORDER:
        parts.append(f"// ---- {rel} ----\n" + transform((SRC / rel).read_text(encoding="utf-8")))
    code = "(function () {\n" + PREAMBLE + "\n" + "\n\n".join(parts) + "\n})();\n"

    css = (SRC / "index.css").read_text(encoding="utf-8")
    css = "\n".join(l for l in css.splitlines() if not l.startswith("@tailwind"))

    html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>TerraLuna Explorer – From Earth to Moon</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23050816'/%3E%3Ccircle cx='26' cy='34' r='16' fill='none' stroke='%2322d3ee' stroke-width='4'/%3E%3Ccircle cx='43' cy='24' r='9' fill='%238b5cf6'/%3E%3C/svg%3E" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
<script src="https://cdn.tailwindcss.com"></script>
<style>
{css}
</style>
</head>
<body>
<div id="root"></div>
<noscript>TerraLuna Explorer needs JavaScript enabled.</noscript>
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" crossorigin></script>
<script src="https://unpkg.com/prop-types@15.8.1/prop-types.min.js" crossorigin></script>
<script src="https://unpkg.com/react-is@18.3.1/umd/react-is.production.min.js" crossorigin></script>
<script src="https://unpkg.com/recharts@2.12.7/umd/Recharts.js" crossorigin></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>
<script type="text/babel" data-presets="react">
{code}
</script>
</body>
</html>
"""
    out_dir = ROOT / "dist-standalone"
    out_dir.mkdir(exist_ok=True)
    out = out_dir / "terraluna-explorer.html"
    out.write_text(html, encoding="utf-8")
    print(f"Wrote {out} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
