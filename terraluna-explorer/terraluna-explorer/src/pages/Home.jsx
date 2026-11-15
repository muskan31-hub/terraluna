import React from 'react';
import { Glass, Planet, Badge, ExtLink } from '../components/ui.jsx';
import { SOURCES } from '../lib/data.js';

const FEATURES = [
  { href: '#/earth', title: 'Earth Explorer', text: 'Browse live NASA satellite imagery of temperature, vegetation, rainfall and ice, and jump to extreme environments.' },
  { href: '#/moon', title: 'Moon Explorer', text: 'Fly over LRO imagery and elevation, and examine the polar craters where sunlight never reaches.' },
  { href: '#/compare', title: 'Earth vs Moon', text: 'Side-by-side comparison with charts. Every statement is tagged as measured, derived, or interpretation.' },
  { href: '#/dashboard', title: 'Data Dashboard', text: 'Pull NASA POWER climate data for any point on Earth, with units, dates, location and download.' },
  { href: '#/assistant', title: 'AI Science Assistant', text: 'Ask plain-language questions. Answers come only from cited sources, never invented numbers.' },
  { href: '#/about', title: 'About & References', text: 'The problem, the approach, and full attribution for every dataset and agency.' },
];

export default function Home() {
  return (
    <div>
      <section className="relative grid items-center gap-10 py-10 md:grid-cols-2 md:py-16">
        <div className="fadeup">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
            NASA Space Apps Challenge · Open satellite data
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            One Planet.<br />Two Worlds.<br /><span className="gradient-text">Endless Discoveries.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">
            TerraLuna Explorer places Earth's most extreme places beside the Moon's polar craters, using open data from NASA, ESA, CSA and JAXA, so you can see how two worlds heat, freeze and hold water.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#/earth" className="btn btn-earth">Explore Earth</a>
            <a href="#/moon" className="btn btn-moon">Explore Moon</a>
            <a href="#/compare" className="btn btn-ghost">Compare them</a>
          </div>
        </div>

        <div className="relative mx-auto h-72 w-full max-w-md sm:h-96" aria-label="Illustration of Earth and the Moon">
          <Planet kind="earth" className="floaty absolute left-2 top-4 h-52 w-52 sm:h-72 sm:w-72" />
          <Planet kind="moon" className="floaty-slow absolute bottom-2 right-2 h-24 w-24 sm:h-36 sm:w-36" />
          <div className="absolute left-1/2 top-1/2 h-px w-2/3 -translate-x-1/2 rotate-[-12deg] border-t border-dashed border-cyan-300/30" />
        </div>
      </section>

      <section className="my-6 grid gap-4 md:grid-cols-3">
        <Glass className="p-5">
          <div className="text-sm font-semibold text-cyan-300">The question</div>
          <p className="mt-2 text-sm text-slate-300">Earth and the Moon both have places that are brutally cold or hot. How alike are they, really, and where do they differ?</p>
        </Glass>
        <Glass className="p-5">
          <div className="text-sm font-semibold text-violet-300">The approach</div>
          <p className="mt-2 text-sm text-slate-300">Use real satellite data on a shared interface. Show live Earth data, cite published Moon measurements, and separate observation from interpretation.</p>
        </Glass>
        <Glass className="p-5">
          <div className="text-sm font-semibold text-blue-300">The promise</div>
          <p className="mt-2 text-sm text-slate-300">No invented measurements. Anything illustrative is labelled. Every number has a source or a link.</p>
        </Glass>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-white">What you can do here</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <a key={f.href} href={f.href} className="no-underline">
              <Glass hover className="h-full p-5">
                <div className="text-lg font-semibold text-white">{f.title}</div>
                <p className="mt-2 text-sm text-slate-300">{f.text}</p>
                <div className="mt-3 text-sm text-cyan-300">Open →</div>
              </Glass>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold text-white">Powered by open data</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SOURCES.map((s) => (
            <Glass key={s.id} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-400">{s.agency}</span>
                <Badge kind={s.access} />
              </div>
              <div className="mt-2 text-sm font-semibold text-white">{s.name}</div>
              <div className="mt-2 text-xs"><ExtLink href={s.url}>Visit source ↗</ExtLink></div>
            </Glass>
          ))}
        </div>
      </section>
    </div>
  );
}
