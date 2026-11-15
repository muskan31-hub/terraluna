import React, { useEffect, useRef } from 'react';

export function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="tl-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle cx="26" cy="34" r="16" fill="none" stroke="url(#tl-g)" strokeWidth="4" />
      <ellipse cx="26" cy="34" rx="16" ry="6" fill="none" stroke="#22d3ee" strokeOpacity=".5" strokeWidth="1.5" />
      <circle cx="43" cy="24" r="9" fill="url(#tl-g)" />
      <circle cx="40" cy="22" r="1.8" fill="#0b1230" opacity=".5" />
      <circle cx="46" cy="27" r="1.3" fill="#0b1230" opacity=".5" />
    </svg>
  );
}

export function Starfield() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext('2d');
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf;
    let w = 0;
    let h = 0;
    let stars = [];
    const init = () => {
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
      const n = Math.min(260, Math.floor((w * h) / 6500));
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.3 + 0.2,
        p: Math.random() * 6.28, s: Math.random() * 0.02 + 0.005, d: Math.random() * 0.12 + 0.02,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        if (!reduce) { s.p += s.s; s.y += s.d * 0.12; if (s.y > h) s.y = 0; }
        ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(s.p));
        ctx.fillStyle = '#cfe8ff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    init();
    draw();
    window.addEventListener('resize', init);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', init); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true" />;
}

export function Glass({ className = '', hover = false, children }) {
  return <div className={`glass ${hover ? 'glass-hover' : ''} ${className}`}>{children}</div>;
}

export function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 text-sm text-cyan-200" role="status" aria-live="polite">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorBanner({ title = 'Something went wrong', children, onRetry }) {
  return (
    <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100" role="alert">
      <div className="font-semibold text-amber-200">{title}</div>
      <div className="mt-1 text-amber-100/90">{children}</div>
      {onRetry && (
        <button className="chip chip-on mt-3" onClick={onRetry}>Try again</button>
      )}
    </div>
  );
}

const BADGES = {
  measured: ['Measured observation', 'border-emerald-400/50 bg-emerald-500/10 text-emerald-200'],
  derived: ['Derived from measurements', 'border-sky-400/50 bg-sky-500/10 text-sky-200'],
  interpretation: ['Scientific interpretation', 'border-violet-400/50 bg-violet-500/10 text-violet-200'],
  model: ['Illustrative model', 'border-amber-400/50 bg-amber-500/10 text-amber-200'],
  live: ['Live data', 'border-cyan-400/50 bg-cyan-500/10 text-cyan-200'],
  link: ['Link only', 'border-slate-400/40 bg-slate-500/10 text-slate-300'],
};

export function Badge({ kind }) {
  const b = BADGES[kind] || BADGES.link;
  return <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${b[1]}`}>{b[0]}</span>;
}

export function SectionTitle({ eyebrow, title, children }) {
  return (
    <div className="mb-6 fadeup">
      {eyebrow && <div className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/80">{eyebrow}</div>}
      <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">{title}</h1>
      {children && <p className="mt-3 max-w-3xl text-slate-300">{children}</p>}
    </div>
  );
}

export function Planet({ kind, className = '' }) {
  return <div className={`rounded-full ${kind === 'earth' ? 'planet-earth' : 'planet-moon'} ${className}`} aria-hidden="true" />;
}

export function ExtLink({ href, children, className = '' }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`text-cyan-300 underline decoration-cyan-300/40 underline-offset-2 hover:text-cyan-200 ${className}`}>
      {children}
    </a>
  );
}

export const CHART = { cyan: '#22d3ee', violet: '#a78bfa', blue: '#60a5fa', amber: '#fbbf24', grid: '#1e293b', text: '#94a3b8' };
