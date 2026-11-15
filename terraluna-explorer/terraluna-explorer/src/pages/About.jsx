import React from 'react';
import { Glass, SectionTitle, ExtLink, Badge } from '../components/ui.jsx';
import { SOURCES } from '../lib/data.js';

const CITATIONS = [
  ['Paige, D. A. et al. (2010). Diviner Lunar Radiometer observations of cold traps in the Moon\'s south polar region. Science, 330, 479–482.', 'https://doi.org/10.1126/science.1187726'],
  ['Colaprete, A. et al. (2010). Detection of water in the LCROSS ejecta plume. Science, 330, 463–468.', 'https://doi.org/10.1126/science.1186986'],
  ['Williams, J.-P. et al. (2017). The global surface temperatures of the Moon as measured by the Diviner Lunar Radiometer Experiment. Icarus, 283, 300–325.', 'https://doi.org/10.1016/j.icarus.2016.08.012'],
  ['Scambos, T. A. et al. (2018). Ultralow surface temperatures in East Antarctica from satellite thermal infrared mapping. Geophysical Research Letters, 45.', 'https://doi.org/10.1029/2018GL079421'],
  ['World Meteorological Organization. Weather and Climate Extremes Archive.', 'https://wmo.asu.edu/'],
];

export default function About() {
  return (
    <div>
      <SectionTitle eyebrow="About and References" title="The problem, the solution, the sources" />

      <div className="grid gap-5 md:grid-cols-2">
        <Glass className="p-5">
          <h2 className="text-xl font-bold text-white">The problem</h2>
          <p className="mt-2 text-sm text-slate-300">
            Earth's deserts and ice sheets, and the Moon's polar craters, are studied by different missions, in different archives, with different tools. That makes it hard for students, teachers and curious people to see how the two worlds relate, or to tell what was measured from what was inferred.
          </p>
        </Glass>
        <Glass className="p-5">
          <h2 className="text-xl font-bold text-white">The solution</h2>
          <p className="mt-2 text-sm text-slate-300">
            TerraLuna Explorer puts live Earth imagery and climate data, lunar imagery, and published Diviner results into one interface, with every statement tagged as measured, derived, interpretation or illustrative model, and every number tied to a source.
          </p>
        </Glass>
      </div>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-white">Data sources</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {SOURCES.map((s) => (
            <Glass key={s.id} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-semibold text-slate-400">{s.agency}</div>
                <Badge kind={s.access} />
              </div>
              <div className="mt-1 font-semibold text-white">{s.name}</div>
              <p className="mt-1 text-sm text-slate-300">{s.desc}</p>
              <div className="mt-2 text-sm"><ExtLink href={s.url}>{s.url} ↗</ExtLink></div>
            </Glass>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <Glass className="p-5">
          <h2 className="text-xl font-bold text-white">How data is labelled</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li><Badge kind="live" /> fetched from the service when you use the page (GIBS tiles, NASA POWER, NASA CMR, Moon Trek tiles).</li>
            <li><Badge kind="measured" /> a published value from a cited paper or official archive. It is a stored literature value, not a live query.</li>
            <li><Badge kind="derived" /> arithmetic on measured values, such as a temperature swing.</li>
            <li><Badge kind="interpretation" /> a scientific explanation or modelled threshold built on observations.</li>
            <li><Badge kind="model" /> an illustration for understanding only. The Moon day curve on the Compare page is one.</li>
          </ul>
        </Glass>
        <Glass className="p-5">
          <h2 className="text-xl font-bold text-white">Known limitations</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
            <li>Live layers depend on NASA services. When a date has no tiles or a service is down, the page shows a message instead of fake data.</li>
            <li>ESA Copernicus, CSA RADARSAT and JAXA G-Portal are linked rather than queried in the browser, because downloads require registration or authentication.</li>
            <li>Moon temperatures are published summary values. Raw Diviner products are available from the PDS, not processed here.</li>
            <li>Earth air temperature records and lunar surface temperatures are different physical quantities.</li>
            <li>The assistant is a retrieval system over a small curated knowledge base, not a general chatbot.</li>
          </ul>
        </Glass>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-white">Scientific references</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          {CITATIONS.map((c) => (
            <li key={c[1]}>{c[0]} <ExtLink href={c[1]}>Link ↗</ExtLink></li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <Glass className="p-5">
          <h2 className="text-xl font-bold text-white">Attribution and acknowledgements</h2>
          <p className="mt-2 text-sm text-slate-300">
            Imagery courtesy of NASA Global Imagery Browse Services (GIBS), NASA EOSDIS and the MODIS and GPM science teams. Lunar imagery and elevation courtesy of NASA/GSFC/Arizona State University (LROC) and NASA Moon Trek. Climate data from the NASA Langley Research Center POWER Project. Maps by Leaflet. Charts by Recharts.
          </p>
          <p className="mt-2 text-sm text-slate-300">
            ESA Copernicus Sentinel data, CSA RADARSAT data and JAXA satellite data are credited to their agencies and remain subject to their own terms of use. Built for the NASA International Space Apps Challenge. This is an educational project; it is not an official product of NASA, ESA, CSA or JAXA, and use of agency data does not imply endorsement.
          </p>
        </Glass>
      </section>
    </div>
  );
}
