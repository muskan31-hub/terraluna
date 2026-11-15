import React, { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Glass, Loader, ErrorBanner, SectionTitle, ExtLink, Badge, CHART } from '../components/ui.jsx';
import { EARTH_PRESETS, SOURCES } from '../lib/data.js';
import { fetchPower, mean, minOf, maxOf, toCsv, downloadText } from '../lib/api.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function Stat({ label, value, unit }) {
  return (
    <Glass className="p-4">
      <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">{value == null ? 'n/a' : value}<span className="ml-1 text-sm font-normal text-slate-400">{value == null ? '' : unit}</span></div>
    </Glass>
  );
}

export default function Dashboard({ point, setPoint, power, setPower }) {
  const [state, setState] = useState({ status: power ? 'done' : 'idle', error: null });
  const [lat, setLat] = useState(String(point.lat));
  const [lon, setLon] = useState(String(point.lon));
  const [series, setSeries] = useState('t2m');

  useEffect(() => { setLat(String(point.lat)); setLon(String(point.lon)); }, [point]);

  async function load(p) {
    const la = Number(p.lat);
    const lo = Number(p.lon);
    if (!(la >= -90 && la <= 90) || !(lo >= -180 && lo <= 180)) {
      setState({ status: 'error', error: 'Latitude must be between -90 and 90 and longitude between -180 and 180.' });
      return;
    }
    setState({ status: 'loading', error: null });
    try {
      const res = await fetchPower(la, lo);
      setPower({ ...res, name: p.name || 'Custom location' });
      setState({ status: 'done', error: null });
    } catch (e) {
      setState({ status: 'error', error: e.message });
    }
  }

  const rows = power ? power.rows : [];
  const meta = power ? power.meta : null;

  const climatology = useMemo(() => {
    if (!rows.length) return [];
    return MONTHS.map((m, i) => {
      const r = rows.filter((x) => x.month === i + 1);
      return {
        month: m,
        t2m: mean(r.map((x) => x.t2m)) == null ? null : Number(mean(r.map((x) => x.t2m)).toFixed(2)),
        precip: mean(r.map((x) => x.precip)) == null ? null : Number(mean(r.map((x) => x.precip)).toFixed(2)),
      };
    });
  }, [rows]);

  const t = rows.map((r) => r.t2m);
  const pr = rows.map((r) => r.precip);

  return (
    <div>
      <SectionTitle eyebrow="Data Dashboard" title="Earth climate at any point">
        Live monthly air temperature and precipitation from NASA POWER for a place you choose. Each result lists its dataset, period, location and units, and can be downloaded.
      </SectionTitle>

      <Glass className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-slate-400" htmlFor="d-lat">Latitude</label>
            <input id="d-lat" className="field w-28" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-slate-400" htmlFor="d-lon">Longitude</label>
            <input id="d-lon" className="field w-28" inputMode="decimal" value={lon} onChange={(e) => setLon(e.target.value)} />
          </div>
          <button className="btn btn-earth !py-2" onClick={() => { const p = { lat: Number(lat), lon: Number(lon), name: 'Custom location' }; setPoint(p); load(p); }}>Load data</button>
          <div className="text-xs text-slate-400">or pick a place:</div>
          <div className="flex flex-wrap gap-2">
            {EARTH_PRESETS.map((p) => (
              <button key={p.name} className="chip" onClick={() => { setPoint(p); load(p); }}>{p.name}</button>
            ))}
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-400">Selected on the Earth map: {point.name} ({point.lat}°, {point.lon}°)</div>
      </Glass>

      <div className="mt-5">
        {state.status === 'idle' && <Glass className="p-6 text-sm text-slate-300">Choose a place above and press <strong>Load data</strong> to fetch live NASA POWER data.</Glass>}
        {state.status === 'loading' && <Glass className="p-6"><Loader label="Requesting NASA POWER data…" /></Glass>}
        {state.status === 'error' && <ErrorBanner title="Could not load data" onRetry={() => load({ lat, lon, name: point.name })}>{state.error}</ErrorBanner>}
      </div>

      {power && state.status !== 'loading' && (
        <div className="mt-2 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Mean air temperature" value={mean(t) == null ? null : mean(t).toFixed(1)} unit={meta.units.t2m === 'C' ? '°C' : meta.units.t2m} />
            <Stat label="Warmest monthly mean" value={maxOf(t) == null ? null : maxOf(t).toFixed(1)} unit={meta.units.t2m === 'C' ? '°C' : meta.units.t2m} />
            <Stat label="Coldest monthly mean" value={minOf(t) == null ? null : minOf(t).toFixed(1)} unit={meta.units.t2m === 'C' ? '°C' : meta.units.t2m} />
            <Stat label="Mean precipitation" value={mean(pr) == null ? null : mean(pr).toFixed(2)} unit={meta.units.precip} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Glass className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-white">Monthly time series, {meta.startYear}–{meta.endYear}</h2>
                <div className="flex gap-2">
                  <button className={`chip ${series === 't2m' ? 'chip-on' : ''}`} onClick={() => setSeries('t2m')}>Temperature</button>
                  <button className={`chip ${series === 'precip' ? 'chip-on' : ''}`} onClick={() => setSeries('precip')}>Precipitation</button>
                </div>
              </div>
              <div className="mt-3 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rows} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fill: CHART.text, fontSize: 10 }} minTickGap={40} />
                    <YAxis tick={{ fill: CHART.text, fontSize: 11 }} label={{ value: series === 't2m' ? `Air temperature (${meta.units.t2m === 'C' ? '°C' : meta.units.t2m})` : `Precipitation (${meta.units.precip})`, angle: -90, position: 'insideLeft', fill: CHART.text, fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0b1230', border: '1px solid #334155', borderRadius: 8 }} />
                    <Line type="monotone" dataKey={series} name={series === 't2m' ? 'T2M' : 'PRECTOTCORR'} stroke={series === 't2m' ? CHART.cyan : CHART.blue} strokeWidth={2} dot={false} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Glass>

            <Glass className="p-5">
              <h2 className="text-lg font-bold text-white">Average year (monthly climatology)</h2>
              <div className="mt-3 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={climatology} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: CHART.text, fontSize: 11 }} />
                    <YAxis tick={{ fill: CHART.text, fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0b1230', border: '1px solid #334155', borderRadius: 8 }} />
                    <Legend />
                    <Bar dataKey="t2m" name={`Temperature (${meta.units.t2m === 'C' ? '°C' : meta.units.t2m})`} fill={CHART.cyan} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="precip" name={`Precipitation (${meta.units.precip})`} fill={CHART.violet} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Glass>
          </div>

          <Glass className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-white">Dataset details</h2>
              <Badge kind="live" />
            </div>
            <dl className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-slate-500">Dataset</dt><dd className="text-slate-200">{meta.dataset}</dd></div>
              <div><dt className="text-xs text-slate-500">Source</dt><dd><ExtLink href={meta.source}>{meta.source}</ExtLink></dd></div>
              <div><dt className="text-xs text-slate-500">Observation period</dt><dd className="text-slate-200">Monthly means, {meta.startYear} to {meta.endYear}</dd></div>
              <div><dt className="text-xs text-slate-500">Geographic location</dt><dd className="text-slate-200">{power.name}: {meta.lat}°, {meta.lon}° (model grid cell about 0.5° × 0.625°)</dd></div>
              <div><dt className="text-xs text-slate-500">Measurement units</dt><dd className="text-slate-200">T2M air temperature at 2 m: {meta.units.t2m === 'C' ? '°C' : meta.units.t2m}. PRECTOTCORR corrected precipitation: {meta.units.precip}</dd></div>
              <div><dt className="text-xs text-slate-500">Retrieved</dt><dd className="text-slate-200">{new Date(meta.retrieved).toLocaleString()}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-slate-400">
              POWER values come from satellite-informed reanalysis and model assimilation on a grid. They describe a grid cell, not a single weather station, so local extremes can differ.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button className="btn btn-ghost !py-2 text-sm" onClick={() => downloadText(`nasa-power_${meta.lat}_${meta.lon}.csv`, toCsv(rows, meta))}>Download CSV</button>
              <a className="btn btn-ghost !py-2 text-sm" href={meta.apiUrl} target="_blank" rel="noopener noreferrer">Open raw API response ↗</a>
            </div>
          </Glass>
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-white">Dataset registry</h2>
        <p className="mt-1 text-sm text-slate-300">Every source in this project, with how it is used here.</p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
              <tr><th className="p-3">Dataset</th><th className="p-3">Agency</th><th className="p-3">Use on this site</th><th className="p-3">Link</th></tr>
            </thead>
            <tbody>
              {SOURCES.map((s) => (
                <tr key={s.id} className="border-t border-white/10 align-top">
                  <td className="p-3 font-semibold text-white">{s.name}</td>
                  <td className="p-3 text-slate-300">{s.agency}</td>
                  <td className="p-3"><Badge kind={s.access} /></td>
                  <td className="p-3"><ExtLink href={s.url}>Open ↗</ExtLink></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
