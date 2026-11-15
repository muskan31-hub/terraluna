import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Glass, Loader, ErrorBanner, SectionTitle, ExtLink, Badge, CHART } from '../components/ui.jsx';
import { MOON_LAYERS, MOON_SITES, TEMP_EXTREMES, ICE_STABILITY_K } from '../lib/data.js';

function PolarPlot({ selected, onSelect }) {
  // Azimuthal view of the south pole. Radius = angular distance from the pole; angle = longitude.
  const size = 320;
  const c = size / 2;
  const maxDeg = 10; // show from -80 to the pole
  const scale = (c - 16) / maxDeg;
  const pos = (lat, lon) => {
    const r = (90 - Math.abs(lat)) * scale;
    const a = ((lon - 90) * Math.PI) / 180;
    return [c + r * Math.cos(a), c + r * Math.sin(a)];
  };
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-sm" role="img" aria-label="South polar map of crater locations">
      <circle cx={c} cy={c} r={c - 6} fill="#050816" stroke="#334155" />
      {[2, 4, 6, 8, 10].map((d) => (
        <g key={d}>
          <circle cx={c} cy={c} r={d * scale} fill="none" stroke="#1e293b" strokeDasharray="3 4" />
          <text x={c + 4} y={c - d * scale + 11} fontSize="9" fill="#64748b">{90 - d}°S</text>
        </g>
      ))}
      <line x1={c} y1={8} x2={c} y2={size - 8} stroke="#1e293b" />
      <line x1={8} y1={c} x2={size - 8} y2={c} stroke="#1e293b" />
      <text x={c} y={14} fontSize="9" fill="#64748b" textAnchor="middle">90°E</text>
      <text x={size - 12} y={c - 4} fontSize="9" fill="#64748b" textAnchor="end">180°</text>
      <text x={c} y={size - 5} fontSize="9" fill="#64748b" textAnchor="middle">90°W</text>
      <text x={12} y={c - 4} fontSize="9" fill="#64748b">0°</text>
      {MOON_SITES.map((s) => {
        const [x, y] = pos(s.lat, s.lon);
        const on = selected === s.name;
        const rr = Math.max(4, (s.km / 111) * scale * 0.9);
        return (
          <g key={s.name} className="cursor-pointer" onClick={() => onSelect(s.name)}>
            <circle cx={x} cy={y} r={rr} fill={on ? 'rgba(167,139,250,.45)' : 'rgba(34,211,238,.25)'} stroke={on ? '#a78bfa' : '#22d3ee'} strokeWidth="1.5" />
            <text x={x + rr + 3} y={y + 3} fontSize="9.5" fill="#e2e8f0">{s.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function MoonExplorer() {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const markersRef = useRef({});
  const errRef = useRef(0);

  const [layerId, setLayerId] = useState('wac');
  const [loading, setLoading] = useState(true);
  const [tileErrors, setTileErrors] = useState(0);
  const [site, setSite] = useState('Shackleton');

  const layer = MOON_LAYERS.find((l) => l.id === layerId);
  const siteInfo = MOON_SITES.find((s) => s.name === site);

  useEffect(() => {
    // Geographic (plate carrée) projection, matching NASA Moon Trek's equirectangular tile sets.
    const map = L.map(mapEl.current, { crs: L.CRS.EPSG4326, center: [-60, 0], zoom: 2, minZoom: 1, maxZoom: 8, maxBounds: [[-95, -190], [95, 190]] });
    mapRef.current = map;
    MOON_SITES.forEach((s) => {
      const m = L.circleMarker([s.lat, s.lon], { radius: 7, color: '#a78bfa', weight: 2, fillColor: '#22d3ee', fillOpacity: 0.7 }).addTo(map);
      m.bindPopup(`<strong>${s.name}</strong> (~${s.km} km)<br/>${s.lat}°, ${s.lon}°<br/><span style="font-size:12px">${s.note}</span>`);
      m.on('click', () => setSite(s.name));
      markersRef.current[s.name] = m;
    });
    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (layerRef.current) layerRef.current.remove();
    errRef.current = 0;
    setTileErrors(0);
    setLoading(true);
    // Trek's level 0 tile covers 180°, Leaflet's EPSG:4326 level 0 covers 360°, hence zoomOffset -1.
    const tl = L.tileLayer(layer.url, {
      tileSize: 256, zoomOffset: -1, minZoom: 1, maxNativeZoom: layer.maxNative + 1, maxZoom: 8, noWrap: true,
      attribution: 'Imagery: NASA/GSFC/ASU LRO · <a href="https://trek.nasa.gov/moon/" target="_blank" rel="noopener noreferrer">NASA Moon Trek</a>',
    });
    tl.on('loading', () => setLoading(true));
    tl.on('load', () => setLoading(false));
    tl.on('tileerror', () => { errRef.current += 1; if (errRef.current === 6) setTileErrors(6); });
    tl.addTo(map);
    tl.bringToBack();
    layerRef.current = tl;
  }, [layerId]);

  function goTo(name) {
    setSite(name);
    const s = MOON_SITES.find((x) => x.name === name);
    if (s && mapRef.current) {
      mapRef.current.flyTo([s.lat, s.lon], 5, { duration: 1.3 });
      markersRef.current[name]?.openPopup();
    }
  }

  const chartData = TEMP_EXTREMES.filter((t) => t.body === 'Moon').map((t) => ({ name: t.label, k: t.k, cite: t.cite }));

  return (
    <div>
      <SectionTitle eyebrow="Moon Explorer" title="The Moon, pole to pole">
        NASA LRO imagery and elevation, with the south polar craters marked. The coldest places in the Solar System measured so far are in craters like these.
      </SectionTitle>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Glass className="p-4">
            <div className="text-sm font-semibold text-white">Surface layer</div>
            <div className="mt-3 flex flex-col gap-2">
              {MOON_LAYERS.map((l) => (
                <button key={l.id} className={`chip text-left ${l.id === layerId ? 'chip-on' : ''}`} onClick={() => setLayerId(l.id)}>{l.label}</button>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-300">{layer.desc}</p>
          </Glass>
          <Glass className="p-4">
            <div className="text-sm font-semibold text-white">Polar regions</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {MOON_SITES.map((s) => (
                <button key={s.name} className={`chip ${s.name === site ? 'chip-on' : ''}`} onClick={() => goTo(s.name)}>{s.name}</button>
              ))}
            </div>
            <div className="mt-4 text-xs text-slate-300">
              <div className="font-semibold text-white">{siteInfo.name} · ~{siteInfo.km} km wide</div>
              <div className="mt-1">Approx. location {siteInfo.lat}°, {siteInfo.lon}°</div>
              <div className="mt-2">{siteInfo.note}</div>
            </div>
          </Glass>
          <Glass className="p-4">
            <div className="text-sm font-semibold text-white">South polar view</div>
            <p className="mb-2 text-xs text-slate-400">Locations only (80°S to the pole). Circle size is the crater diameter.</p>
            <PolarPlot selected={site} onSelect={goTo} />
          </Glass>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div ref={mapEl} className="map-box" role="application" aria-label="Interactive Moon map" />
            {loading && <div className="absolute left-3 top-3 z-[500] rounded-lg bg-[#050816]/85 px-3 py-2"><Loader label="Loading lunar tiles…" /></div>}
          </div>
          {tileErrors > 0 && (
            <ErrorBanner title="Lunar tiles did not load">
              NASA Moon Trek tiles are unavailable or slow right now. You can explore the same data directly in <ExtLink href="https://trek.nasa.gov/moon/">NASA Moon Trek</ExtLink>. The crater markers and charts on this page still work.
            </ErrorBanner>
          )}
          <p className="text-xs text-slate-400">Map is shown in a flat latitude/longitude projection, so regions near the poles look stretched. Use the polar view for true relative positions.</p>
        </div>
      </div>

      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        <Glass className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-white">Diviner temperature observations</h2>
            <Badge kind="measured" />
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Diviner measures infrared radiation emitted by the surface. These are published values, not live data. The dashed line marks about {ICE_STABILITY_K} K, below which surface water ice is expected to be stable (an interpretation).
          </p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: CHART.text, fontSize: 11 }} />
                <YAxis tick={{ fill: CHART.text, fontSize: 11 }} label={{ value: 'Temperature (K)', angle: -90, position: 'insideLeft', fill: CHART.text, fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0b1230', border: '1px solid #334155', borderRadius: 8 }} formatter={(v) => [`${v} K`, 'Temperature']} />
                <ReferenceLine y={ICE_STABILITY_K} stroke={CHART.amber} strokeDasharray="5 4" label={{ value: `~${ICE_STABILITY_K} K ice stability`, fill: CHART.amber, fontSize: 11, position: 'insideTopRight' }} />
                <Bar dataKey="k" radius={[6, 6, 0, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={[CHART.violet, CHART.blue, CHART.cyan][i % 3]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1 text-xs text-slate-400">
            {chartData.map((d) => <li key={d.name}>{d.name}: {d.cite}</li>)}
          </ul>
        </Glass>

        <Glass className="p-5">
          <h2 className="text-xl font-bold text-white">Lunar surface and planetary science</h2>
          <ul className="mt-3 space-y-3 text-sm text-slate-300">
            <li><span className="font-semibold text-white">Why the poles are special.</span> The Moon's axis is tilted only about 1.5°, so the Sun skims the horizon near the poles. Deep crater floors can stay in shadow for billions of years. <Badge kind="interpretation" /></li>
            <li><span className="font-semibold text-white">Ice.</span> The 2009 LCROSS impact at Cabeus released a plume in which water was detected. Extent and origin of polar ice are still being studied. <Badge kind="measured" /></li>
            <li><span className="font-semibold text-white">Instruments.</span> LROC (cameras), LOLA (laser altimeter), Diviner (thermal radiometer), LEND (neutrons) and Mini-RF (radar) each probe different properties of the polar surface.</li>
          </ul>
          <div className="mt-4 border-t border-white/10 pt-3 text-sm">
            <div className="mb-2 font-semibold text-white">Data and resources</div>
            <ul className="space-y-1">
              <li><ExtLink href="https://pds-geosciences.wustl.edu/missions/lro/diviner.htm">LRO Diviner data (PDS Geosciences Node) ↗</ExtLink></li>
              <li><ExtLink href="https://pds.nasa.gov">NASA Planetary Data System ↗</ExtLink></li>
              <li><ExtLink href="https://science.nasa.gov/mission/lro/">LRO mission page (NASA) ↗</ExtLink></li>
              <li><ExtLink href="https://trek.nasa.gov/moon/">NASA Moon Trek ↗</ExtLink></li>
            </ul>
          </div>
        </Glass>
      </section>
    </div>
  );
}
