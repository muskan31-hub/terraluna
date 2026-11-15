// Live public APIs used directly from the browser (CORS-enabled, no API key):
//   - NASA GIBS WMTS tiles
//   - NASA POWER monthly point API (https://power.larc.nasa.gov)
//   - NASA CMR collection search (https://cmr.earthdata.nasa.gov)

export function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

export function defaultDate() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 4); // GIBS daily products are typically available within a few days
  return isoDate(d);
}

export function yearAgo(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCFullYear(d.getUTCFullYear() - 1);
  return isoDate(d);
}

export function gibsUrl(l, date) {
  const t = l.timeBased ? date : 'default';
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${l.layer}/default/${t}/${l.matrix}/{z}/{y}/{x}.${l.ext}`;
}

export function worldviewLink(l, date) {
  return `https://worldview.earthdata.nasa.gov/?l=${l.layer}&t=${date}`;
}

async function getJson(url, timeoutMs = 25000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`Request failed (${res.status} ${res.statusText})`);
    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('The request timed out. The data service may be busy.');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// NASA POWER monthly climatology at a point. Returns rows of { date, year, month, t2m, precip }.
export async function fetchPower(lat, lon, startYear = 2015, endYear = 2024) {
  const url =
    'https://power.larc.nasa.gov/api/temporal/monthly/point' +
    `?parameters=T2M,PRECTOTCORR&community=RE&longitude=${lon}&latitude=${lat}` +
    `&start=${startYear}&end=${endYear}&format=JSON`;
  const json = await getJson(url);
  const p = json?.properties?.parameter;
  if (!p || !p.T2M) throw new Error('NASA POWER returned no data for this location.');
  const rows = [];
  for (const key of Object.keys(p.T2M)) {
    const year = Number(key.slice(0, 4));
    const month = Number(key.slice(4));
    if (month < 1 || month > 12) continue; // month 13 is the annual mean
    const t = p.T2M[key];
    const r = p.PRECTOTCORR ? p.PRECTOTCORR[key] : null;
    rows.push({
      date: `${year}-${String(month).padStart(2, '0')}`,
      year,
      month,
      t2m: t === -999 || t == null ? null : Number(t),
      precip: r === -999 || r == null ? null : Number(r),
    });
  }
  const units = json?.parameters || {};
  return {
    rows,
    meta: {
      dataset: 'NASA POWER Monthly (MERRA-2 / CERES-based, community RE)',
      source: 'https://power.larc.nasa.gov',
      apiUrl: url,
      startYear,
      endYear,
      lat,
      lon,
      units: {
        t2m: units.T2M?.units || 'C',
        precip: units.PRECTOTCORR?.units || 'mm/day',
      },
      retrieved: new Date().toISOString(),
    },
  };
}

// NASA CMR collection search (the engine behind Earthdata Search).
export async function searchCmr(keyword) {
  const url = `https://cmr.earthdata.nasa.gov/search/collections.json?keyword=${encodeURIComponent(keyword)}&page_size=8&sort_key=-usage_score`;
  const json = await getJson(url);
  const entries = json?.feed?.entry || [];
  return entries.map((e) => ({
    id: e.id,
    title: e.title,
    shortName: e.short_name,
    version: e.version_id,
    center: e.data_center,
    start: e.time_start ? e.time_start.slice(0, 10) : null,
    end: e.time_end ? e.time_end.slice(0, 10) : 'ongoing',
    link: `https://cmr.earthdata.nasa.gov/search/concepts/${e.id}.html`,
    search: `https://search.earthdata.nasa.gov/search?q=${encodeURIComponent(e.short_name || e.title)}`,
  }));
}

export function mean(arr) {
  const v = arr.filter((x) => x != null && !Number.isNaN(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}
export function minOf(arr) {
  const v = arr.filter((x) => x != null && !Number.isNaN(x));
  return v.length ? Math.min(...v) : null;
}
export function maxOf(arr) {
  const v = arr.filter((x) => x != null && !Number.isNaN(x));
  return v.length ? Math.max(...v) : null;
}

export function toCsv(rows, meta) {
  const head = [
    `# ${meta.dataset}`,
    `# Source: ${meta.source}`,
    `# Location: lat ${meta.lat}, lon ${meta.lon}`,
    `# Period: ${meta.startYear}-${meta.endYear}`,
    `# Units: T2M (${meta.units.t2m}), PRECTOTCORR (${meta.units.precip})`,
    `# Retrieved: ${meta.retrieved}`,
    'month,T2M,PRECTOTCORR',
  ];
  const lines = rows.map((r) => `${r.date},${r.t2m ?? ''},${r.precip ?? ''}`);
  return head.concat(lines).join('\n');
}

export function downloadText(filename, text, mime = 'text/csv') {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
