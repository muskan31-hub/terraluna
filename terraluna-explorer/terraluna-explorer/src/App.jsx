import React, { useEffect, useState } from 'react';
import { Starfield, Logo } from './components/ui.jsx';
import Home from './pages/Home.jsx';
import EarthExplorer from './pages/EarthExplorer.jsx';
import MoonExplorer from './pages/MoonExplorer.jsx';
import Compare from './pages/Compare.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Assistant from './pages/Assistant.jsx';
import About from './pages/About.jsx';

const ROUTES = [
  { path: '/', label: 'Home' },
  { path: '/earth', label: 'Earth' },
  { path: '/moon', label: 'Moon' },
  { path: '/compare', label: 'Compare' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/assistant', label: 'AI Assistant' },
  { path: '/about', label: 'About' },
];

function currentPath() {
  const p = window.location.hash.replace(/^#/, '') || '/';
  return ROUTES.some((r) => r.path === p) ? p : '/';
}

export default function App() {
  const [route, setRoute] = useState(currentPath());
  const [menuOpen, setMenuOpen] = useState(false);
  // Shared state: the location the user picked on the Earth map, and the latest NASA POWER data loaded.
  const [point, setPoint] = useState({ lat: -78.46, lon: 106.84, name: 'Vostok Station' });
  const [power, setPower] = useState(null);

  useEffect(() => {
    const onHash = () => { setRoute(currentPath()); setMenuOpen(false); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  let page = null;
  if (route === '/') page = <Home />;
  else if (route === '/earth') page = <EarthExplorer point={point} setPoint={setPoint} />;
  else if (route === '/moon') page = <MoonExplorer />;
  else if (route === '/compare') page = <Compare />;
  else if (route === '/dashboard') page = <Dashboard point={point} setPoint={setPoint} power={power} setPower={setPower} />;
  else if (route === '/assistant') page = <Assistant power={power} />;
  else page = <About />;

  return (
    <div className="relative min-h-screen">
      <Starfield />
      <header className="sticky top-0 z-[1000] border-b border-white/10 bg-[#050816]/75 backdrop-blur-lg">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3" aria-label="Main">
          <a href="#/" className="flex items-center gap-2 text-white no-underline">
            <Logo />
            <span className="text-lg font-bold tracking-wide">Terra<span className="gradient-text">Luna</span></span>
          </a>
          <button className="chip md:hidden" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-label="Toggle menu">
            {menuOpen ? 'Close' : 'Menu'}
          </button>
          <ul className="hidden items-center gap-1 md:flex">
            {ROUTES.map((r) => (
              <li key={r.path}>
                <a href={'#' + r.path}
                  className={`rounded-full px-3.5 py-1.5 text-sm no-underline transition ${route === r.path ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {menuOpen && (
          <ul className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 md:hidden">
            {ROUTES.map((r) => (
              <li key={r.path}>
                <a href={'#' + r.path} className={`block rounded-lg px-3 py-2 no-underline ${route === r.path ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-300'}`}>{r.label}</a>
              </li>
            ))}
          </ul>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8">{page}</main>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-xs text-slate-400">
        TerraLuna Explorer · Built for the NASA International Space Apps Challenge · Imagery and data courtesy of NASA, ESA, CSA and JAXA open data programs.
        <div className="mt-1">This is an educational project and is not an official product of any space agency.</div>
      </footer>
    </div>
  );
}
