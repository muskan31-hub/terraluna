import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Glass, Loader, ErrorBanner, SectionTitle, ExtLink, Badge } from '../components/ui.jsx';
import { GIBS_BASE, GIBS_LAYERS, EARTH_PRESETS } from '../lib/data.js';
import { gibsUrl, worldviewLink, defaultDate, yearAgo, isoDate, searchCmr } from '../lib/api.js';

const DATASET_QUERIES = [
  'MODIS land surface temperature',
  'MODIS NDVI vegetation',
  'GPM IMERG precipitation',
  'snow cover',
  'sea ice concentration',
];

export default function EarthExplorer({ point, setPoint }) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const cmpRef = useRef(null);
  const markerRef = useRef(null);
  const errRef = useRef(0);

  const [layerId, setLayerId] = useState('truecolor');
  const [date, setDate] = useState(defaultDate());
  const [opacity, setOpacity] = useState(0.9);
  const [cmpOn, setCmpOn] = useState(false);
  const [cmpDate, setCmpDate] = useState(yearAgo(defaultDate()));
  const [blend, setBlend] = useState(0.5);
  const [loading, setLoading] = useState(true);
  const [tileErrors, setTileErrors] = useState(0);

  const [query, setQuery] = useState(DATASET_QUERIES[0]);
  const [cmr, setCmr] = useState({ status: 'idle', items: [], error: null });

  const layer = GIBS_LAYERS.find((l) => l.id === layerId);
  const today = isoDate(new Date());

  // Create the map once.
  useEffect(() => {
    const map = L.map(mapEl.current, { center: [25, 10], zoom: 3, minZoom: 2, maxZoom: 9, worldCopyJump: true });
    L.tileLayer(gibsUrl(GIBS_BASE, null), {
      maxNativeZoom: GIBS_BASE.maxZoom, maxZoom: 9,
      attribution: 'Basemap: NASA GIBS Blue Marble · <a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noopener noreferrer">NASA GIBS</a>',
    }).addTo(map);
    map.on('click', (e) => {
      const lon = ((((e.latlng.lng + 180) % 360) + 360) % 360) - 180;
      setPoint({ lat: Number(e.latlng.lat.toFixed(2)), lon: Number(lon.toFixed(2)), name: 'Map selection' });
    });
    mapRef.current = map;
    return () => map.remove();
  }, []);

  // Show a marker for the selected point.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = L.circleMarker([point.lat, point.lon], { radius: 8, color: '#22d3ee', weight: 2, fillColor: '#8b5cf6', fillOpacity: 0.85 })
      .addTo(map)
      .bindTooltip(`${point.name} (${point.lat}, ${point.lon})`);
  }, [point]);

  // Main data layer.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (layerRef.current) layerRef.current.remove();
    errRef.current = 0;
    setTileErrors(0);
    setLoading(true);
    const tl = L.tileLayer(gibsUrl(layer, date), { maxNativeZoom: layer.maxZoom, maxZoom: 9, opacity, attribution: 'Data: NASA GIBS / ' + layer.instrument });
    tl.on('loading', () => setLoading(true));
    tl.on('load', () => setLoading(false));
    tl.on('tileerror', () => { errRef.current += 1; if (errRef.current === 6) setTileErrors(6); });
    tl.addTo(map);
    layerRef.current = tl;
  }, [layerId, date]);

  useEffect(() => { if (layerRef.current) layerRef.current.setOpacity(opacity); }, [opacity]);

  // Optional comparison layer: same product, different date, blended on top.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (cmpRef.current) { cmpRef.current.remove(); cmpRef.current = null; }
    if (!cmpOn) return;
    const tl = L.tileLayer(gibsUrl(layer, cmpDate), { maxNativeZoom: layer.maxZoom, maxZoom: 9, opacity: blend });
    tl.addTo(map);
    cmpRef.current = tl;
  }, [cmpOn, cmpDate, layerId]);

  useEffect(() => { if (cmpRef.current) cmpRef.current.setOpacity(blend); }, [blend]);

  function flyTo(p) {
    setPoint({ lat: p.lat, lon: p.lon, name: p.name });
    if (mapRef.current) mapRef.current.flyTo([p.lat, p.lon], 5, { duration: 1.4 });
  }

  async function runSearch(q) {
    setQuery(q);
    setCmr({ status: 'loading', items: [], error: null });
    try {
      const items = await searchCmr(q);
      setCmr({ status: 'done', items, error: null });
    } catch (e) {
      setCmr({ status: 'error', items: [], error: e.message });
    }
  }

  return (
    <div>
      <SectionTitle eyebrow="Earth Explorer" title="Earth from orbit">
        Live NASA GIBS satellite imagery. Choose a theme and a date, blend two dates to look for change, and click anywhere to select a location for the Dashboard.
      </SectionTitle>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Glass className="p-4">
            <div className="text-sm font-semibold text-white">Theme</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {GIBS_LAYERS.map((l) => (
                <button key={l.id} className={`chip ${l.id === layerId ? 'chip-on' : ''}`} onClick={() => setLayerId(l.id)}>{l.label}</button>
              ))}
            </div>
            <div className="mt-4 text-xs text-slate-300">{layer.desc}</div>
            <dl className="mt-3 space-y-1 text-xs text-slate-400">
              <div><dt className="inline text-slate-500">Units: </dt><dd className="inline">{layer.unit}</dd></div>
              <div><dt className="inline text-slate-500">Instrument: </dt><dd className="inline">{layer.instrument}</dd></div>
              <div><dt className="inline text-slate-500">GIBS layer: </dt><dd className="inline break-all">{layer.layer}</dd></div>
            </dl>
            <div className="mt-3"><ExtLink href={worldviewLink(layer, date)}>Open this layer in NASA Worldview ↗</ExtLink></div>
          </Glass>

          <Glass className="p-4">
            <label className="block text-sm font-semibold text-white" htmlFor="e-date">Observation date</label>
            <input id="e-date" type="date" className="field mt-2 w-full" value={date} max={today} onChange={(e) => e.target.value && setDate(e.target.value)} />
            <label className="mt-4 block text-xs text-slate-300" htmlFor="e-op">Layer opacity</label>
            <input id="e-op" type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-cyan-400" />

            <label className="mt-4 flex items-center gap-2 text-sm text-slate-200">
              <input type="checkbox" checked={cmpOn} onChange={(e) => setCmpOn(e.target.checked)} className="accent-violet-400" />
              Compare with another date
            </label>
            {cmpOn && (
              <div className="mt-2 space-y-2">
                <input type="date" className="field w-full" value={cmpDate} max={today} onChange={(e) => e.target.value && setCmpDate(e.target.value)} aria-label="Comparison date" />
                <label className="block text-xs text-slate-300" htmlFor="e-bl">Blend of comparison date</label>
                <input id="e-bl" type="range" min="0" max="1" step="0.05" value={blend} onChange={(e) => setBlend(Number(e.target.value))} className="w-full accent-violet-400" />
                <div className="text-xs text-slate-400">Slide to fade between {date} and {cmpDate}. Differences you see are candidates for change, not proof of it. Clouds and seasons change images too.</div>
              </div>
            )}
          </Glass>

          <Glass className="p-4">
            <div className="text-sm font-semibold text-white">Extreme environments</div>
            <div className="mt-3 flex flex-col gap-2">
              {EARTH_PRESETS.map((p) => (
                <button key={p.name} className="chip text-left" onClick={() => flyTo(p)} title={p.why}>{p.name}</button>
              ))}
            </div>
          </Glass>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div ref={mapEl} className="map-box" role="application" aria-label="Interactive Earth map" />
            {loading && (
              <div className="absolute left-3 top-3 z-[500] rounded-lg bg-[#050816]/85 px-3 py-2"><Loader label="Loading satellite tiles…" /></div>
            )}
          </div>
          {tileErrors > 0 && (
            <ErrorBanner title="Some imagery tiles did not load">
              NASA GIBS has no tiles for this layer on {date}, the service is slow, or the layer was renamed. Try an earlier date (8-day and daily products lag a few days) or another theme. You can also open the same layer in <ExtLink href={worldviewLink(layer, date)}>NASA Worldview</ExtLink>.
            </ErrorBanner>
          )}
          <Glass className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div>
              <span className="text-slate-400">Selected point: </span>
              <span className="text-white">{point.name}</span>
              <span className="text-slate-300"> · {point.lat}°, {point.lon}°</span>
            </div>
            <a href="#/dashboard" className="btn btn-earth !py-2 text-sm">Open in Dashboard →</a>
          </Glass>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold text-white">Find Earth science datasets</h2>
          <Badge kind="live" />
        </div>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Searches NASA's Common Metadata Repository, the catalogue behind <ExtLink href="https://search.earthdata.nasa.gov">Earthdata Search</ExtLink>. Pick a topic to see real dataset records.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {DATASET_QUERIES.map((q) => (
            <button key={q} className={`chip ${q === query && cmr.status !== 'idle' ? 'chip-on' : ''}`} onClick={() => runSearch(q)}>{q}</button>
          ))}
        </div>
        <div className="mt-4">
          {cmr.status === 'loading' && <Loader label="Searching Earthdata…" />}
          {cmr.status === 'error' && <ErrorBanner title="Earthdata search failed" onRetry={() => runSearch(query)}>{cmr.error}</ErrorBanner>}
          {cmr.status === 'idle' && <div className="text-sm text-slate-400">Choose a topic above to search.</div>}
          {cmr.status === 'done' && cmr.items.length === 0 && <div className="text-sm text-slate-400">No datasets found.</div>}
          {cmr.status === 'done' && cmr.items.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2">
              {cmr.items.map((it) => (
                <Glass key={it.id} className="p-4">
                  <div className="text-sm font-semibold text-white">{it.title}</div>
                  <div className="mt-1 text-xs text-slate-400">{it.center} · {it.shortName} {it.version && `v${it.version}`}</div>
                  <div className="mt-1 text-xs text-slate-400">Coverage: {it.start || 'n/a'} → {it.end}</div>
                  <div className="mt-2 flex gap-4 text-xs">
                    <ExtLink href={it.link}>Metadata ↗</ExtLink>
                    <ExtLink href={it.search}>Earthdata Search ↗</ExtLink>
                  </div>
                </Glass>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
