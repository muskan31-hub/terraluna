"""TerraLuna Explorer optional backend (FastAPI).

The website works without this server: it calls NASA GIBS, NASA POWER and NASA CMR directly from the browser.
This backend adds things a browser cannot do well:
  * /api/power/summary     NASA POWER data processed with Pandas/NumPy (statistics, anomalies, seasonal cycle)
  * /api/cmr               NASA CMR dataset search proxy
  * /api/copernicus        Copernicus Data Space public catalogue search (Sentinel products)
  * /api/moon/temperatures Published Diviner values with citations (no invented numbers)

Run:  pip install -r requirements.txt && uvicorn main:app --reload --port 8000
"""
from __future__ import annotations

import httpx
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="TerraLuna Explorer API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET"], allow_headers=["*"])

TIMEOUT = httpx.Timeout(30.0)

POWER_URL = "https://power.larc.nasa.gov/api/temporal/monthly/point"
CMR_URL = "https://cmr.earthdata.nasa.gov/search/collections.json"
CDSE_URL = "https://catalogue.dataspace.copernicus.eu/odata/v1/Products"

# Published literature values (kelvin). Kept in sync with src/lib/data.js on the front end.
MOON_TEMPS = [
    {"label": "Polar permanently shadowed craters (coldest)", "kelvin": 25, "kind": "measured",
     "citation": "Paige et al. 2010, Science 330, 479; doi:10.1126/science.1187726"},
    {"label": "Equator, night", "kelvin": 95, "kind": "measured",
     "citation": "Williams et al. 2017, Icarus 283, 300; doi:10.1016/j.icarus.2016.08.012"},
    {"label": "Equator, noon (approx.)", "kelvin": 390, "kind": "measured",
     "citation": "Williams et al. 2017, Icarus 283, 300; doi:10.1016/j.icarus.2016.08.012"},
]


async def _get_json(url: str, params: dict) -> dict:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            r = await client.get(url, params=params)
            r.raise_for_status()
            return r.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=502, detail=f"Upstream error {e.response.status_code} from {url}") from e
        except httpx.HTTPError as e:
            raise HTTPException(status_code=504, detail=f"Could not reach {url}: {e}") from e


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/power/summary")
async def power_summary(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    start: int = Query(2015, ge=1981),
    end: int = Query(2024, ge=1981),
):
    """Monthly NASA POWER air temperature (T2M) and precipitation (PRECTOTCORR), summarised with Pandas."""
    if end < start:
        raise HTTPException(status_code=422, detail="end must be >= start")
    data = await _get_json(POWER_URL, {
        "parameters": "T2M,PRECTOTCORR", "community": "RE", "longitude": lon, "latitude": lat,
        "start": start, "end": end, "format": "JSON",
    })
    param = data.get("properties", {}).get("parameter", {})
    if "T2M" not in param:
        raise HTTPException(status_code=404, detail="NASA POWER returned no data for this location")

    df = pd.DataFrame({"t2m": param["T2M"], "precip": param.get("PRECTOTCORR", {})})
    df.index = df.index.astype(str)
    df = df[~df.index.str.endswith("13")]  # month 13 is the annual mean
    df = df.replace(-999, np.nan)
    df["year"] = df.index.str[:4].astype(int)
    df["month"] = df.index.str[4:].astype(int)

    clim = df.groupby("month")[["t2m", "precip"]].mean().round(2)
    annual = df.groupby("year")["t2m"].mean().round(2)
    trend = None
    if annual.notna().sum() >= 3:
        slope = float(np.polyfit(annual.index.values[annual.notna()], annual.values[annual.notna()], 1)[0])
        trend = round(slope, 3)

    return {
        "dataset": "NASA POWER Monthly (community RE)",
        "source": "https://power.larc.nasa.gov",
        "location": {"lat": lat, "lon": lon},
        "period": {"start": start, "end": end},
        "units": data.get("parameters", {}),
        "stats": {
            "t2m_mean": round(float(df["t2m"].mean()), 2),
            "t2m_min": round(float(df["t2m"].min()), 2),
            "t2m_max": round(float(df["t2m"].max()), 2),
            "precip_mean": round(float(df["precip"].mean()), 3) if df["precip"].notna().any() else None,
            "t2m_linear_trend_per_year": trend,
            "note": "Trend is a simple fit over a short window and is not a climate-change attribution.",
        },
        "monthly_climatology": clim.reset_index().to_dict(orient="records"),
    }


@app.get("/api/cmr")
async def cmr_search(keyword: str = Query(..., min_length=2), page_size: int = Query(8, ge=1, le=25)):
    data = await _get_json(CMR_URL, {"keyword": keyword, "page_size": page_size, "sort_key": "-usage_score"})
    return {"results": [
        {"id": e.get("id"), "title": e.get("title"), "short_name": e.get("short_name"), "center": e.get("data_center"),
         "start": e.get("time_start"), "end": e.get("time_end"),
         "link": f"https://cmr.earthdata.nasa.gov/search/concepts/{e.get('id')}.html"}
        for e in data.get("feed", {}).get("entry", [])
    ]}


@app.get("/api/copernicus")
async def copernicus_search(
    collection: str = Query("SENTINEL-2", description="e.g. SENTINEL-1, SENTINEL-2, SENTINEL-3"),
    since: str = Query("2026-01-01", description="YYYY-MM-DD"),
    top: int = Query(5, ge=1, le=20),
):
    """Search the public Copernicus Data Space catalogue (no login needed to search; downloads need an account)."""
    flt = f"Collection/Name eq '{collection}' and ContentDate/Start gt {since}T00:00:00.000Z"
    data = await _get_json(CDSE_URL, {"$filter": flt, "$top": top, "$orderby": "ContentDate/Start desc"})
    return {"source": "https://dataspace.copernicus.eu", "results": [
        {"name": p.get("Name"), "start": p.get("ContentDate", {}).get("Start"), "id": p.get("Id")}
        for p in data.get("value", [])
    ]}


@app.get("/api/moon/temperatures")
async def moon_temperatures():
    return {"note": "Published literature values, not live data.", "values": MOON_TEMPS}
