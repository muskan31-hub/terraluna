import React, { useEffect, useRef, useState } from 'react';
import { Glass, SectionTitle, ExtLink, Badge } from '../components/ui.jsx';
import { answerFromKb } from '../lib/kb.js';
import { mean, minOf, maxOf } from '../lib/api.js';

const SUGGESTIONS = [
  'What is Diviner and what did it measure?',
  'Why are lunar polar craters so cold?',
  'Is there water ice on the Moon?',
  'What is the difference between air and surface temperature?',
  'What does NDVI tell us?',
  'Summarize the data I loaded in the Dashboard',
];

function summarizePower(power) {
  const { rows, meta, name } = power;
  const t = rows.map((r) => r.t2m);
  const p = rows.map((r) => r.precip);
  const warm = rows.reduce((a, b) => (b.t2m != null && (a == null || b.t2m > a.t2m) ? b : a), null);
  const cold = rows.reduce((a, b) => (b.t2m != null && (a == null || b.t2m < a.t2m) ? b : a), null);
  const u = meta.units.t2m === 'C' ? '°C' : meta.units.t2m;
  const lines = [
    `For ${name} (${meta.lat}°, ${meta.lon}°), NASA POWER monthly data for ${meta.startYear}–${meta.endYear} show a mean 2 m air temperature of ${mean(t).toFixed(1)} ${u}.`,
    warm && cold ? `The warmest month in the record was ${warm.date} (${warm.t2m.toFixed(1)} ${u}) and the coldest was ${cold.date} (${cold.t2m.toFixed(1)} ${u}).` : '',
    mean(p) != null ? `Mean precipitation was ${mean(p).toFixed(2)} ${meta.units.precip}, with monthly values from ${minOf(p).toFixed(2)} to ${maxOf(p).toFixed(2)} ${meta.units.precip}.` : '',
    'These are grid-cell values from a reanalysis product and describe what is in the loaded data only. I cannot say from this alone whether the climate there is changing.',
  ];
  return lines.filter(Boolean).join(' ');
}

export default function Assistant({ power }) {
  const [msgs, setMsgs] = useState([
    { role: 'bot', text: 'Hi! I answer questions about satellite observations of Earth and the Moon. I only use cited sources and the data you have loaded, so if I do not have a sourced answer I will say so instead of guessing.', src: [] },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [msgs]);

  function ask(q) {
    const text = q.trim();
    if (!text) return;
    const lower = text.toLowerCase();
    let reply;
    if (/(summar|loaded|my data|dashboard|pattern)/.test(lower) && /(data|loaded|dashboard|summar|pattern)/.test(lower)) {
      if (power) {
        reply = { role: 'bot', text: summarizePower(power), src: [['NASA POWER', 'https://power.larc.nasa.gov']], tag: 'Computed from your loaded data' };
      } else {
        reply = { role: 'bot', text: 'No data is loaded yet. Open the Dashboard, pick a place and press Load data, then ask me again and I will summarize it.', src: [] };
      }
    } else {
      const hit = answerFromKb(text);
      if (hit) {
        reply = { role: 'bot', text: hit.a, src: hit.src, tag: 'From cited sources' };
      } else {
        reply = {
          role: 'bot',
          text: 'I do not have a sourced answer for that, and I will not guess at measurements. You could try asking about Diviner, polar craters, lunar ice, land surface temperature, NDVI, rainfall or the data sources. For primary data, search NASA Earthdata or the Planetary Data System.',
          src: [['NASA Earthdata Search', 'https://search.earthdata.nasa.gov'], ['NASA PDS', 'https://pds.nasa.gov']],
        };
      }
    }
    setMsgs((m) => [...m, { role: 'user', text }, reply]);
    setInput('');
  }

  return (
    <div>
      <SectionTitle eyebrow="AI Science Assistant" title="Ask about the observations">
        Plain-language answers grounded in cited sources and in the data you load. It never makes up measurements.
      </SectionTitle>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <Glass className="flex h-[65vh] min-h-[420px] flex-col p-4">
          <div className="flex-1 space-y-3 overflow-y-auto pr-1" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-gradient-to-r from-cyan-600/70 to-blue-600/70 text-white' : 'border border-white/10 bg-white/5 text-slate-200'}`}>
                  <div>{m.text}</div>
                  {m.tag && <div className="mt-2"><span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-200">{m.tag}</span></div>}
                  {m.src && m.src.length > 0 && (
                    <div className="mt-2 text-xs text-slate-400">
                      Sources: {m.src.map((s, j) => (
                        <span key={j}>{j > 0 && ' · '}{s[1].startsWith('#') ? <a className="text-cyan-300 underline" href={s[1]}>{s[0]}</a> : <ExtLink href={s[1]}>{s[0]}</ExtLink>}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
            <input className="field flex-1 !py-2.5" placeholder="Ask about Diviner, lunar ice, NDVI, rainfall…" value={input} onChange={(e) => setInput(e.target.value)} aria-label="Your question" />
            <button className="btn btn-earth !py-2.5" type="submit">Ask</button>
          </form>
        </Glass>

        <div className="space-y-4">
          <Glass className="p-4">
            <div className="text-sm font-semibold text-white">Try asking</div>
            <div className="mt-3 flex flex-col gap-2">
              {SUGGESTIONS.map((s) => <button key={s} className="chip text-left" onClick={() => ask(s)}>{s}</button>)}
            </div>
          </Glass>
          <Glass className="p-4 text-xs text-slate-300">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">How it stays honest</div>
            <ul className="list-disc space-y-1 pl-4">
              <li>Answers come from a curated, cited knowledge base.</li>
              <li>Data summaries are computed from what you loaded, not recalled.</li>
              <li>No match means it says so.</li>
              <li>Measurements and interpretations are named as such.</li>
            </ul>
            <div className="mt-3 flex items-center gap-2">{power ? <Badge kind="live" /> : <Badge kind="link" />}<span>{power ? `Data loaded: ${power.name}` : 'No dashboard data loaded'}</span></div>
          </Glass>
        </div>
      </div>
    </div>
  );
}
