// Static reference data for TerraLuna Explorer.
// Every number here is a published literature value (cited) or a coordinate used to place a marker.
// Nothing in this file is a live satellite observation. Live data is fetched in lib/api.js.

export const SOURCES = [
  { id: 'earthdata', name: 'NASA Earthdata Search', agency: 'NASA', url: 'https://search.earthdata.nasa.gov', access: 'live',
    desc: 'Dataset discovery across NASA Earth science archives. TerraLuna queries the public CMR API live from the Earth Explorer page.' },
  { id: 'worldview', name: 'NASA Worldview / GIBS', agency: 'NASA', url: 'https://worldview.earthdata.nasa.gov', access: 'live',
    desc: 'Global Imagery Browse Services (GIBS) tiles power the Earth Explorer map: MODIS, IMERG and more.' },
  { id: 'pds', name: 'NASA Planetary Data System', agency: 'NASA', url: 'https://pds.nasa.gov', access: 'link',
    desc: 'Official archive of planetary mission data, including Lunar Reconnaissance Orbiter products. Linked, not queried live.' },
  { id: 'lro', name: 'Lunar Reconnaissance Orbiter (LRO)', agency: 'NASA', url: 'https://science.nasa.gov/mission/lro/', access: 'live',
    desc: 'Lunar mosaics and elevation layers are shown through NASA Moon Trek tile services on the Moon Explorer page.' },
  { id: 'diviner', name: 'LRO Diviner Lunar Radiometer', agency: 'NASA', url: 'https://pds-geosciences.wustl.edu/missions/lro/diviner.htm', access: 'link',
    desc: 'Thermal infrared radiometer that measured lunar surface temperatures. Literature values are shown; raw products are linked.' },
  { id: 'copernicus', name: 'Copernicus Data Space Ecosystem', agency: 'ESA', url: 'https://dataspace.copernicus.eu', access: 'link',
    desc: 'Sentinel mission archive. Searching is available through the optional FastAPI backend; the website links to the browser.' },
  { id: 'radarsat', name: 'RADARSAT / RADARSAT Constellation Mission', agency: 'CSA', url: 'https://www.asc-csa.gc.ca/eng/satellites/radarsat/', access: 'link',
    desc: 'Canadian synthetic aperture radar. Useful for sea ice, floods and surface change. Some products require registration.' },
  { id: 'gportal', name: 'G-Portal', agency: 'JAXA', url: 'https://gportal.jaxa.jp/gpr/', access: 'link',
    desc: 'JAXA satellite data portal (e.g. GCOM-W, GCOM-C, GPM/DPR). Account registration is required for downloads.' },
];

// NASA GIBS layers (EPSG:3857 WMTS). Layer IDs and matrix sets follow the GIBS catalogue.
// If GIBS renames a layer, the map shows an error banner rather than silently failing.
export const GIBS_BASE = { layer: 'BlueMarble_ShadedRelief_Bathymetry', matrix: 'GoogleMapsCompatible_Level8', ext: 'jpeg', maxZoom: 8, timeBased: false };

export const GIBS_LAYERS = [
  { id: 'truecolor', label: 'True colour imagery', layer: 'MODIS_Terra_CorrectedReflectance_TrueColor', matrix: 'GoogleMapsCompatible_Level9', ext: 'jpg', maxZoom: 9, timeBased: true,
    unit: 'reflectance (visual)', instrument: 'Terra / MODIS', theme: 'Imagery', desc: 'Natural-colour view of Earth as a camera in orbit would see it.' },
  { id: 'lst', label: 'Land surface temperature (day)', layer: 'MODIS_Terra_Land_Surface_Temp_Day', matrix: 'GoogleMapsCompatible_Level7', ext: 'png', maxZoom: 7, timeBased: true,
    unit: 'kelvin (K)', instrument: 'Terra / MODIS', theme: 'Temperature', desc: 'Skin temperature of the land surface, not the air temperature measured by weather stations.' },
  { id: 'ndvi', label: 'Vegetation (NDVI, 8-day)', layer: 'MODIS_Terra_NDVI_8Day', matrix: 'GoogleMapsCompatible_Level9', ext: 'png', maxZoom: 9, timeBased: true,
    unit: 'index (unitless, -1 to 1)', instrument: 'Terra / MODIS', theme: 'Vegetation', desc: 'Greenness index: higher values indicate denser, healthier vegetation.' },
  { id: 'rain', label: 'Rainfall rate (IMERG)', layer: 'IMERG_Precipitation_Rate', matrix: 'GoogleMapsCompatible_Level6', ext: 'png', maxZoom: 6, timeBased: true,
    unit: 'mm per hour', instrument: 'GPM constellation / IMERG', theme: 'Rainfall', desc: 'Merged multi-satellite precipitation estimate, updated every 30 minutes.' },
  { id: 'snow', label: 'Snow and ice cover (NDSI)', layer: 'MODIS_Terra_NDSI_Snow_Cover', matrix: 'GoogleMapsCompatible_Level8', ext: 'png', maxZoom: 8, timeBased: true,
    unit: 'NDSI snow cover (%)', instrument: 'Terra / MODIS', theme: 'Ice', desc: 'Fraction of each pixel covered by snow. Cloud cover can hide the surface.' },
];

export const EARTH_PRESETS = [
  { name: 'Antarctic Plateau (Dome Argus)', lat: -80.37, lon: 77.35, why: 'Among the coldest places on Earth' },
  { name: 'Vostok Station', lat: -78.46, lon: 106.84, why: 'WMO record low air temperature, -89.2 °C (1983)' },
  { name: 'Death Valley', lat: 36.46, lon: -116.87, why: 'WMO record high air temperature, 56.7 °C (1913)' },
  { name: 'Lut Desert, Iran', lat: 30.5, lon: 59.0, why: 'Very hot, barren land surface' },
  { name: 'Greenland Ice Sheet', lat: 72.6, lon: -38.5, why: 'Ice sheet environment' },
  { name: 'Atacama Desert', lat: -24.5, lon: -69.25, why: 'One of the driest deserts on Earth' },
  { name: 'Amazon Basin', lat: -3.1, lon: -60.0, why: 'Dense vegetation, heavy rainfall' },
  { name: 'Sahara Desert', lat: 23.4, lon: 12.0, why: 'Large hot desert' },
];

// Moon Trek WMTS tile services (geographic projection). Verified patterns may change; map shows an error banner on failure.
export const MOON_LAYERS = [
  { id: 'wac', label: 'LRO WAC global mosaic (imagery)', url: 'https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    maxNative: 7, desc: 'Wide Angle Camera mosaic from the Lunar Reconnaissance Orbiter, roughly 100 m per pixel.' },
  { id: 'lola', label: 'LRO LOLA elevation (colour-shaded)', url: 'https://trek.nasa.gov/tiles/Moon/EQ/LRO_LOLA_ClrShade_Global_128ppd_v04/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    maxNative: 6, desc: 'Lunar Orbiter Laser Altimeter topography, colour-shaded by height.' },
];

// Approximate crater centres (IAU gazetteer, rounded) and diameters. Used only to place markers.
export const MOON_SITES = [
  { name: 'Shackleton', lat: -89.9, lon: 129.8, km: 21, note: 'Sits almost exactly on the south pole. Its interior is permanently shadowed.' },
  { name: 'Cabeus', lat: -84.9, lon: -35.5, km: 98, note: 'Target of the 2009 LCROSS impact. Ejecta analysis reported water (5.6 ± 2.9 % by mass, Colaprete et al. 2010).' },
  { name: 'Shoemaker', lat: -88.1, lon: 44.9, km: 51, note: 'Large polar crater with permanently shadowed floor regions.' },
  { name: 'Faustini', lat: -87.3, lon: 77.0, km: 39, note: 'Polar crater with permanently shadowed floor regions.' },
  { name: 'Haworth', lat: -87.5, lon: -5.0, km: 51, note: 'Polar crater with permanently shadowed floor regions.' },
  { name: 'de Gerlache', lat: -88.5, lon: -87.1, km: 32, note: 'Polar crater with permanently shadowed floor regions.' },
];

// Literature-cited temperature extremes (kelvin). kind: measured | derived.
export const TEMP_EXTREMES = [
  { key: 'earthLow', label: 'Earth record low (air)', k: 183.95, body: 'Earth', kind: 'measured', cite: 'WMO: -89.2 °C, Vostok Station, 21 July 1983' },
  { key: 'earthHigh', label: 'Earth record high (air)', k: 329.85, body: 'Earth', kind: 'measured', cite: 'WMO: 56.7 °C, Furnace Creek, 10 July 1913' },
  { key: 'moonPSR', label: 'Moon polar shadow (coldest)', k: 25, body: 'Moon', kind: 'measured', cite: 'LRO Diviner, ~25 K in permanently shadowed craters (Paige et al. 2010, Science)' },
  { key: 'moonNight', label: 'Moon equator, night', k: 95, body: 'Moon', kind: 'measured', cite: 'LRO Diviner, ~95 K (Williams et al. 2017, Icarus)' },
  { key: 'moonNoon', label: 'Moon equator, noon', k: 390, body: 'Moon', kind: 'measured', cite: 'LRO Diviner, roughly 390 K (Williams et al. 2017, Icarus)' },
];

export const ICE_STABILITY_K = 110; // approx. surface temperature below which water ice persists over geologic time (Paige et al. 2010)

export const COMPARE_ROWS = [
  { param: 'Hottest temperature recorded', earth: '56.7 °C air (WMO, 1913)', moon: '~390 K (~117 °C) surface, equatorial noon', kind: 'measured',
    note: 'Earth values are air temperatures at weather stations; the Moon value is surface temperature from Diviner infrared. They are different quantities.' },
  { param: 'Coldest temperature recorded', earth: '-89.2 °C air (WMO, 1983); -93.2 °C satellite-derived surface (Scambos et al. 2018)', moon: '~25 K (~-248 °C) in polar permanently shadowed craters', kind: 'measured',
    note: 'The Moon\'s polar craters are colder than any natural location measured on Earth.' },
  { param: 'Equatorial day-night swing', earth: 'Moderated by atmosphere and oceans', moon: '~95 K at night to ~390 K at noon (about 295 K swing)', kind: 'derived',
    note: 'Swing is computed from the two measured Moon values. No Earth number is claimed here.' },
  { param: 'Atmosphere', earth: 'About 101 kPa at sea level', moon: 'Virtually none (surface-bounded exosphere)', kind: 'measured', note: 'No atmosphere means no wind or heat transport, so temperature follows sunlight almost directly.' },
  { param: 'Gravity', earth: '9.81 m/s²', moon: '1.62 m/s²', kind: 'measured', note: '' },
  { param: 'Axial tilt', earth: '23.4°', moon: '1.5°', kind: 'measured', note: 'The Moon\'s tiny tilt keeps some polar crater floors out of direct sunlight.' },
  { param: 'Length of a day', earth: '24 hours', moon: '~29.5 Earth days', kind: 'measured', note: '' },
  { param: 'Water', earth: 'Oceans, ice sheets, clouds, rain', moon: 'Water ice reported in some polar shadows (e.g. LCROSS at Cabeus)', kind: 'measured',
    note: 'How much ice exists, where, and how it got there is still debated.' },
  { param: 'Why polar craters stay cold', earth: '-', moon: 'Permanent shadow + no atmosphere: heat cannot arrive by sunlight or air', kind: 'interpretation',
    note: 'This is the accepted scientific explanation, not a direct measurement.' },
  { param: 'Could the ice be stable?', earth: '-', moon: 'Below ~110 K, surface ice is expected to persist over geologic time', kind: 'interpretation',
    note: 'Threshold from thermal stability modelling (Paige et al. 2010).' },
];
