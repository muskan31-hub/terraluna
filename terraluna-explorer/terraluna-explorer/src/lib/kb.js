// Curated, source-backed knowledge base for the AI Science Assistant.
// The assistant ONLY answers from these entries (and from data the user has loaded).
// If nothing matches it says so, so it cannot invent measurements.

export const KB = [
  { id: 'diviner', kw: ['diviner', 'lunar radiometer', 'moon temperature', 'lunar temperature', 'measure temperature moon'],
    a: 'Diviner is a thermal infrared radiometer on NASA\'s Lunar Reconnaissance Orbiter. It measures the heat radiated by the lunar surface, which is converted to surface temperature. It has mapped the Moon\'s day, night and polar temperatures since 2009.',
    src: [['LRO Diviner at PDS Geosciences', 'https://pds-geosciences.wustl.edu/missions/lro/diviner.htm']] },
  { id: 'moon-range', kw: ['moon hot', 'moon cold', 'lunar temperature range', 'how hot', 'how cold', 'equator', 'noon'],
    a: 'Diviner found equatorial surface temperatures of roughly 95 K at night and around 390 K at noon (Williams et al. 2017). That is a swing of about 295 K, which this site derives from those two published values.',
    src: [['Williams et al. 2017, Icarus', 'https://doi.org/10.1016/j.icarus.2016.08.012']] },
  { id: 'psr', kw: ['permanently shadowed', 'psr', 'polar crater', 'shadow', 'why cold', 'cold trap', 'polar'],
    a: 'The Moon\'s axis is tilted only about 1.5°, so the Sun stays very low near the poles. The floors of some deep polar craters never receive direct sunlight. With no atmosphere to carry heat, they stay extremely cold. Diviner reported temperatures near 25 K in some of them (Paige et al. 2010). The explanation of why they are cold is an interpretation built on those measurements.',
    src: [['Paige et al. 2010, Science', 'https://doi.org/10.1126/science.1187726']] },
  { id: 'ice-stability', kw: ['ice stable', 'ice stability', '110', 'water ice', 'frozen', 'volatile', 'cold trap temperature'],
    a: 'Thermal models suggest water ice can persist at the surface over geologic time where temperatures stay below about 110 K. That threshold is a modelled interpretation, not a direct detection of ice.',
    src: [['Paige et al. 2010, Science', 'https://doi.org/10.1126/science.1187726']] },
  { id: 'lcross', kw: ['lcross', 'cabeus', 'water on the moon', 'moon water', 'ice on the moon', 'detected water'],
    a: 'In 2009 NASA\'s LCROSS mission impacted the Cabeus crater and analysed the plume. Researchers reported water at about 5.6 ± 2.9 % by mass in the ejecta (Colaprete et al. 2010). It is one site, and how widespread lunar ice is remains an active research question.',
    src: [['Colaprete et al. 2010, Science', 'https://doi.org/10.1126/science.1186986']] },
  { id: 'lro', kw: ['lro', 'lunar reconnaissance', 'orbiter', 'lola', 'lroc', 'wac'],
    a: 'The Lunar Reconnaissance Orbiter launched in 2009. Its instruments include cameras (LROC), the laser altimeter LOLA that maps topography, and Diviner for temperature. This site shows a camera mosaic and elevation layer through NASA Moon Trek.',
    src: [['NASA LRO mission', 'https://science.nasa.gov/mission/lro/'], ['NASA Moon Trek', 'https://trek.nasa.gov/moon/']] },
  { id: 'pds', kw: ['pds', 'planetary data system', 'archive', 'planetary data'],
    a: 'The Planetary Data System is NASA\'s official archive for planetary mission data. LRO data, including Diviner products, are published through the PDS Geosciences Node.',
    src: [['NASA PDS', 'https://pds.nasa.gov']] },
  { id: 'lst', kw: ['land surface temperature', 'lst', 'skin temperature', 'surface temperature earth', 'modis temperature'],
    a: 'Land surface temperature (LST) from MODIS is the temperature of the ground or canopy "skin" seen by infrared sensors. It can differ a lot from the air temperature at 2 m that weather stations report, especially on bare, sunlit ground.',
    src: [['NASA GIBS layer catalogue', 'https://nasa-gibs.github.io/gibs-api-docs/available-visualizations/']] },
  { id: 'air-vs-surface', kw: ['air temperature', 'weather station', 't2m', 'difference between air', 'compare temperature'],
    a: 'Air temperature (such as NASA POWER T2M or WMO station records) and surface temperature (such as MODIS LST or Diviner) are different quantities. This site labels which one each number is and avoids treating them as interchangeable.',
    src: [['NASA POWER', 'https://power.larc.nasa.gov']] },
  { id: 'ndvi', kw: ['ndvi', 'vegetation', 'green', 'greenness', 'plants'],
    a: 'NDVI compares how much red and near-infrared light a surface reflects. Healthy plants absorb red light and reflect near-infrared, giving high NDVI. Values near zero mean bare ground, and negative values usually mean water, snow or cloud.',
    src: [['NASA Earth Observatory: NDVI', 'https://earthobservatory.nasa.gov/features/MeasuringVegetation']] },
  { id: 'imerg', kw: ['imerg', 'rainfall', 'rain', 'precipitation', 'gpm'],
    a: 'IMERG merges data from the international GPM constellation of satellites into a global precipitation estimate every 30 minutes. It is an estimate from satellite sensors and calibrated with rain gauges, not a direct gauge measurement everywhere.',
    src: [['NASA GPM IMERG', 'https://gpm.nasa.gov/data/imerg']] },
  { id: 'snow', kw: ['snow', 'ice cover', 'ndsi', 'sea ice', 'glacier', 'ice sheet'],
    a: 'The NDSI snow layer estimates how much of each pixel is snow-covered from MODIS reflectance. Clouds and polar night can hide the surface, so gaps in the map are not necessarily "no snow".',
    src: [['NASA NSIDC', 'https://nsidc.org/']] },
  { id: 'antarctic-cold', kw: ['coldest earth', 'coldest place', 'antarctica', 'vostok', '93', 'record low'],
    a: 'The WMO-recognised lowest air temperature is -89.2 °C at Vostok Station (1983). Satellite measurements of the East Antarctic Plateau surface reached about -93.2 °C (Scambos et al. 2018). Even that is far warmer than the roughly 25 K (-248 °C) reported in lunar polar craters.',
    src: [['WMO Extremes Archive', 'https://wmo.asu.edu/'], ['Scambos et al. 2018, Geophys. Res. Lett.', 'https://doi.org/10.1029/2018GL079421']] },
  { id: 'hottest', kw: ['hottest', 'death valley', 'record high', '56.7', 'lut'],
    a: 'The WMO-recognised highest air temperature is 56.7 °C at Furnace Creek, Death Valley (1913). Land surface temperatures in deserts can be higher than air temperatures, but those satellite values are a different quantity.',
    src: [['WMO Extremes Archive', 'https://wmo.asu.edu/']] },
  { id: 'copernicus', kw: ['copernicus', 'sentinel', 'esa', 'european'],
    a: 'The Copernicus Data Space Ecosystem is ESA\'s open archive for the Sentinel satellites (radar, optical, atmosphere). It is linked from this site, and a public catalogue search is available through the optional FastAPI backend.',
    src: [['Copernicus Data Space Ecosystem', 'https://dataspace.copernicus.eu']] },
  { id: 'radarsat', kw: ['radarsat', 'sar', 'radar', 'csa', 'canadian', 'rcm'],
    a: 'RADARSAT and the RADARSAT Constellation Mission are Canadian Space Agency radar satellites. Radar sees through clouds and darkness, which makes it useful for sea ice, floods and ground change. Radar is also used at the lunar poles, where Mini-RF on LRO studied surface roughness.',
    src: [['CSA RADARSAT', 'https://www.asc-csa.gc.ca/eng/satellites/radarsat/']] },
  { id: 'jaxa', kw: ['jaxa', 'g-portal', 'gportal', 'japan', 'gcom'],
    a: 'JAXA\'s G-Portal gives access to Japanese Earth observation data such as GCOM-W (water and sea ice) and GCOM-C (climate). Account registration is required to download, so this site links to it.',
    src: [['JAXA G-Portal', 'https://gportal.jaxa.jp/gpr/']] },
  { id: 'worldview', kw: ['worldview', 'gibs', 'tiles', 'earthdata search', 'cmr', 'find data'],
    a: 'NASA Worldview is a browser for satellite imagery built on GIBS tile services, which power the Earth Explorer map here. Earthdata Search finds datasets across NASA archives, and this site queries its public CMR API live.',
    src: [['NASA Worldview', 'https://worldview.earthdata.nasa.gov'], ['NASA Earthdata Search', 'https://search.earthdata.nasa.gov']] },
  { id: 'honesty', kw: ['demo', 'sample', 'fake', 'real data', 'trust', 'accurate', 'limitation', 'label'],
    a: 'Maps and the Dashboard time series are fetched live from NASA services. Moon temperature extremes and Earth records are published literature values, each cited. The day/night curve on the Compare page is an illustrative physical model and is labelled as such. No satellite observation on this site is invented.',
    src: [['About and References', '#/about']] },
];

const STOP = new Set(['the', 'a', 'an', 'is', 'are', 'of', 'in', 'on', 'to', 'and', 'what', 'how', 'why', 'does', 'do', 'it', 'me', 'tell', 'about', 'can', 'you', 'for', 'with', 'this', 'that']);

export function tokens(text) {
  return text.toLowerCase().replace(/[^a-z0-9.\-\s]/g, ' ').split(/\s+/).filter((t) => t && !STOP.has(t));
}

export function answerFromKb(question) {
  const q = question.toLowerCase();
  const toks = tokens(question);
  let best = null;
  let bestScore = 0;
  for (const e of KB) {
    let s = 0;
    for (const k of e.kw) {
      if (q.includes(k)) s += k.includes(' ') ? 3 : 2;
      else if (toks.some((t) => t.length > 3 && k.includes(t))) s += 1;
    }
    if (s > bestScore) { bestScore = s; best = e; }
  }
  return bestScore >= 2 ? best : null;
}
