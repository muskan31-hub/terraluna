import React, { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Legend } from 'recharts';
import { Glass, SectionTitle, Badge, Planet, CHART } from '../components/ui.jsx';
import { COMPARE_ROWS, TEMP_EXTREMES, ICE_STABILITY_K } from '../lib/data.js';

// Illustrative model ONLY. Anchored to two published Diviner values; the curve between them is a simple
// radiative-equilibrium shape (T ~ T_noon * cos(hour angle)^0.25), not a measurement.
function diurnalModel(tNoon, tNight) {
  const pts = [];
  for (let d = 0; d <= 29.5; d += 0.5) {
    const h = ((d / 29.5) * 360 - 180); // local hour angle in degrees, noon at the middle of the cycle
    const c = Math.cos((h * Math.PI) / 180);
    const t = c > 0 ? Math.max(tNight, tNoon * Math.pow(c, 0.25)) : tNight;
    pts.push({ day: d, k: Math.round(t) });
  }
  return pts;
}

export default function Compare() {
  const [unit, setUnit] = useState('K');
  const conv = (k) => (unit === 'K' ? k : k - 273.15);
  const unitLabel = unit === 'K' ? 'K' : '°C';

  const barData = TEMP_EXTREMES.map((t) => ({ name: t.label, value: Number(conv(t.k).toFixed(1)), body: t.body, cite: t.cite }));
  const model = useMemo(() => diurnalModel(390, 95).map((p) => ({ ...p, v: Number(conv(p.k).toFixed(1)) })), [unit]);
  const iceLine = Number(conv(ICE_STABILITY_K).toFixed(1));

  return (
    <div>
      <SectionTitle eyebrow="Earth vs Moon" title="Two worlds, side by side">
        Same questions, two planets: how hot, how cold, how much air, how much water. Each row is tagged so you can tell what was measured from what is interpreted.
      </SectionTitle>

      <div className="grid gap-4 md:grid-cols-2">
        <Glass className="flex items-center gap-4 p-5">
          <Planet kind="earth" className="h-20 w-20 shrink-0" />
          <div>
            <div className="text-lg font-bold text-cyan-200">Earth</div>
            <p className="text-sm text-slate-300">An atmosphere and oceans spread heat around, so most surfaces stay within a few tens of degrees of where they started the day.</p>
          </div>
        </Glass>
        <Glass className="flex items-center gap-4 p-5">
          <Planet kind="moon" className="h-20 w-20 shrink-0" />
          <div>
            <div className="text-lg font-bold text-violet-200">Moon</div>
            <p className="text-sm text-slate-300">With no atmosphere, the surface follows the Sun almost instantly: scorching at noon, deeply frozen at night and in polar shadow.</p>
          </div>
        </Glass>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-400">Temperature unit:</span>
        {['K', '°C'].map((u) => (
          <button key={u} className={`chip ${unit === u ? 'chip-on' : ''}`} onClick={() => setUnit(u)}>{u}</button>
        ))}
      </div>

      <section className="mt-4 grid gap-5 lg:grid-cols-2">
        <Glass className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-white">Temperature extremes</h2>
            <Badge kind="measured" />
          </div>
          <p className="mt-1 text-xs text-slate-400">Earth bars are air temperatures at weather stations (WMO). Moon bars are surface temperatures from LRO Diviner. They are different quantities, so compare with care.</p>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 12, right: 12, left: 0, bottom: 28 }}>
                <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: CHART.text, fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={60} />
                <YAxis tick={{ fill: CHART.text, fontSize: 11 }} label={{ value: `Temperature (${unitLabel})`, angle: -90, position: 'insideLeft', fill: CHART.text, fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0b1230', border: '1px solid #334155', borderRadius: 8 }} formatter={(v) => [`${v} ${unitLabel}`, 'Temperature']} />
                <ReferenceLine y={iceLine} stroke={CHART.amber} strokeDasharray="5 4" label={{ value: `~${iceLine} ${unitLabel} ice stability`, fill: CHART.amber, fontSize: 10, position: 'insideTopLeft' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((d, i) => <Cell key={i} fill={d.body === 'Earth' ? CHART.cyan : CHART.violet} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-4 text-xs text-slate-400">
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm" style={{ background: CHART.cyan }} />Earth</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm" style={{ background: CHART.violet }} />Moon</span>
          </div>
          <details className="mt-3 text-xs text-slate-400">
            <summary className="cursor-pointer text-slate-300">Sources for each bar</summary>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {TEMP_EXTREMES.map((t) => <li key={t.key}>{t.label}: {t.cite}</li>)}
            </ul>
          </details>
        </Glass>

        <Glass className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-white">Lunar equator through one day</h2>
            <Badge kind="model" />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Illustrative only. The curve is a simple physical model anchored to two published Diviner values (about 95 K night, 390 K noon). It is not a Diviner measurement, so do not read exact temperatures off it.
          </p>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={model} margin={{ top: 12, right: 12, left: 0, bottom: 20 }}>
                <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                <XAxis dataKey="day" type="number" domain={[0, 29.5]} tick={{ fill: CHART.text, fontSize: 11 }} label={{ value: 'Earth days through one lunar day (noon at day ~14.75)', position: 'insideBottom', offset: -10, fill: CHART.text, fontSize: 11 }} />
                <YAxis tick={{ fill: CHART.text, fontSize: 11 }} label={{ value: `Temperature (${unitLabel})`, angle: -90, position: 'insideLeft', fill: CHART.text, fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0b1230', border: '1px solid #334155', borderRadius: 8 }} formatter={(v) => [`${v} ${unitLabel}`, 'Modelled']} labelFormatter={(d) => `Day ${d}`} />
                <Legend verticalAlign="top" height={24} />
                <Line name="Modelled equatorial surface" type="monotone" dataKey="v" stroke={CHART.violet} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Glass>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-white">Similarities and differences</h2>
        <div className="mt-4 hidden overflow-hidden rounded-2xl border border-white/10 md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
              <tr><th className="p-3">Parameter</th><th className="p-3 text-cyan-200">Earth</th><th className="p-3 text-violet-200">Moon</th><th className="p-3">Type</th></tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((r) => (
                <tr key={r.param} className="border-t border-white/10 align-top">
                  <td className="p-3 font-semibold text-white">{r.param}{r.note && <div className="mt-1 text-xs font-normal text-slate-400">{r.note}</div>}</td>
                  <td className="p-3 text-slate-200">{r.earth}</td>
                  <td className="p-3 text-slate-200">{r.moon}</td>
                  <td className="p-3"><Badge kind={r.kind} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-3 md:hidden">
          {COMPARE_ROWS.map((r) => (
            <Glass key={r.param} className="p-4 text-sm">
              <div className="flex items-start justify-between gap-2"><div className="font-semibold text-white">{r.param}</div><Badge kind={r.kind} /></div>
              <div className="mt-2"><span className="text-cyan-200">Earth: </span>{r.earth}</div>
              <div className="mt-1"><span className="text-violet-200">Moon: </span>{r.moon}</div>
              {r.note && <div className="mt-2 text-xs text-slate-400">{r.note}</div>}
            </Glass>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Glass className="p-5">
          <h3 className="font-bold text-white">What they share</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
            <li>Both have polar regions where sunlight arrives at a very low angle.</li>
            <li>Both have cold places that can hold ice: Antarctica and Greenland on Earth, permanently shadowed craters on the Moon.</li>
            <li>Both are observed by satellite thermal infrared sensors, so temperature maps for each can be built the same way.</li>
          </ul>
        </Glass>
        <Glass className="p-5">
          <h3 className="font-bold text-white">What sets them apart</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
            <li>Earth's atmosphere and oceans move heat around, narrowing temperature swings. The Moon has no such buffer.</li>
            <li>Lunar polar craters are far colder than any measured natural place on Earth.</li>
            <li>Earth ice sits in a dynamic cycle of snow, melt and flow. Lunar ice, where present, has been trapped for a very long time.</li>
          </ul>
        </Glass>
      </section>
    </div>
  );
}
