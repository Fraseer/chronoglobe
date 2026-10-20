(() => {
"use strict";

// World outline: Natural Earth 1:110m via world-atlas@2.0.2 (TopoJSON), loaded by world-110m.js.
const WORLD = window.CHRONOGLOBE_WORLD;

const PLACES_RAW = [
  "London, United Kingdom|51.507|-0.128", "Paris, France|48.857|2.352", "Rome, Italy|41.893|12.483", "Athens, Greece|37.984|23.728",
  "Istanbul (Constantinople), Turkey|41.008|28.978", "Berlin, Germany|52.520|13.405", "Vienna, Austria|48.208|16.373", "Madrid, Spain|40.417|-3.704",
  "Lisbon, Portugal|38.722|-9.139", "Moscow, Russia|55.756|37.617", "St Petersburg, Russia|59.939|30.316", "Warsaw, Poland|52.230|21.012",
  "Prague, Czechia|50.076|14.438", "Budapest, Hungary|47.498|19.040", "Amsterdam, Netherlands|52.370|4.895", "Brussels, Belgium|50.850|4.352",
  "Waterloo, Belgium|50.680|4.412", "Battle (Hastings), England|50.912|0.487", "Runnymede, England|51.444|-0.565", "Edinburgh, Scotland|55.953|-3.188",
  "Dublin, Ireland|53.350|-6.260", "Stonehenge, England|51.179|-1.826", "Omaha Beach, Normandy, France|49.369|-0.873", "Versailles, France|48.805|2.120",
  "Venice, Italy|45.441|12.316", "Florence, Italy|43.770|11.256", "Pompeii, Italy|40.749|14.485", "Ravenna, Italy|44.418|12.204",
  "Vatican City|41.902|12.453", "Naples, Italy|40.852|14.268", "Pisa, Italy|43.723|10.397", "Syracuse, Sicily|37.075|15.286",
  "Olympia, Greece|37.638|21.630", "Marathon, Greece|38.118|23.978", "Sparta, Greece|37.074|22.430", "Knossos, Crete|35.298|25.163",
  "Troy (Hisarlik), Turkey|39.957|26.239", "Gallipoli, Turkey|40.246|26.277", "Ankara, Turkey|39.933|32.860", "Sarajevo, Bosnia and Herzegovina|43.856|18.413",
  "Auschwitz, Poland|50.027|19.204", "Gdańsk, Poland|54.352|18.646", "Stalingrad (Volgograd), Russia|48.708|44.513", "Kyiv, Ukraine|50.450|30.524",
  "Chernobyl, Ukraine|51.389|30.099", "Wittenberg, Germany|51.866|12.646", "Mainz, Germany|49.993|8.247", "Munich, Germany|48.137|11.575",
  "Nuremberg, Germany|49.452|11.077", "Geneva, Switzerland|46.204|6.143", "Stockholm, Sweden|59.329|18.069", "Oslo, Norway|59.914|10.752",
  "Copenhagen, Denmark|55.676|12.568", "Reykjavík, Iceland|64.147|-21.942", "Agincourt, France|50.463|2.141", "Cape Trafalgar, Spain|36.183|-6.033",
  "Granada, Spain|37.177|-3.599", "Córdoba, Spain|37.888|-4.779", "Seville, Spain|37.389|-5.984", "Barcelona, Spain|41.387|2.170",
  "Lindisfarne, England|55.669|-1.801", "Canterbury, England|51.280|1.079", "Oxford, England|51.752|-1.258", "Cambridge, England|52.205|0.119",
  "Dunkirk, France|51.034|2.377", "Verdun, France|49.160|5.384", "The Somme (Thiepval), France|50.051|2.686", "Ypres, Belgium|50.851|2.886",
  "Jerusalem|31.778|35.235", "Mecca, Saudi Arabia|21.423|39.826", "Medina, Saudi Arabia|24.468|39.614", "Riyadh, Saudi Arabia|24.713|46.675",
  "Baghdad, Iraq|33.315|44.366", "Babylon, Iraq|32.536|44.421", "Ur, Iraq|30.963|46.103", "Nineveh (Mosul), Iraq|36.359|43.153",
  "Persepolis, Iran|29.935|52.891", "Tehran, Iran|35.689|51.389", "Damascus, Syria|33.513|36.292", "Beirut, Lebanon|33.894|35.502",
  "Petra, Jordan|30.328|35.444", "Dubai, UAE|25.205|55.271", "Kabul, Afghanistan|34.555|69.207", "Cairo, Egypt|30.044|31.236",
  "Giza, Egypt|29.979|31.134", "Alexandria, Egypt|31.200|29.918", "Luxor (Thebes), Egypt|25.687|32.640", "Valley of the Kings, Egypt|25.740|32.601",
  "Suez, Egypt|29.967|32.550", "El Alamein, Egypt|30.830|28.955", "Carthage, Tunisia|36.853|10.323", "Tripoli, Libya|32.887|13.191",
  "Marrakesh, Morocco|31.629|-7.981", "Fez, Morocco|34.033|-5.000", "Timbuktu, Mali|16.766|-3.003", "Dakar, Senegal|14.716|-17.467",
  "Gorée Island, Senegal|14.667|-17.398", "Accra, Ghana|5.604|-0.187", "Lagos, Nigeria|6.524|3.379", "Kinshasa, DR Congo|-4.441|15.266",
  "Khartoum, Sudan|15.501|32.560", "Aksum, Ethiopia|14.121|38.723", "Lalibela, Ethiopia|12.032|39.047", "Addis Ababa, Ethiopia|9.030|38.740",
  "Nairobi, Kenya|-1.292|36.822", "Zanzibar, Tanzania|-6.165|39.202", "Kigali, Rwanda|-1.944|30.062", "Great Zimbabwe, Zimbabwe|-20.271|30.934",
  "Johannesburg, South Africa|-26.204|28.047", "Soweto, South Africa|-26.268|27.858", "Pretoria, South Africa|-25.747|28.229", "Isandlwana, South Africa|-28.359|30.652",
  "Cape Town, South Africa|-33.925|18.424", "Robben Island, South Africa|-33.807|18.371", "Paarl, South Africa|-33.800|18.970",
  "Beijing, China|39.904|116.407", "Xi'an, China|34.341|108.940", "Xianyang, China|34.330|108.710", "Shanghai, China|31.230|121.474",
  "Nanjing, China|32.060|118.797", "Wuhan, China|30.593|114.305", "Hong Kong|22.320|114.170", "Guangzhou, China|23.129|113.264",
  "Lhasa, Tibet|29.652|91.172", "Tangshan, China|39.630|118.180", "Tokyo, Japan|35.676|139.650", "Kyoto, Japan|35.012|135.768",
  "Osaka, Japan|34.694|135.502", "Hiroshima, Japan|34.395|132.454", "Nagasaki, Japan|32.750|129.878", "Fukushima Daiichi, Japan|37.421|141.033",
  "Seoul, South Korea|37.566|126.978", "Pyongyang, North Korea|39.039|125.763", "Taipei, Taiwan|25.033|121.565", "Manila, Philippines|14.599|120.984",
  "Hanoi, Vietnam|21.028|105.834", "Ho Chi Minh City (Saigon), Vietnam|10.823|106.630", "Dien Bien Phu, Vietnam|21.386|103.017", "Angkor Wat, Cambodia|13.412|103.867",
  "Phnom Penh, Cambodia|11.556|104.928", "Bangkok, Thailand|13.756|100.502", "Ayutthaya, Thailand|14.355|100.568", "Yangon, Myanmar|16.840|96.173",
  "Bagan, Myanmar|21.172|94.860", "Singapore|1.352|103.820", "Jakarta, Indonesia|-6.208|106.846", "Krakatoa, Indonesia|-6.102|105.423",
  "Borobudur, Indonesia|-7.608|110.204", "Banda Aceh, Indonesia|5.548|95.324", "Delhi, India|28.614|77.209", "Agra, India|27.175|78.042",
  "Mumbai, India|19.076|72.878", "Kolkata, India|22.573|88.364", "Chennai, India|13.083|80.270", "Varanasi, India|25.318|82.974",
  "Amritsar, India|31.634|74.872", "Bodh Gaya, India|24.696|84.991", "Bhopal, India|23.260|77.413", "Kathmandu, Nepal|27.717|85.324",
  "Mount Everest|27.988|86.925", "Lahore, Pakistan|31.549|74.344", "Karachi, Pakistan|24.861|67.010", "Mohenjo-daro, Pakistan|27.329|68.139",
  "Dhaka, Bangladesh|23.810|90.413", "Samarkand, Uzbekistan|39.654|66.976", "Bukhara, Uzbekistan|39.775|64.429", "Tashkent, Uzbekistan|41.299|69.240",
  "Karakorum, Mongolia|47.197|102.830", "Ulaanbaatar, Mongolia|47.886|106.906", "Baikonur, Kazakhstan|45.965|63.305",
  "Sydney, Australia|-33.857|151.215", "Canberra, Australia|-35.281|149.130", "Melbourne, Australia|-37.814|144.963", "Uluru, Australia|-25.345|131.036",
  "Auckland, New Zealand|-36.848|174.763", "Wellington, New Zealand|-41.287|174.776", "Waitangi, New Zealand|-35.268|174.081", "Honolulu, Hawaii|21.307|-157.858",
  "Pearl Harbor, Hawaii|21.365|-157.950", "Midway Atoll|28.207|-177.379", "Easter Island (Rapa Nui)|-27.113|-109.350", "Tahiti|-17.651|-149.426",
  "Guadalcanal, Solomon Islands|-9.433|159.950", "Iwo Jima, Japan|24.780|141.320", "Bikini Atoll|11.583|165.383",
  "Washington, D.C., USA|38.907|-77.037", "New York, USA|40.713|-74.006", "Philadelphia, USA|39.952|-75.165", "Boston, USA|42.360|-71.059",
  "Lexington, USA|42.447|-71.225", "Jamestown, USA|37.209|-76.777", "Plymouth, Massachusetts, USA|41.958|-70.667", "Gettysburg, USA|39.831|-77.231",
  "Yorktown, USA|37.239|-76.509", "Appomattox, USA|37.377|-78.797", "Chicago, USA|41.878|-87.630", "Detroit, USA|42.331|-83.046",
  "Dallas, USA|32.777|-96.797", "Memphis, USA|35.149|-90.049", "Selma, USA|32.407|-87.021", "Montgomery, USA|32.377|-86.300",
  "Atlanta, USA|33.749|-84.388", "New Orleans, USA|29.951|-90.072", "Kitty Hawk, USA|36.014|-75.668", "Cape Canaveral, USA|28.608|-80.604",
  "Houston, USA|29.760|-95.370", "Los Alamos, USA|35.881|-106.299", "Trinity Site, USA|33.677|-106.475", "The Alamo, San Antonio, USA|29.426|-98.486",
  "San Francisco, USA|37.775|-122.419", "Los Angeles, USA|34.052|-118.244", "Seattle, USA|47.606|-122.332", "Little Bighorn, USA|45.570|-107.427",
  "Promontory Summit, USA|41.618|-112.551", "Wounded Knee, USA|43.142|-102.365", "Mount St. Helens, USA|46.191|-122.194", "Woodstock (Bethel), USA|41.701|-74.880",
  "Ottawa, Canada|45.421|-75.697", "Québec City, Canada|46.813|-71.208", "Montréal, Canada|45.502|-73.567", "Toronto, Canada|43.653|-79.383",
  "Halifax, Canada|44.649|-63.575", "Dawson City (Klondike), Canada|64.060|-139.432", "L'Anse aux Meadows, Canada|51.596|-55.533",
  "Mexico City (Tenochtitlan), Mexico|19.433|-99.133", "Teotihuacan, Mexico|19.692|-98.844", "Chichén Itzá, Mexico|20.684|-88.568", "Tikal, Guatemala|17.222|-89.623",
  "Havana, Cuba|23.113|-82.366", "Bay of Pigs (Playa Girón), Cuba|22.068|-81.032", "San Salvador Island, Bahamas|24.050|-74.500", "Port-au-Prince, Haiti|18.594|-72.307",
  "Port Royal, Jamaica|17.937|-76.841", "Panama Canal|9.080|-79.680", "Bogotá, Colombia|4.711|-74.072", "Caracas, Venezuela|10.481|-66.904",
  "Quito, Ecuador|-0.181|-78.468", "Galápagos Islands|-0.954|-90.966", "Lima, Peru|-12.046|-77.043", "Cusco, Peru|-13.532|-71.968",
  "Machu Picchu, Peru|-13.163|-72.545", "La Paz, Bolivia|-16.490|-68.119", "Potosí, Bolivia|-19.589|-65.753", "Santiago, Chile|-33.449|-70.669",
  "Buenos Aires, Argentina|-34.604|-58.382", "Montevideo, Uruguay|-34.901|-56.164", "Rio de Janeiro, Brazil|-22.907|-43.173", "São Paulo, Brazil|-23.551|-46.633",
  "Brasília, Brazil|-15.794|-47.882", "Manaus, Brazil|-3.119|-60.022", "Stanley, Falkland Islands|-51.697|-57.851",
  "Titanic wreck site, North Atlantic|41.726|-49.948", "North Pole|90|0", "South Pole|-90|0", "McMurdo Station, Antarctica|-77.846|166.676"
];

const CATEGORIES = [
  ["conflict", "Conflict & war"], ["politics", "Politics & law"], ["science", "Science & invention"],
  ["culture", "Culture & religion"], ["exploration", "Exploration"], ["disaster", "Disaster & nature"], ["other", "Other"]
];
const CAT_LABEL = Object.fromEntries(CATEGORIES);
const ERAS = [
  [-Infinity, -3299, "Prehistory"], [-3299, -1199, "Bronze Age"], [-1199, -499, "Iron Age"], [-499, 476, "Classical antiquity"],
  [476, 1492, "Middle Ages"], [1492, 1789, "Early modern"], [1789, 1945, "Modern"], [1945, Infinity, "Contemporary"]
];
const NOW_YEAR = new Date().getFullYear();
const FONT_BODY = '"Instrument Sans", system-ui, -apple-system, "Segoe UI", sans-serif';
const FONT_MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';
const TAU = Math.PI * 2, HALF_PI = Math.PI / 2;
const PREFS_KEY = "chronoglobe:prefs:v1";
const LOCAL_KEY = "chronoglobe:events:v1";

const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const narrow = window.matchMedia("(max-width: 900px)");

function h(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : String(v));
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) n.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  return n;
}
function lsGet(k) { try { return window.localStorage.getItem(k); } catch (_) { return null; } }
function lsSet(k, v) { try { window.localStorage.setItem(k, v); return true; } catch (_) { return false; } }

// ---------- years (astronomical numbering internally: 1 BC = 0, 44 BC = -43)
function toDisplay(y) { return y <= 0 ? { n: 1 - y, era: "BC" } : { n: y, era: "AD" }; }
function fromDisplay(n, era) { return era === "BC" ? 1 - n : n; }
function fmtYear(y) { if (y <= 0) return `${1 - y} BC`; if (y < 1000) return `AD ${y}`; return String(y); }
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
// "29 May 1453", "March 44 BC", "1969"
function fmtDate(e) {
  if (!e.month) return fmtYear(e.year);
  const y = e.year <= 0 ? `${1 - e.year} BC` : e.year < 1000 ? `AD ${e.year}` : String(e.year);
  return `${e.day ? e.day + " " : ""}${MONTHS[e.month - 1]} ${y}`;
}
function fmtDayMonth(e) { return e.month ? `${e.day ? e.day + " " : ""}${MONTHS[e.month - 1].slice(0, 3)}` : ""; }
const dateOrder = (a, b) => a.year - b.year || (a.month || 0) - (b.month || 0) || (a.day || 0) - (b.day || 0);
function parseYear(str, era) {
  const s = String(str || "").trim().toUpperCase().replace(/,/g, "").replace(/\s+/g, " ");
  if (!s) return null;
  const m = s.match(/^(?:C(?:A|IRCA)?\.? ?)?(AD|CE)? ?(-)? ?(\d{1,5}) ?(BCE|BC|AD|CE)?$/);
  if (!m) return NaN;
  let n = parseInt(m[3], 10);
  if (n === 0) n = 1;
  const e = m[4] ? (m[4][0] === "B" ? "BC" : "AD") : m[1] ? "AD" : m[2] ? "BC" : (era || "AD");
  return fromDisplay(n, e);
}
function ordinal(n) { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
function periodLabel(y) {
  if (y >= 1) return `${ordinal(Math.ceil(y / 100))} century`;
  const b = 1 - y;
  if (b > 1000) return `${ordinal(Math.ceil(b / 1000))} millennium BC`;
  return `${ordinal(Math.ceil(b / 100))} century BC`;
}
function periodKey(y) { if (y >= 1) return "c" + Math.ceil(y / 100); const b = 1 - y; return b > 1000 ? "m" + Math.ceil(b / 1000) : "b" + Math.ceil(b / 100); }
function yrsWord(n, word) { return `${n} ${word}${n === 1 ? "" : "s"}`; }
function yrs(n) { return `${n} year${n === 1 ? "" : "s"}`; }
function yearsAgo(y) { const n = NOW_YEAR - y; return n > 0 ? `(${n.toLocaleString("en")} years ago)` : n === 0 ? "(this year)" : ""; }
function fmtCoord(lat, lng) {
  return `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lng).toFixed(2)}° ${lng >= 0 ? "E" : "W"}`;
}

// ---------- places
const PLACES = PLACES_RAW.map((s) => { const [name, lat, lng] = s.split("|"); return { name, lat: +lat, lng: +lng }; });
const COUNTRIES = topojson.feature(WORLD, WORLD.objects.countries).features.map((f) => {
  if (!f.geometry) return null;
  let target = f;
  if (f.geometry.type === "MultiPolygon") {
    let best = null, bestA = -1;
    for (const coords of f.geometry.coordinates) {
      const g = { type: "Polygon", coordinates: coords }, a = d3.geoArea(g);
      if (a > bestA) { bestA = a; best = g; }
    }
    target = best;
  }
  const [lng, lat] = d3.geoCentroid(target);
  return { name: f.properties.name, lat, lng, feature: f };
}).filter(Boolean);
const PLACE_INDEX = new Map();
for (const c of COUNTRIES) PLACE_INDEX.set(c.name.toLowerCase(), c);
for (const p of PLACES) PLACE_INDEX.set(p.name.toLowerCase(), p);
function describeLocation(lng, lat) {
  let best = null, bd = Infinity;
  for (const p of PLACES) { const d = d3.geoDistance([lng, lat], [p.lng, p.lat]); if (d < bd) { bd = d; best = p; } }
  if (best && bd * 6371 < 45) return best.name;
  const c = COUNTRIES.find((c) => d3.geoContains(c.feature, [lng, lat]));
  return c ? c.name : "";
}

// ---------- state
const state = {
  events: [], loaded: false, store: "connecting",
  year: 1900, tol: 5, scale: "recent", locked: false, scrubbing: false, playing: false,
  tab: "now", view: "list", selectedId: null,
  query: "", cat: "",
  editingId: null, draft: null, placeAuto: true,
  restored: false,
};
let matchList = [], matchMap = new Map();
const prefs = (() => { try { return JSON.parse(lsGet(PREFS_KEY) || "{}") || {}; } catch (_) { return {}; } })();
if ([0, 1, 5, 10, 25, 50, 100].includes(prefs.tol)) state.tol = prefs.tol;
if (prefs.scale === "even" || prefs.scale === "recent") state.scale = prefs.scale;
if (typeof prefs.locked === "boolean") state.locked = prefs.locked;
else if (prefs.follow === false) state.locked = true;
function savePrefs() { lsSet(PREFS_KEY, JSON.stringify({ tol: state.tol, scale: state.scale, locked: state.locked })); }

function normEvent(id, d) {
  if (!d || typeof d !== "object" || typeof id !== "string") return null;
  const year = Number(d.year), lat = Number(d.lat), lng = Number(d.lng);
  if (!Number.isFinite(year) || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (year < -99998 || year > NOW_YEAR) return null;
  const month = Number.isInteger(d.month) && d.month >= 1 && d.month <= 12 ? d.month : null;
  const day = month && Number.isInteger(d.day) && d.day >= 1 && d.day <= MONTH_DAYS[month - 1] ? d.day : null;
  return {
    id, title: String(d.title || "Untitled event").slice(0, 200), year: Math.round(year), month, day,
    place: String(d.place || "").slice(0, 120), lat: clamp(lat, -90, 90), lng: clamp(lng, -180, 180),
    category: CAT_LABEL[d.category] ? d.category : "", description: String(d.description || "").slice(0, 4000),
    example: d.example === true, createdAt: Number(d.createdAt) || 0, updatedAt: Number(d.updatedAt) || 0,
  };
}
const byId = (id) => state.events.find((e) => e.id === id) || null;
// events that drop out of the time window fade on the globe instead of vanishing
const FADE_MS = 2000;
const afterglow = new Map(); // id -> { s: strength when it left, t: when it left }
const litAt = new Map();     // id -> when it entered the window, for the flash
function recompute() {
  const before = matchMap;
  matchList = state.events.map((e) => ({ e, d: Math.abs(e.year - state.year) })).filter((m) => m.d <= state.tol)
    .sort((a, b) => a.d - b.d || dateOrder(a.e, b.e));
  matchMap = new Map(matchList.map((m) => [m.e.id, m.d]));
  const now = performance.now();
  for (const [id, d] of before) if (!matchMap.has(id) && byId(id)) afterglow.set(id, { s: strength(d), t: now });
  for (const id of before.keys()) if (!matchMap.has(id)) litAt.delete(id);
  for (const id of matchMap.keys()) { afterglow.delete(id); if (!before.has(id)) litAt.set(id, now); }
}
// 1 while lit, easing to 0 over FADE_MS after leaving the window
function glowOf(id, now) {
  const g = afterglow.get(id);
  if (!g) return 0;
  const k = Math.min(0.999, 1 - (now - g.t) / FADE_MS);
  if (k <= 0) { afterglow.delete(id); return 0; }
  return k * k * (3 - 2 * k);
}
function strength(d) { return 1 - d / (state.tol + 1); }

// ---------- theme colors for canvas
const C = {};
const TOKENS = {
  ink: "--ink", ink2: "--ink-2", muted: "--muted", line: "--line", line2: "--line-2",
  sand: "--sand", sandWash: "--sand-wash", rose: "--rose", sage: "--sage", flashCore: "--flash-core", glow: "--glow", glowEdge: "--glow-edge", oceanHi: "--ocean-hi", oceanLo: "--ocean-lo", land: "--land", landEdge: "--land-edge", grat: "--grat",
  dot: "--dot", halo: "--halo", shade: "--shade", atmo: "--atmo", band: "--band", panel: "--panel",
};
function readColors() {
  const cs = getComputedStyle(document.documentElement);
  for (const [k, v] of Object.entries(TOKENS)) C[k] = cs.getPropertyValue(v).trim() || "#888";
}
readColors();

// ======================================================================
// Globe
// ======================================================================
const globe = (() => {
  const wrap = $("#globeWrap"), canvas = $("#globe"), ctx = canvas.getContext("2d");
  let W = 1, H = 1, R = 100, dpr = 1;
  const rot = [-18, -28, 0];
  let zoom = 1;
  const proj = d3.geoOrthographic().clipAngle(90).precision(0.35);
  const path = d3.geoPath(proj, ctx);
  const SPHERE = { type: "Sphere" };
  const GRAT = d3.geoGraticule().step([15, 15])();
  const LAND = topojson.feature(WORLD, WORLD.objects.land);
  const BORDERS = topojson.mesh(WORLD, WORLD.objects.countries, (a, b) => a !== b);
  let raf = 0, last = 0, anim = null, inertia = null, spinning = true;
  // spin driven by dragging the timeline: spinTarget is refreshed by each drag move and lapses when moves stop
  let spinVel = 0, spinTarget = 0, spinAt = -1e9;
  // names are hidden while time is moving and fade back in when it stops
  let labelAlpha = 1;
  let hits = [], farMatches = [], farKey = "";
  const pointers = new Map();
  let drag = null, pinch = null, hoverId = null;

  function resize() {
    const r = wrap.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    R = Math.max(60, Math.min(W, H * 1.02) / 2 - 30);
    draw(performance.now());
    request();
  }
  function request() { if (!raf) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    const dt = last ? Math.min(64, now - last) : 16;
    last = now;
    let keep = false;
    const fresh = now - spinAt < 120;
    if (spinVel !== 0 || fresh) {
      // pick up speed quickly while the timeline is being dragged, then coast down like a flywheel
      spinVel += ((fresh ? spinTarget : 0) - spinVel) * Math.min(1, dt / (fresh ? 90 : 650));
      if (!fresh && Math.abs(spinVel) < 0.0004) spinVel = 0;
      rot[0] += spinVel * dt;
      keep = true;
    }
    const labelTarget = state.scrubbing || state.playing ? 0 : 1;
    if (labelAlpha !== labelTarget) {
      labelAlpha = labelTarget ? Math.min(1, labelAlpha + dt / 260) : Math.max(0, labelAlpha - dt / 90);
      keep = true;
    }
    if (anim) {
      const t = clamp((now - anim.t0) / anim.dur, 0, 1), k = d3.easeCubicInOut(t);
      rot[0] = anim.from[0] + (anim.to[0] - anim.from[0]) * k;
      rot[1] = anim.from[1] + (anim.to[1] - anim.from[1]) * k;
      if (anim.z1 != null) zoom = anim.z0 + (anim.z1 - anim.z0) * k;
      if (t >= 1) anim = null;
      keep = true;
    } else if (inertia) {
      rot[0] += inertia.vx * dt;
      rot[1] = clamp(rot[1] + inertia.vy * dt, -88, 88);
      const decay = Math.pow(0.93, dt / 16);
      inertia.vx *= decay; inertia.vy *= decay;
      if (Math.hypot(inertia.vx, inertia.vy) < 0.002) inertia = null;
      keep = true;
    } else if (spinning && !reduceMotion.matches) {
      rot[0] += 0.008 * dt;
      keep = true;
    }
    draw(now);
    // points on the far side are never drawn, so expire their fades here
    for (const [id, g] of afterglow) if (now - g.t >= FADE_MS) afterglow.delete(id);
    const pulsing = !reduceMotion.matches && matchList.length > 0;
    if (keep || pulsing || afterglow.size) request(); else last = 0;
  }
  const center = () => [-rot[0], -rot[1]];
  function angleTo(lng, lat) { return d3.geoDistance([lng, lat], center()); }

  function draw(now) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const r = R * zoom, cx = W / 2, cy = H / 2;
    proj.rotate(rot).scale(r).translate([cx, cy]);

    const ag = ctx.createRadialGradient(cx, cy, r * 0.97, cx, cy, r * 1.13);
    ag.addColorStop(0, C.atmo); ag.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(cx, cy, r * 1.13, 0, TAU); ctx.fill();

    const og = ctx.createRadialGradient(cx - r * 0.38, cy - r * 0.42, r * 0.04, cx, cy, r);
    og.addColorStop(0, C.oceanHi); og.addColorStop(1, C.oceanLo);
    ctx.fillStyle = og; ctx.beginPath(); path(SPHERE); ctx.fill();

    ctx.beginPath(); path(GRAT); ctx.strokeStyle = C.grat; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); path(LAND); ctx.fillStyle = C.land; ctx.fill();
    ctx.strokeStyle = C.landEdge; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.beginPath(); path(BORDERS); ctx.lineWidth = 0.5; ctx.globalAlpha = 0.8; ctx.stroke(); ctx.globalAlpha = 1;

    const sg = ctx.createRadialGradient(cx - r * 0.38, cy - r * 0.42, r * 0.1, cx, cy, r);
    sg.addColorStop(0, "rgba(255,255,255,0.10)"); sg.addColorStop(0.6, "rgba(255,255,255,0)"); sg.addColorStop(1, C.shade);
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.strokeStyle = C.landEdge; ctx.lineWidth = 1; ctx.globalAlpha = 0.55; ctx.stroke(); ctx.globalAlpha = 1;

    drawPoints(now);
  }

  function drawPoints(now) {
    hits = [];
    const far = [];
    const c = center();
    const lit = [];
    // plain dots first; events in the window, or still fading out of it, are drawn on top
    for (const e of state.events) {
      const ang = d3.geoDistance([e.lng, e.lat], c);
      const d = matchMap.get(e.id);
      if (ang > HALF_PI - 0.015) { if (d != null) far.push(e); continue; }
      const [x, y] = proj([e.lng, e.lat]);
      const edge = 0.35 + 0.65 * Math.cos(ang);
      if (d != null) { lit.push({ e, x, y, edge, s: strength(d), k: 1 }); continue; }
      ctx.globalAlpha = edge;
      ctx.beginPath(); ctx.arc(x, y, 3.6, 0, TAU); ctx.fillStyle = C.halo; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, 2.5, 0, TAU); ctx.fillStyle = C.dot; ctx.fill();
      hits.push({ e, x, y, r: 3 });
      const k = glowOf(e.id, now);
      if (k > 0) lit.push({ e, x, y, edge, s: afterglow.get(e.id).s, k });
    }
    ctx.globalAlpha = 1;
    lit.sort((a, b) => a.k - b.k || a.s - b.s);
    const labels = [];
    for (const L of lit) {
      const { x, y, edge, s, k } = L;
      // a point of light, no outline: a white-hot centre through sand into a warm haze.
      // It flashes larger as it enters the window, shimmers while lit, and shrinks as it fades.
      const born = litAt.get(L.e.id);
      const still = reduceMotion.matches;
      const flash = k === 1 && born != null && !still ? Math.max(0, 1 - ((now || 0) - born) / 450) : 0;
      const shimmer = k === 1 && !still ? 0.08 * Math.sin((now || 0) / 380 + (hashId(L.e.id) % 97)) : 0;
      const r = (9 + 4.5 * s) * (0.4 + 0.6 * k) * (1 + 0.8 * flash * flash + shimmer);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, C.flashCore);
      g.addColorStop(0.17, C.flashCore);
      g.addColorStop(0.38, C.sand);
      g.addColorStop(0.62, C.glow);
      g.addColorStop(1, C.glowEdge);
      ctx.globalAlpha = edge * k * (0.75 + 0.25 * s);
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = g; ctx.fill();
      ctx.globalAlpha = 1;
      if (k === 1) { hits.push({ e: L.e, x, y, r: Math.max(4, r * 0.6) }); labels.push({ e: L.e, x, y, rad: r * 0.5, s }); }
    }
    // selected ring
    const sel = state.selectedId && byId(state.selectedId);
    if (sel) {
      const ang = d3.geoDistance([sel.lng, sel.lat], c);
      if (ang < HALF_PI) {
        const [x, y] = proj([sel.lng, sel.lat]);
        const rr = (matchMap.has(sel.id) ? 5 + 2.5 * strength(matchMap.get(sel.id)) : 3) + 5;
        ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.strokeStyle = C.halo; ctx.lineWidth = 6; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.strokeStyle = C.rose; ctx.lineWidth = 3; ctx.stroke();
      }
    }
    // draft pin while adding or editing
    if (state.view === "form" && state.draft) {
      const { lat, lng } = state.draft;
      if (d3.geoDistance([lng, lat], c) < HALF_PI) {
        const [x, y] = proj([lng, lat]);
        ctx.lineCap = "round";
        ctx.strokeStyle = C.halo; ctx.lineWidth = 5;
        crosshair(x, y);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
        crosshair(x, y);
        ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fillStyle = C.rose; ctx.fill();
        ctx.lineWidth = 1.5; ctx.strokeStyle = C.ink; ctx.stroke();
      }
    }
    if (labelAlpha > 0.01) drawLabels(labels);
    const key = far.map((e) => e.id).join(",");
    if (key !== farKey) { farKey = key; farMatches = far; renderFar(far); }
  }
  function crosshair(x, y) {
    ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU);
    ctx.moveTo(x - 15, y); ctx.lineTo(x - 5, y); ctx.moveTo(x + 5, y); ctx.lineTo(x + 15, y);
    ctx.moveTo(x, y - 15); ctx.lineTo(x, y - 5); ctx.moveTo(x, y + 5); ctx.lineTo(x, y + 15);
    ctx.stroke();
  }
  function drawLabels(labels) {
    labels.sort((a, b) => b.s - a.s);
    const placed = [];
    ctx.font = `600 12px ${FONT_BODY}`;
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.globalAlpha = labelAlpha;
    let n = 0;
    for (const L of labels) {
      if (n >= 10) break;
      const text = L.e.title.length > 34 ? L.e.title.slice(0, 33).trimEnd() + "…" : L.e.title;
      const w = ctx.measureText(text).width, hgt = 16;
      const opts = [
        { x: L.x + L.rad + 7, y: L.y, align: "left" },
        { x: L.x - L.rad - 7, y: L.y, align: "right" },
        { x: L.x, y: L.y - L.rad - 12, align: "center" },
        { x: L.x, y: L.y + L.rad + 12, align: "center" },
      ];
      for (const o of opts) {
        const x0 = o.align === "left" ? o.x : o.align === "right" ? o.x - w : o.x - w / 2;
        const box = { x0: x0 - 3, y0: o.y - hgt / 2, x1: x0 + w + 3, y1: o.y + hgt / 2 };
        if (box.x0 < 4 || box.x1 > W - 4 || box.y0 < 4 || box.y1 > H - 4) continue;
        if (placed.some((p) => !(box.x1 < p.x0 || box.x0 > p.x1 || box.y1 < p.y0 || box.y0 > p.y1))) continue;
        placed.push(box);
        ctx.textAlign = o.align;
        ctx.strokeStyle = C.halo; ctx.lineWidth = 3.5; ctx.strokeText(text, o.x, o.y);
        ctx.fillStyle = C.ink; ctx.fillText(text, o.x, o.y);
        n++;
        break;
      }
    }
    ctx.globalAlpha = 1;
  }

  function hitAt(x, y) {
    let best = null, bd = Infinity;
    for (const hp of hits) {
      const d = Math.hypot(hp.x - x, hp.y - y);
      if (d <= hp.r + 8 && d < bd) { bd = d; best = hp; }
    }
    return best;
  }
  function localXY(ev) { const r = canvas.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }
  function haltSpin() { spinVel = 0; spinTarget = 0; spinAt = -1e9; }
  function stopMotion() { anim = null; inertia = null; spinning = false; haltSpin(); }

  canvas.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0 && ev.pointerType === "mouse") return;
    canvas.setPointerCapture(ev.pointerId);
    pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    stopMotion();
    hideTip();
    canvas.classList.remove("over-point");
    if (pointers.size === 1) {
      drag = { x0: ev.clientX, y0: ev.clientY, rot0: [rot[0], rot[1]], moved: false, lx: ev.clientX, ly: ev.clientY, lt: performance.now(), vx: 0, vy: 0 };
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d0: Math.hypot(a.x - b.x, a.y - b.y), z0: zoom };
      if (drag) drag.moved = true;
    }
  });
  canvas.addEventListener("pointermove", (ev) => {
    if (pointers.has(ev.pointerId)) pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      zoom = clamp(pinch.z0 * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, pinch.d0), 0.7, 8);
      request();
      return;
    }
    if (drag && pointers.has(ev.pointerId)) {
      const dx = ev.clientX - drag.x0, dy = ev.clientY - drag.y0;
      if (!drag.moved && Math.hypot(dx, dy) > 4) { drag.moved = true; canvas.classList.add("dragging"); }
      if (drag.moved) {
        const k = 180 / (Math.PI * R * zoom);
        rot[0] = drag.rot0[0] + dx * k;
        rot[1] = clamp(drag.rot0[1] - dy * k, -88, 88);
        const t = performance.now(), dtm = Math.max(1, t - drag.lt);
        drag.vx = 0.6 * drag.vx + 0.4 * ((ev.clientX - drag.lx) * k / dtm);
        drag.vy = 0.6 * drag.vy + 0.4 * (-(ev.clientY - drag.ly) * k / dtm);
        drag.lx = ev.clientX; drag.ly = ev.clientY; drag.lt = t;
        request();
      }
      return;
    }
    if (ev.pointerType === "mouse") {
      const [x, y] = localXY(ev);
      const hp = hitAt(x, y);
      canvas.classList.toggle("over-point", !!hp);
      if (hp) { if (hoverId !== hp.e.id) { hoverId = hp.e.id; } showTip(hp.e, ev.clientX, ev.clientY); }
      else if (hoverId) { hoverId = null; hideTip(); }
    }
  });
  function endPointer(ev) {
    const wasPinch = !!pinch;
    pointers.delete(ev.pointerId);
    if (pointers.size < 2) pinch = null;
    if (!drag) return;
    if (pointers.size > 0) {
      // a pinch ended with one finger still down: let that finger keep rotating
      const p = [...pointers.values()][0];
      drag = { x0: p.x, y0: p.y, rot0: [rot[0], rot[1]], moved: true, lx: p.x, ly: p.y, lt: performance.now(), vx: 0, vy: 0 };
      return;
    }
    canvas.classList.remove("dragging");
    const d = drag; drag = null;
    if (ev.type === "pointercancel") return;
    if (!d.moved && !wasPinch) { onClick(ev); return; }
    if (performance.now() - d.lt < 80 && !reduceMotion.matches && Math.hypot(d.vx, d.vy) > 0.01) inertia = { vx: d.vx, vy: d.vy };
    request();
  }
  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);
  canvas.addEventListener("pointerleave", (ev) => { if (ev.pointerType === "mouse" && !drag) { hoverId = null; hideTip(); canvas.classList.remove("over-point"); } });
  canvas.addEventListener("wheel", (ev) => {
    // in the stacked phone/tablet layout the wheel scrolls the page unless pinch-zooming
    if (narrow.matches && !ev.ctrlKey && !ev.metaKey) return;
    ev.preventDefault();
    inertia = null; spinning = false;
    if (anim) anim.z1 = null;
    zoom = clamp(zoom * Math.exp(-ev.deltaY * 0.0016), 0.7, 8);
    request();
  }, { passive: false });

  function onClick(ev) {
    const [x, y] = localXY(ev);
    const hp = hitAt(x, y);
    if (state.view === "form") {
      const r = R * zoom;
      if (Math.hypot(x - W / 2, y - H / 2) <= r) {
        const ll = proj.invert([x, y]);
        if (ll && Number.isFinite(ll[0]) && Number.isFinite(ll[1])) { setDraft(ll[1], ll[0], "globe"); return; }
      }
      return;
    }
    if (hp) selectEvent(hp.e.id, { zoom: Math.max(zoom, 1.8) });
    else if (state.view === "detail" || state.selectedId) closeDetail();
  }

  function flyTo(lng, lat, opts = {}) {
    if (pointers.size > 0) return;
    spinning = false; inertia = null;
    haltSpin();
    const from = [rot[0], rot[1]];
    const dx = ((((-lng - from[0]) % 360) + 540) % 360) - 180;
    const to = [from[0] + dx, clamp(-lat, -80, 80)];
    const dist = Math.hypot(dx, to[1] - from[1]);
    const zoomTo = opts.zoom && Math.abs(opts.zoom - zoom) > 0.01 ? clamp(opts.zoom, 0.7, 8) : null;
    if (reduceMotion.matches || (dist < 0.5 && zoomTo == null)) { rot[0] = to[0]; rot[1] = to[1]; if (zoomTo) zoom = zoomTo; request(); return; }
    anim = { t0: performance.now(), dur: clamp(450 + Math.max(dist * 6, zoomTo ? 300 : 0), 600, 1500), from, to, z0: zoom, z1: zoomTo };
    request();
  }
  function setZoom(z) {
    const keep = anim;
    inertia = null; spinning = false;
    anim = { t0: performance.now(), dur: reduceMotion.matches ? 1 : 350, from: [rot[0], rot[1]], to: keep ? keep.to : [rot[0], rot[1]], z0: zoom, z1: clamp(z, 0.7, 8) };
    request();
  }

  $("#zoomIn").addEventListener("click", () => setZoom(zoom * 1.5));
  $("#zoomOut").addEventListener("click", () => setZoom(zoom / 1.5));
  $("#resetView").addEventListener("click", () => setZoom(1));

  new ResizeObserver(resize).observe(wrap);
  resize();

  return {
    request, flyTo, angleTo, resize,
    stopSpin() { spinning = false; },
    // deg per ms; ignored while someone is dragging the globe itself
    nudgeSpin(v) {
      if (pointers.size > 0) return;
      anim = null; inertia = null; spinning = false;
      spinTarget = clamp(v, -1.5, 1.5); spinAt = performance.now();
      request();
    },
    labelsShown() { return labelAlpha > 0.5; },
    spinSpeed() { return spinVel; },
    haltSpin,
    get farMatches() { return farMatches; },
    getView() { return { rot: [rot[0], rot[1]], zoom }; },
    setView(v) { if (v && Array.isArray(v.rot)) { rot[0] = +v.rot[0] || 0; rot[1] = clamp(+v.rot[1] || 0, -88, 88); } if (v && v.zoom) zoom = clamp(+v.zoom, 0.7, 8); spinning = false; request(); },
  };
})();
function hashId(s) { let x = 0; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0; return x; }

// ---------- tooltip
const tip = $("#tip");
function showTip(e, cx, cy, below) {
  tip.replaceChildren(h("b", { text: e.title }), h("span", { text: [fmtDate(e), e.place].filter(Boolean).join(" · ") }));
  tip.hidden = false;
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  let x = cx + 14, y = below ? cy + 16 : cy - th - 12;
  if (x + tw > window.innerWidth - 8) x = cx - tw - 14;
  if (y < 8) y = cy + 16;
  if (y + th > window.innerHeight - 8) y = cy - th - 12;
  tip.style.left = Math.max(8, x) + "px";
  tip.style.top = Math.max(8, y) + "px";
}
function hideTip() { tip.hidden = true; }

// ======================================================================
// Timeline
// ======================================================================
const timeline = (() => {
  const track = $("#tlTrack"), canvas = $("#tlCanvas"), ctx = canvas.getContext("2d");
  let W = 1, H = 88, dpr = 1, ticks = [];
  const PAD = 18, BASE = 58;
  let domain = [-2999, NOW_YEAR];
  let scrub = null, hoverMark = null;

  function updateDomain() {
    let min = -2999;
    for (const e of state.events) if (e.year < min) min = e.year;
    const lo = min < -2999 ? 1 - Math.ceil((1 - min) / 1000) * 1000 : -2999;
    let max = NOW_YEAR;
    for (const e of state.events) max = Math.max(max, e.year);
    domain = [lo, max];
    track.setAttribute("aria-valuemin", String(lo));
    track.setAttribute("aria-valuemax", String(max));
    layout();
  }
  function frac(y) {
    const [lo, hi] = domain, t = clamp((hi - y) / (hi - lo), 0, 1);
    return state.scale === "recent" ? 1 - Math.sqrt(t) : 1 - t;
  }
  const X = (y) => PAD + frac(y) * (W - 2 * PAD);
  function yearAtFrac(f) {
    const [lo, hi] = domain; f = clamp(f, 0, 1);
    const t = state.scale === "recent" ? (1 - f) * (1 - f) : 1 - f;
    return Math.round(hi - t * (hi - lo));
  }
  const yearAt = (px) => yearAtFrac((px - PAD) / (W - 2 * PAD));

  function tickLabel(y) { if (y <= 0) return `${1 - y} BC`; if (y < 1000) return `AD ${y}`; return String(y); }
  function layout() {
    const r = track.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const [lo, hi] = domain, cand = [1];
    for (const s of [1000, 500, 250, 100, 50, 25, 10]) {
      if ((hi - lo) / s > 2000) continue;
      for (let y = s; y <= hi; y += s) cand.push(y);
      for (let b = s; 1 - b >= lo; b += s) cand.push(1 - b);
    }
    cand.push(lo);
    ticks = [];
    const seen = new Set();
    for (const y of cand) {
      if (seen.has(y)) continue; seen.add(y);
      const x = X(y);
      if (x < PAD - 1 || x > W - PAD + 1) continue;
      if (ticks.every((t) => Math.abs(t.x - x) >= 62)) ticks.push({ y, x });
    }
    ticks.sort((a, b) => a.x - b.x);
    draw();
  }
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const [lo, hi] = domain;
    // period bands
    ctx.font = `600 9.5px ${FONT_BODY}`;
    ctx.textBaseline = "alphabetic";
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0.08em";
    ERAS.forEach((era, i) => {
      const a = Math.max(era[0], lo), b = Math.min(era[1], hi);
      if (b <= a) return;
      const x0 = X(a), x1 = X(b);
      if (i % 2 === 1) { ctx.fillStyle = C.band; ctx.fillRect(x0, 0, x1 - x0, BASE); }
      const label = era[2].toUpperCase(), lw = ctx.measureText(label).width;
      if (x1 - x0 > lw + 12) { ctx.fillStyle = C.muted; ctx.textAlign = "left"; ctx.fillText(label, x0 + 6, 12); }
    });
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    // time window
    const xn = X(state.year);
    if (state.tol > 0) {
      const xa = X(state.year - state.tol), xb = X(state.year + state.tol);
      ctx.fillStyle = C.sandWash; ctx.fillRect(xa, 16, Math.max(2, xb - xa), BASE - 16);
    }
    // baseline
    ctx.fillStyle = C.line2; ctx.fillRect(PAD - 6, BASE, W - 2 * PAD + 12, 1);
    // events
    for (const e of state.events) {
      if (matchMap.has(e.id) || e.id === state.selectedId) continue;
      const x = X(e.year);
      ctx.globalAlpha = 0.55; ctx.fillStyle = C.dot;
      ctx.fillRect(x - 0.75, BASE - 14, 1.5, 14);
    }
    ctx.globalAlpha = 1;
    for (const { e } of matchList) {
      if (e.id === state.selectedId) continue;
      const x = X(e.year);
      ctx.fillStyle = C.ink;
      ctx.fillRect(x - 1.25, BASE - 28, 2.5, 28);
    }
    const sel = state.selectedId && byId(state.selectedId);
    if (sel) {
      const x = X(sel.year);
      ctx.fillStyle = C.ink;
      ctx.fillRect(x - 1.25, BASE - 32, 2.5, 32);
      ctx.beginPath(); ctx.arc(x, BASE - 35, 4.5, 0, TAU); ctx.fillStyle = C.rose; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = C.ink; ctx.stroke();
    }
    // axis
    ctx.font = `11px ${FONT_MONO}`;
    ctx.textBaseline = "alphabetic";
    for (const t of ticks) {
      ctx.fillStyle = C.line2; ctx.fillRect(t.x - 0.5, BASE + 1, 1, 5);
      ctx.fillStyle = C.muted;
      const label = tickLabel(t.y), lw = ctx.measureText(label).width;
      let tx = t.x, align = "center";
      if (t.x - lw / 2 < 2) { tx = Math.max(2, t.x - 4); align = "left"; }
      else if (t.x + lw / 2 > W - 2) { tx = Math.min(W - 2, t.x + 4); align = "right"; }
      ctx.textAlign = align; ctx.fillText(label, tx, BASE + 19);
    }
    // needle
    ctx.fillStyle = C.ink; ctx.fillRect(xn - 1, 16, 2, BASE - 10);
    ctx.beginPath(); ctx.arc(xn, BASE, 8.5, 0, TAU); ctx.fillStyle = C.panel; ctx.fill();
    ctx.beginPath(); ctx.arc(xn, BASE, 7, 0, TAU); ctx.fillStyle = C.sand; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = C.ink; ctx.stroke();
  }

  function markNear(px) {
    let best = null, bd = 7;
    for (const e of state.events) {
      const d = Math.abs(X(e.year) - px) - (matchMap.has(e.id) ? 1.5 : 0);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }
  const localX = (ev) => ev.clientX - track.getBoundingClientRect().left;
  function beginScrub(s, ev) {
    s.pending = false;
    s.lx = ev.clientX; s.lt = performance.now(); s.v = 0;
    state.scrubbing = true;
    hideTip();
    stopPlay();
    onScrubStart();
    setYear(yearAt(localX(ev)), { settle: false });
  }
  track.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0 && ev.pointerType === "mouse") return;
    try { track.setPointerCapture(ev.pointerId); } catch (_) {}
    scrub = { x0: ev.clientX, y0: ev.clientY, moved: false, id: ev.pointerId, pending: true };
    // a mouse scrubs at once; a finger waits to see whether it is scrolling the page instead
    if (ev.pointerType === "mouse") beginScrub(scrub, ev);
  });
  track.addEventListener("pointermove", (ev) => {
    if (scrub && ev.pointerId === scrub.id) {
      const dx = Math.abs(ev.clientX - scrub.x0), dy = Math.abs(ev.clientY - scrub.y0);
      if (scrub.pending) { if (dx > 6 && dx > dy) { scrub.moved = true; beginScrub(scrub, ev); } return; }
      if (!scrub.moved && dx > 3) scrub.moved = true;
      setYear(yearAt(localX(ev)), { settle: false });
      // the faster the drag, the faster the globe turns (forward in time turns it the way the Earth spins)
      const t = performance.now(), v = (ev.clientX - scrub.lx) / clamp(t - scrub.lt, 16, 100);
      scrub.v = scrub.samples ? scrub.v * 0.5 + v * 0.5 : v * 0.5;
      scrub.samples = (scrub.samples || 0) + 1;
      scrub.lx = ev.clientX; scrub.lt = t;
      // a phone's timeline is short and fingers move it slowly, so touch drags spin three times as fast
      const boost = ev.pointerType === "touch" ? 3 : 1;
      if (!state.locked) globe.nudgeSpin(boost * (0.3 * scrub.v + 0.1 * scrub.v * Math.abs(scrub.v)));
      return;
    }
    if (ev.pointerType !== "mouse") return;
    const m = markNear(localX(ev));
    if (m) { hoverMark = m; const r = track.getBoundingClientRect(); showTip(m, r.left + X(m.year), r.top + BASE - 30); }
    else if (hoverMark) { hoverMark = null; hideTip(); }
  });
  function endScrub(ev) {
    if (!scrub || ev.pointerId !== scrub.id) return;
    const s = scrub; scrub = null;
    state.scrubbing = false;
    globe.request();
    if (ev.type === "pointercancel") { if (!s.pending) settleYear(); return; }
    if (!s.moved) {
      const m = markNear(localX(ev));
      if (m && state.view !== "form") { stopPlay(); selectEvent(m.id, { fly: true, setYear: true }); return; }
      if (s.pending) beginScrub(s, ev);
    }
    settleYear();
  }
  track.addEventListener("pointerup", endScrub);
  track.addEventListener("pointercancel", endScrub);
  track.addEventListener("pointerleave", () => { if (hoverMark) { hoverMark = null; hideTip(); } });
  track.addEventListener("keydown", (ev) => {
    const big = ev.shiftKey ? 10 : 1;
    let y = null;
    if (ev.key === "ArrowLeft" || ev.key === "ArrowDown") y = state.year - big;
    else if (ev.key === "ArrowRight" || ev.key === "ArrowUp") y = state.year + big;
    else if (ev.key === "PageDown") y = state.year - 100;
    else if (ev.key === "PageUp") y = state.year + 100;
    else if (ev.key === "Home") y = domain[0];
    else if (ev.key === "End") y = domain[1];
    if (y == null) return;
    ev.preventDefault();
    stopPlay();
    setYear(y);
  });
  new ResizeObserver(layout).observe(track);

  return {
    draw, layout, updateDomain, frac, yearAtFrac,
    get domain() { return domain; },
    setAria() {
      track.setAttribute("aria-valuenow", String(state.year));
      track.setAttribute("aria-valuetext", `${fmtYear(state.year)}, ${matchList.length} ${matchList.length === 1 ? "event" : "events"} in the window`);
    },
  };
})();

// ======================================================================
// Year control
// ======================================================================
const yearInput = $("#yearInput"), eraBtn = $("#eraBtn");
let lastTopMatch = null;
function setYear(y, opts = {}) {
  if (!opts.fromPlay) stopPlay();
  const [lo, hi] = timeline.domain;
  y = clamp(Math.round(y), lo, hi);
  if (y === state.year && !opts.force) { if (opts.settle !== false) settleYear(); return; }
  state.year = y;
  update();
  if (opts.settle !== false) settleYear();
}
function settleYear() {
  if (state.locked || !matchList.length) return;
  if (matchList.some((m) => globe.angleTo(m.e.lng, m.e.lat) < 1.1)) return;
  const top = matchList[0].e;
  globe.flyTo(top.lng, top.lat);
}
function renderYearReadout() {
  const d = toDisplay(state.year);
  if (document.activeElement !== yearInput) yearInput.value = String(d.n);
  eraBtn.textContent = d.era;
  eraBtn.setAttribute("aria-label", `${d.era}. Switch to ${d.era === "AD" ? "BC" : "AD"}`);
  timeline.setAria();
}
let yearAtFocus = null;
function commitYearInput() {
  if (yearInput.value.trim() === yearAtFocus) { renderYearReadout(); return; }
  const y = parseYear(yearInput.value, toDisplay(state.year).era);
  if (y == null || Number.isNaN(y)) { renderYearReadout(); return; }
  stopPlay();
  setYear(y, { force: true });
  renderYearReadout();
  yearAtFocus = yearInput.value.trim();
}
yearInput.addEventListener("focus", () => { yearAtFocus = yearInput.value.trim(); yearInput.select(); });
yearInput.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") { ev.preventDefault(); commitYearInput(); yearInput.blur(); }
  else if (ev.key === "Escape") { yearInput.value = String(toDisplay(state.year).n); yearAtFocus = yearInput.value; yearInput.blur(); }
  else if (ev.key === "ArrowUp" || ev.key === "ArrowDown") { ev.preventDefault(); setYear(state.year + (ev.key === "ArrowUp" ? 1 : -1) * (ev.shiftKey ? 10 : 1)); yearInput.value = String(toDisplay(state.year).n); }
});
yearInput.addEventListener("blur", commitYearInput);
eraBtn.addEventListener("click", () => {
  const d = toDisplay(state.year);
  stopPlay();
  setYear(fromDisplay(d.n, d.era === "AD" ? "BC" : "AD"));
});
document.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => { stopPlay(); setYear(state.year + Number(b.dataset.step)); }));
function eventYears() { return [...new Set(state.events.map((e) => e.year))].sort((a, b) => a - b); }
$("#prevEv").addEventListener("click", () => { stopPlay(); const ys = eventYears().filter((y) => y < state.year); if (ys.length) setYear(ys[ys.length - 1]); });
$("#nextEv").addEventListener("click", () => { stopPlay(); const ys = eventYears().filter((y) => y > state.year); if (ys.length) setYear(ys[0]); });

const tolSel = $("#tolSel");
tolSel.value = String(state.tol);
tolSel.addEventListener("change", () => { state.tol = Number(tolSel.value) || 0; savePrefs(); update(); settleYear(); });
document.querySelectorAll("[data-scale]").forEach((b) => b.addEventListener("click", () => {
  state.scale = b.dataset.scale; savePrefs();
  document.querySelectorAll("[data-scale]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.scale === state.scale)));
  timeline.layout();
  if (play) play.f = timeline.frac(state.year);
}));
document.querySelectorAll("[data-scale]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.scale === state.scale)));
// Lock keeps the globe still while time moves: no spin from dragging the timeline and no turning toward events
const lockBtn = $("#lockBtn"), lockShackle = $("#lockShackle");
function renderLock() {
  lockBtn.setAttribute("aria-pressed", String(state.locked));
  lockShackle.setAttribute("d", state.locked ? "M5.5 7V5a2.5 2.5 0 0 1 5 0v2" : "M5.5 7V5a2.5 2.5 0 0 1 5 0");
  lockBtn.title = state.locked ? "Globe locked: it stays still while you move through time" : "Lock the globe so it stays still while you move through time";
}
renderLock();
lockBtn.addEventListener("click", () => {
  state.locked = !state.locked;
  renderLock(); savePrefs();
  if (state.locked) globe.haltSpin(); else settleYear();
});

// play through time at a steady pace along the track
let play = null;
const PLAY_MS = 48000;
const playIcon = $("#playIcon"), playBtn = $("#playBtn");
function startPlay() {
  let f = timeline.frac(state.year);
  if (f >= 0.999) { f = 0; setYear(timeline.domain[0], { settle: false }); }
  play = { f, last: 0, raf: 0 };
  state.playing = true;
  playIcon.setAttribute("d", "M4 3h3v10H4zM9 3h3v10H9z");
  playBtn.setAttribute("aria-label", "Pause");
  const step = (now) => {
    if (!play) return;
    if (play.last) {
      play.f += Math.min(64, now - play.last) / PLAY_MS;
      const y = timeline.yearAtFrac(play.f);
      if (y !== state.year) {
        setYear(y, { settle: false, fromPlay: true });
        const top = matchList[0] ? matchList[0].e.id : null;
        if (top && top !== lastTopMatch) { lastTopMatch = top; settleYear(); }
      }
      if (play.f >= 1) { stopPlay(); return; }
    }
    play.last = now;
    play.raf = requestAnimationFrame(step);
  };
  play.raf = requestAnimationFrame(step);
}
function stopPlay() {
  if (!play) return;
  cancelAnimationFrame(play.raf);
  play = null;
  state.playing = false;
  globe.request();
  playIcon.setAttribute("d", "M4.5 2.8 13 8l-8.5 5.2z");
  playBtn.setAttribute("aria-label", "Play through time");
}
playBtn.addEventListener("click", () => { if (play) stopPlay(); else startPlay(); });

// ======================================================================
// Storage: events are kept in this browser's localStorage
// ======================================================================
const canWrite = () => state.store === "local" || state.store === "cloud";
const stamp = (e) => e.updatedAt || e.createdAt || 0;
// a few marked examples for a first visit, so the globe and timeline have something to show
const EXAMPLES = [
  { id: "ex-giza", title: "Great Pyramid of Giza completed", year: -2559, month: null, day: null, place: "Giza, Egypt", lat: 29.979, lng: 31.134, category: "culture", description: "Built as the tomb of the pharaoh Khufu. The date is approximate, around 2560 BC.", example: true, createdAt: 1792440000000 },
  { id: "ex-gutenberg", title: "Gutenberg Bible printed", year: 1455, month: null, day: null, place: "Mainz, Germany", lat: 49.993, lng: 8.247, category: "science", description: "The first major book printed in Europe with movable metal type.", example: true, createdAt: 1792440001000 },
  { id: "ex-apollo", title: "Apollo 11 launches to the Moon", year: 1969, month: 7, day: 16, place: "Cape Canaveral, USA", lat: 28.608, lng: -80.604, category: "exploration", description: "Launched from Kennedy Space Center. Armstrong and Aldrin walked on the Moon four days later, on 20 July.", example: true, createdAt: 1792440002000 },
  { id: "ex-constantinople", title: "Fall of Constantinople", year: 1453, month: 5, day: 29, place: "Istanbul (Constantinople), Turkey", lat: 41.008, lng: 28.978, category: "conflict", description: "Ottoman forces under Mehmed II captured the city, ending the Byzantine Empire.", example: true, createdAt: 1792440003000 },
  // a pair that surprises people by sharing a year
  { id: "ex-star-wars", title: "Star Wars opens in cinemas", year: 1977, month: 5, day: 25, place: "Hollywood, Los Angeles, USA", lat: 34.102, lng: -118.341, category: "culture", description: "George Lucas's space opera opened on 32 screens across the United States, including Mann's Chinese Theatre in Hollywood.", example: true, createdAt: 1792440004000 },
  { id: "ex-guillotine", title: "Last execution by guillotine in France", year: 1977, month: 9, day: 10, place: "Marseille, France", lat: 43.216, lng: 5.426, category: "politics", description: "Hamida Djandoubi was executed at Baumettes Prison, the last person put to death in France. Star Wars had been in cinemas for three and a half months. France abolished the death penalty in 1981.", example: true, createdAt: 1792440005000 },
];
// examples this browser has already been given, so ones added later reach existing logbooks once
// and anything removed stays removed; logbooks from before this was tracked had the first four
const SEEN_KEY = "chronoglobe:examples-seen:v1";
const FIRST_EXAMPLES = ["ex-giza", "ex-gutenberg", "ex-apollo", "ex-constantinople"];
function addNewExamples() {
  let seen;
  try { seen = JSON.parse(lsGet(SEEN_KEY) || "null"); } catch (_) { seen = null; }
  if (!Array.isArray(seen)) seen = FIRST_EXAMPLES;
  const fresh = EXAMPLES.filter((e) => !seen.includes(e.id));
  if (!fresh.length) return;
  const rows = readLocal();
  const have = new Set(rows.map((r) => r && r.id));
  for (const e of fresh) if (!have.has(e.id)) rows.push(e);
  if (lsSet(LOCAL_KEY, JSON.stringify(rows))) lsSet(SEEN_KEY, JSON.stringify(EXAMPLES.map((e) => e.id)));
}
function readLocal() { try { const a = JSON.parse(lsGet(LOCAL_KEY) || "[]"); return Array.isArray(a) ? a : []; } catch (_) { return []; } }
function writeLocal(rows) { if (!lsSet(LOCAL_KEY, JSON.stringify(rows))) throw { code: "local_blocked" }; }
// "ok", "full" (the site's quota is used up; reads still work) or "blocked" (storage turned off)
function probeStorage() {
  const k = "chronoglobe:probe";
  try { window.localStorage.setItem(k, "1"); window.localStorage.removeItem(k); return "ok"; }
  catch (err) { return err && (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED" || err.code === 22) ? "full" : "blocked"; }
}
// ask the browser not to clear this site's data when space runs low; Firefox asks the user, so only after a save
let persistAsked = false;
function keepStorage() {
  if (persistAsked) return;
  persistAsked = true;
  try {
    if (navigator.storage && navigator.storage.persisted && navigator.storage.persist) {
      navigator.storage.persisted().then((p) => (p ? null : navigator.storage.persist())).catch(() => {});
    }
  } catch (_) {}
}
function loadLocal() { state.events = readLocal().map((r) => normEvent(r && r.id, r)).filter(Boolean); }
function initStore() {
  const probe = probeStorage();
  state.store = probe === "ok" ? "local" : probe;
  if (probe === "ok") {
    if (lsGet(LOCAL_KEY) == null) {
      lsSet(LOCAL_KEY, JSON.stringify(EXAMPLES));
      lsSet(SEEN_KEY, JSON.stringify(EXAMPLES.map((e) => e.id)));
    } else addNewExamples();
  }
  loadLocal();
  renderChrome();
  eventsChanged();
  // another tab added, changed or deleted something
  if (!storageListening) {
    storageListening = true;
    window.addEventListener("storage", (ev) => {
      if (state.store !== "local" || (ev.key !== LOCAL_KEY && ev.key !== null)) return;
      loadLocal();
      eventsChanged();
    });
  }
}
let storageListening = false;
const newId = () => "ev-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
async function putEvent(id, body) {
  if (state.store === "cloud") {
    // Firestore applies the change on this device at once and syncs it when it can
    const nid = id || newId();
    eventsCol().doc(nid).set(Object.assign({}, body, { id: nid })).catch(cloudWriteFailed);
    upsert(nid, body);
    return nid;
  }
  if (!canWrite()) throw { code: "local_blocked" };
  const rows = readLocal();
  const nid = id || newId();
  const row = Object.assign({}, body, { id: nid });
  const i = rows.findIndex((r) => r && r.id === nid);
  if (i >= 0) rows[i] = row; else rows.push(row);
  writeLocal(rows);
  upsert(nid, body);
  return nid;
}
async function removeEvent(id) {
  if (state.store === "cloud") {
    eventsCol().doc(id).delete().catch(cloudWriteFailed);
    state.events = state.events.filter((e) => e.id !== id);
    eventsChanged();
    return;
  }
  if (!canWrite()) throw { code: "local_blocked" };
  writeLocal(readLocal().filter((r) => r && r.id !== id));
  state.events = state.events.filter((e) => e.id !== id);
  eventsChanged();
}
function upsert(id, body) {
  const e = normEvent(id, body);
  if (!e) return;
  const i = state.events.findIndex((x) => x.id === id);
  if (i >= 0) state.events[i] = e; else state.events.push(e);
  eventsChanged();
}
function toRow(e) {
  return { id: e.id, title: e.title, year: e.year, month: e.month, day: e.day, place: e.place, lat: e.lat, lng: e.lng, category: e.category, description: e.description, example: e.example, createdAt: e.createdAt || Date.now(), updatedAt: e.updatedAt || 0 };
}
function describeError(err) {
  if (err && err.code === "local_blocked") {
    return probeStorage() === "full"
      ? "That wasn't saved because this site's storage is full. Export a backup, then free up space."
      : "That wasn't saved because this browser is blocking storage for this site.";
  }
  return "Something went wrong saving that. Try again.";
}
function handleWriteError(err) {
  if (!err || err.code !== "local_blocked") return;
  const probe = probeStorage();
  if (probe !== "ok") { state.store = probe; renderChrome(); renderView(); }
}

// ---------- backup files: the only way to copy events to another browser or device
function exportEvents() {
  const n = state.events.length;
  const data = { app: "chronoglobe", version: 1, exportedAt: new Date().toISOString(), events: state.events.slice().sort(dateOrder).map(toRow) };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2) + "\n"], { type: "application/json" }));
  const a = h("a", { href: url, download: `chronoglobe-events-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  toast(`Backup ready: ${yrsWord(n, "event")}. Check your downloads.`);
}
function importEvents(file) {
  const reader = new FileReader();
  reader.onerror = () => toast("Couldn't read that file.");
  reader.onload = () => {
    let rows = null;
    try {
      const data = JSON.parse(String(reader.result));
      rows = Array.isArray(data) ? data : data && Array.isArray(data.events) ? data.events : null;
    } catch (_) { rows = null; }
    if (!rows) { toast("That file isn't a Chronoglobe backup."); return; }
    const incoming = rows.map((r) => normEvent(r && typeof r.id === "string" && r.id ? r.id.slice(0, 80) : newId(), r)).filter(Boolean);
    if (!incoming.length) { toast("No events found in that file."); return; }
    // merge by id; when both sides have an event, keep whichever was edited last
    const current = state.store === "cloud" ? state.events.map(toRow) : readLocal().filter((r) => r && r.id);
    const merged = new Map(current.map((r) => [r.id, r]));
    const changed = [];
    let added = 0, updated = 0, kept = 0;
    for (const e of incoming) {
      const cur = merged.has(e.id) ? normEvent(e.id, merged.get(e.id)) : null;
      if (!cur) { added++; merged.set(e.id, toRow(e)); changed.push(toRow(e)); continue; }
      if (JSON.stringify(toRow(cur)) === JSON.stringify(toRow(e))) continue;
      if (stamp(cur) >= stamp(e)) { kept++; continue; }
      updated++; merged.set(e.id, toRow(e)); changed.push(toRow(e));
    }
    if (!added && !updated) {
      toast(kept ? `Nothing imported: the ${yrsWord(kept, "event")} here ${kept === 1 ? "is" : "are"} newer than the file's.` : "Everything in that file is already here.");
      return;
    }
    if (state.store === "cloud") {
      writeCloud(changed);
      state.events = [...merged.values()].map((r) => normEvent(r.id, r)).filter(Boolean);
    } else {
      try { writeLocal([...merged.values()]); } catch (err) { handleWriteError(err); toast(describeError(err)); return; }
      loadLocal();
    }
    eventsChanged();
    keepStorage();
    const parts = [];
    if (added) parts.push(`${yrsWord(added, "new event")}`);
    if (updated) parts.push(`updated ${updated}`);
    if (kept) parts.push(`kept ${kept} newer ${kept === 1 ? "version" : "versions"} already here`);
    toast(`Imported ${parts.join(", ")}`);
  };
  reader.readAsText(file);
}

// ======================================================================
// Sync: when firebase-config.js names a Firebase project, signing in with Google keeps
// the events in the account (Firestore users/<uid>/events/<id>), so every device that
// signs in sees the same logbook. Signed out, events stay in this browser as before.
// ======================================================================
const SIGNED_IN_KEY = "chronoglobe:signed-in";
const MERGED_PREFIX = "chronoglobe:merged:";
const cloud = { available: false, auth: null, db: null, user: null, unsub: null, seen: false, serverSeen: false, merged: false, pending: false, offline: false, failed: false };
let cloudWait = 0;
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Couldn't load " + src));
    document.head.append(s);
  });
}
async function initCloud() {
  const cfg = window.CHRONOGLOBE_FIREBASE;
  if (!cfg || typeof cfg !== "object") return;
  try {
    // fetched only when sync is set up
    if (!window.firebase) for (const f of ["app", "auth", "firestore"]) await loadScript(`vendor/firebase/firebase-${f}-compat.js`);
    if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(cfg);
    cloud.auth = firebase.auth();
    cloud.db = firebase.firestore();
    // keep a copy on this device so the logbook opens offline and offline changes sync later
    cloud.db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
  } catch (err) {
    console.warn("Chronoglobe: sync is unavailable", err);
    if (state.store === "connecting") initStore();
    return;
  }
  cloud.available = true;
  renderChrome();
  renderView();
  cloud.auth.getRedirectResult().catch((err) => toast(authMessage(err)));
  cloud.auth.onAuthStateChanged((user) => { if (user) startCloud(user); else stopCloud(); });
}
function authMessage(err) {
  const code = (err && err.code) || "";
  if (code === "auth/unauthorized-domain") return "Sign-in isn't allowed from this address yet. Add it under Authentication, Settings, Authorized domains in Firebase.";
  if (code === "auth/operation-not-allowed") return "Google sign-in isn't turned on for this Firebase project yet.";
  if (code === "auth/network-request-failed") return "Couldn't reach Google. Check your connection and try again.";
  return "Sign-in didn't work. Try again.";
}
async function signIn() {
  if (!cloud.available) return;
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    await cloud.auth.signInWithPopup(provider);
  } catch (err) {
    const code = err && err.code;
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
    if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
      cloud.auth.signInWithRedirect(provider).catch((e) => toast(authMessage(e)));
      return;
    }
    toast(authMessage(err));
  }
}
function signOut() {
  stopCloud();
  if (cloud.auth) cloud.auth.signOut().catch(() => {});
}
const eventsCol = () => cloud.db.collection("users").doc(cloud.user.uid).collection("events");
function cloudWriteFailed(err) {
  toast(err && err.code === "permission-denied"
    ? "Your account refused that change. Check the Firestore rules in the Firebase console."
    : "A change didn't sync. It will be retried when the connection is back.");
}
function writeCloud(rows) {
  for (let i = 0; i < rows.length; i += 400) {
    const batch = cloud.db.batch();
    for (const r of rows.slice(i, i + 400)) batch.set(eventsCol().doc(r.id), r);
    batch.commit().catch(cloudWriteFailed);
  }
}
function startCloud(user) {
  if (cloud.user && cloud.user.uid === user.uid && cloud.unsub) return;
  if (cloud.unsub) { cloud.unsub(); cloud.unsub = null; }
  clearTimeout(cloudWait);
  Object.assign(cloud, { user, seen: false, serverSeen: false, merged: false, pending: false, offline: false, failed: false });
  lsSet(SIGNED_IN_KEY, "1");
  state.store = "cloud";
  state.events = [];
  if (state.loaded) eventsChanged(); else renderView();
  renderChrome();
  cloud.unsub = eventsCol().onSnapshot({ includeMetadataChanges: true }, (snap) => {
    cloud.pending = snap.metadata.hasPendingWrites;
    cloud.offline = snap.metadata.fromCache;
    if (!snap.metadata.fromCache) cloud.serverSeen = true;
    cloud.failed = false;
    state.events = snap.docs.map((d) => normEvent(d.id, d.data())).filter(Boolean);
    const first = !cloud.seen, wasLoaded = state.loaded;
    cloud.seen = true;
    renderChrome();
    eventsChanged();
    // open on the latest event, as a fresh load does, unless something is open
    if (first && wasLoaded && state.view === "list" && !state.selectedId && state.events.length) { chooseStart(); update(); }
    if (!cloud.merged && !snap.metadata.fromCache) { cloud.merged = true; mergeLocalIntoCloud(); }
  }, (err) => {
    cloud.failed = true;
    renderChrome();
    toast(err && err.code === "permission-denied"
      ? "The database didn't share your events. Check the Firestore rules in the Firebase console."
      : "Couldn't load your synced events. Reload to try again.");
  });
}
function stopCloud() {
  if (cloud.unsub) { cloud.unsub(); cloud.unsub = null; }
  clearTimeout(cloudWait);
  lsSet(SIGNED_IN_KEY, "");
  const wasCloud = state.store === "cloud" || state.store === "connecting";
  cloud.user = null; cloud.seen = false;
  // back to this browser's own logbook
  if (wasCloud) initStore(); else { renderChrome(); renderView(); }
}
// the first time an account is used on this browser, its local events join the account
// (newer copy wins), then the browser's own list is emptied so nothing is added twice
async function mergeLocalIntoCloud() {
  const uid = cloud.user && cloud.user.uid;
  if (!uid || lsGet(MERGED_PREFIX + uid)) return;
  const have = new Map(state.events.map((e) => [e.id, e]));
  const up = readLocal().map((r) => normEvent(r && r.id, r)).filter(Boolean)
    .filter((e) => { const c = have.get(e.id); return !c || stamp(e) > stamp(c); });
  try {
    for (let i = 0; i < up.length; i += 400) {
      const batch = cloud.db.batch();
      for (const e of up.slice(i, i + 400)) batch.set(eventsCol().doc(e.id), toRow(e));
      await batch.commit();
    }
  } catch (err) {
    cloud.merged = false;
    toast("Couldn't add this browser's events to your account. They're still here and will be added next time.");
    return;
  }
  lsSet(MERGED_PREFIX + uid, "1");
  lsSet(LOCAL_KEY, "[]");
  toast(up.length ? `Added ${yrsWord(up.length, "event")} from this browser to your account` : "Signed in. Your events now sync between devices.");
}

$("#importFile").addEventListener("change", (ev) => {
  const f = ev.target.files && ev.target.files[0];
  if (f) importEvents(f);
  ev.target.value = "";
});

// ======================================================================
// Rendering
// ======================================================================
let panelQueued = false;
function update() {
  recompute();
  renderYearReadout();
  timeline.draw();
  globe.request();
  renderHud();
  if (!panelQueued) { panelQueued = true; requestAnimationFrame(() => { panelQueued = false; renderCounts(); if (listShown()) renderList(); if (state.view === "detail") refreshDetail(); }); }
}
function eventsChanged() {
  const first = !state.loaded;
  state.loaded = true;
  timeline.updateDomain();
  { const [lo, hi] = timeline.domain; state.year = clamp(state.year, lo, hi); }
  if (state.selectedId && !byId(state.selectedId)) { state.selectedId = null; if (state.view === "detail") state.view = "list"; }
  if (first && !state.restored) chooseStart();
  recompute();
  update();
  renderStats();
  renderChrome();
  renderView();
}
function chooseStart() {
  if (!state.events.length) return;
  const latest = state.events.reduce((a, b) => (b.createdAt > a.createdAt ? b : a));
  state.year = latest.year;
  globe.flyTo(latest.lng, latest.lat);
}
function renderChrome() {
  const sync = $("#sync");
  const labels = {
    connecting: ["Loading…", ""],
    local: ["Saved in this browser", "Events are stored in this browser on this device. Use Export backup to keep a copy or move them to another device."],
    blocked: ["Not saving", "This browser is blocking storage for this site, so new events can't be saved."],
    full: ["Storage full", "This site's storage is full, so changes can't be saved. Export a backup, then free up space."],
  };
  const email = cloud.user && cloud.user.email ? cloud.user.email : "your Google account";
  if (cloud.available) labels.local[1] = "Events are stored in this browser only. Sign in to keep them in your account and see them on your other devices.";
  labels.cloud = cloud.failed ? ["Not syncing", "Your synced events couldn't be loaded. Reload to try again."]
    : cloud.offline && cloud.serverSeen ? ["Offline", "Changes are kept on this device and sync when you're back online."]
    : cloud.offline || cloud.pending ? ["Syncing…", `Saving to ${email}`]
    : ["Synced", `Signed in as ${email}. Events sync to every device where you sign in.`];
  const [t, title] = labels[state.store] || labels.connecting;
  sync.textContent = t; sync.title = title;
  sync.dataset.state = state.store !== "cloud" ? state.store : cloud.failed ? "blocked" : cloud.offline && cloud.serverSeen ? "offline" : "local";
  $("#addBtn").hidden = !canWrite();
  $("#signInBtn").hidden = !(cloud.available && state.store !== "cloud" && state.store !== "connecting");
}
function renderStats() {
  const el = $("#stats");
  const n = state.events.length;
  if (!state.loaded) { el.textContent = "Loading your events…"; return; }
  if (!n) { el.textContent = "No events logged yet"; return; }
  let lo = Infinity, hi = -Infinity;
  for (const e of state.events) { lo = Math.min(lo, e.year); hi = Math.max(hi, e.year); }
  const parts = [h("b", { text: String(n) }), n === 1 ? " event logged" : " events logged"];
  if (n > 1 && lo !== hi) parts.push(`, ${fmtYear(lo)} to ${fmtYear(hi)}`);
  else parts.push(`, ${fmtYear(lo)}`);
  el.replaceChildren(...parts);
}
function renderCounts() {
  $("#countNow").textContent = String(matchList.length);
  $("#countAll").textContent = String(state.events.length);
}
function windowPhrase() { return state.tol === 0 ? `in ${fmtYear(state.year)}` : `within ±${yrs(state.tol)} of ${fmtYear(state.year)}`; }
function renderHud() {
  const el = $("#hudCount");
  if (!state.loaded) { el.textContent = ""; el.hidden = true; return; }
  el.hidden = false;
  const n = matchList.length;
  el.replaceChildren(n ? h("b", { text: `${n} ${n === 1 ? "event" : "events"}` }) : "No events", " " + windowPhrase());
}
function renderFar(far) {
  const btn = $("#hudFar");
  if (!far.length) { btn.hidden = true; return; }
  btn.hidden = false;
  btn.textContent = `${far.length} on the far side · Turn globe`;
}
// farMatches runs weakest to strongest, so turn toward the last (closest in time)
$("#hudFar").addEventListener("click", () => { const f = globe.farMatches, e = f[f.length - 1]; if (e) globe.flyTo(e.lng, e.lat); });

// on phones the details are a sheet over the page, so the list stays underneath
const listShown = () => state.view === "list" || (state.view === "detail" && narrow.matches);
function renderView() {
  $("#listView").hidden = !listShown();
  $("#detailView").hidden = state.view !== "detail";
  $("#formView").hidden = state.view !== "form";
  $("#pickHint").hidden = state.view !== "form";
  $("#globe").classList.toggle("picking", state.view === "form");
  const tabsLive = listShown();
  $("#tabNow").setAttribute("aria-selected", String(tabsLive && state.tab === "now"));
  $("#tabAll").setAttribute("aria-selected", String(tabsLive && state.tab === "all"));
  $("#tabNow").disabled = $("#tabAll").disabled = state.view === "form";
  $("#allTools").hidden = !(state.tab === "all" && state.events.length > 0);
  renderCounts();
  if (tabsLive) renderList();
  if (state.view === "detail") renderDetail();
  globe.request();
  timeline.draw();
}
function setTab(tab) {
  if (state.view === "form") return;
  state.tab = tab; state.view = "list"; state.selectedId = null; confirmDelete = false;
  renderView();
  if (tab === "all") scrollTimelineToYear();
  else $("#panelBody").scrollTop = 0;
}
// open the full timeline at the slider's year rather than at the top
function scrollTimelineToYear() {
  const body = $("#panelBody");
  if (narrow.matches) return;
  const rows = [...document.querySelectorAll("#listItems .ev[data-year]")];
  if (!rows.length) { body.scrollTop = 0; return; }
  const target = rows.find((r) => Number(r.dataset.year) >= state.year) || rows[rows.length - 1];
  const prev = target.previousElementSibling;
  const anchor = prev && prev.classList.contains("grp") ? prev : target;
  body.scrollTop += anchor.getBoundingClientRect().top - body.getBoundingClientRect().top - 8;
}
function closeDetail(opts = {}) {
  if (state.view === "form") return;
  state.selectedId = null; confirmDelete = false;
  if (state.view === "detail") state.view = "list";
  renderView();
  if (opts.focus) (state.tab === "all" ? $("#tabAll") : $("#tabNow")).focus({ preventScroll: true });
}
$("#tabNow").addEventListener("click", () => setTab("now"));
$("#tabAll").addEventListener("click", () => setTab("all"));
$("#search").addEventListener("input", (ev) => { state.query = ev.target.value; renderList(); });
const catFilter = $("#catFilter"), fCat = $("#fCat");
for (const [k, label] of CATEGORIES) { catFilter.append(h("option", { value: k, text: label })); fCat.append(h("option", { value: k, text: label })); }
catFilter.addEventListener("change", () => { state.cat = catFilter.value; renderList(); });

function offText(e, d) {
  if (d === 0) return "Same year";
  return `${d} yr${d === 1 ? "" : "s"} ${e.year > state.year ? "later" : "earlier"}`;
}
function eventRow(e, opts) {
  const d = matchMap.get(e.id);
  const isMatch = d != null;
  const mk = h("span", { class: "mk" });
  if (isMatch) mk.style.setProperty("--s", String(0.45 + 0.55 * strength(d)));
  let tail = null;
  if (opts.showOffset && isMatch) tail = h("span", { class: "off" + (d === 0 ? " exact" : ""), text: offText(e, d) });
  else if (e.example) tail = h("span", { class: "badge", text: "Example" });
  const sub = [fmtDayMonth(e), e.place, e.category ? CAT_LABEL[e.category] : ""].filter(Boolean).join(" · ");
  return h("button", {
    class: "ev" + (isMatch ? " is-match" : ""), type: "button", "aria-current": String(e.id === state.selectedId), "data-year": String(e.year),
    onclick: () => selectEvent(e.id, { fly: true }),
  }, mk, h("span", { class: "y", text: fmtYear(e.year) }), h("span", { class: "b" }, h("span", { class: "t", text: e.title }), sub ? h("span", { class: "p", text: sub }) : null), tail);
}
function renderList() {
  const box = $("#listItems");
  $("#allTools").hidden = !(state.tab === "all" && state.events.length > 0);
  const out = [];
  if (!state.loaded) { box.replaceChildren(h("p", { class: "list-head", text: "Loading your events…" })); return; }
  if (!state.events.length) { box.replaceChildren(emptyState()); return; }
  const examples = state.events.filter((e) => e.example);
  if (examples.length && canWrite()) out.push(examplesBanner(examples));
  if (state.tab === "now") {
    const n = matchList.length;
    out.push(h("p", { class: "list-head" }, n ? h("b", { text: `${n} ${n === 1 ? "event" : "events"}` }) : "Nothing", " " + windowPhrase()));
    if (!n) {
      const ys = eventYears(), prev = ys.filter((y) => y < state.year).pop(), next = ys.find((y) => y > state.year);
      const row = h("div", { class: "jump-row" });
      if (prev != null) row.append(h("button", { class: "btn", type: "button", text: `← ${fmtYear(prev)}`, title: "Jump to the previous event", onclick: () => setYear(prev) }));
      if (next != null) row.append(h("button", { class: "btn", type: "button", text: `${fmtYear(next)} →`, title: "Jump to the next event", onclick: () => setYear(next) }));
      const wider = [1, 5, 10, 25, 50, 100].find((t) => t > state.tol);
      if (wider) row.append(h("button", { class: "btn ghost", type: "button", text: `Widen to ±${yrs(wider)}`, onclick: () => { state.tol = wider; tolSel.value = String(wider); savePrefs(); update(); settleYear(); } }));
      out.push(row);
    }
    for (const m of matchList) out.push(eventRow(m.e, { showOffset: true }));
  } else {
    const q = state.query.trim().toLowerCase();
    const list = state.events.filter((e) => (!state.cat || e.category === state.cat) &&
      (!q || e.title.toLowerCase().includes(q) || e.place.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || fmtDate(e).toLowerCase().includes(q)))
      .sort((a, b) => dateOrder(a, b) || a.title.localeCompare(b.title));
    if (!list.length) out.push(h("p", { class: "list-head", text: "No events match that search." }));
    let key = null;
    for (const e of list) {
      const k = periodKey(e.year);
      if (k !== key) { key = k; out.push(h("h3", { class: "grp", text: periodLabel(e.year) })); }
      out.push(eventRow(e, { showOffset: false }));
    }
    out.push(dataTools());
  }
  box.replaceChildren(...out);
}
function emptyState() {
  if (state.store === "cloud" && !cloud.seen) return h("p", { class: "list-head", text: "Loading your synced events…" });
  const offerSignIn = cloud.available && state.store !== "cloud";
  if (state.store === "blocked") {
    return h("div", { class: "empty" },
      h("h3", { text: "This browser isn't saving" }),
      h("p", { text: "Storage is turned off for this site, so events can't be kept. Allow site data in your browser settings, then reload." }));
  }
  if (state.store === "full") {
    return h("div", { class: "empty" },
      h("h3", { text: "Storage is full" }),
      h("p", { text: "This site's storage is used up, so events can't be saved. Other pages on the same site may be using the space." }));
  }
  return h("div", { class: "empty" },
    h("h3", { text: "Your logbook is empty" }),
    h("p", { text: offerSignIn
      ? "Sign in to see the events you've synced from your other devices, or add one here."
      : "Each event you add becomes a point on the globe and a mark on the timeline. Drag the timeline to see which events line up with a year." }),
    h("div", { class: "row" },
      offerSignIn ? h("button", { class: "btn primary", type: "button", text: "Sign in to sync", onclick: signIn }) : null,
      h("button", { class: offerSignIn ? "btn" : "btn primary", type: "button", text: "Add your first event", onclick: () => openForm(null) }),
      h("button", { class: "btn", type: "button", text: "Import a backup", onclick: () => $("#importFile").click() })));
}
function dataTools() {
  const email = cloud.user && cloud.user.email ? cloud.user.email : "your Google account";
  const text = state.store === "cloud"
    ? `Events are saved to ${email} and sync to every device where you sign in. Export a backup now and then to keep a copy of your own.`
    : state.store !== "local"
      ? "Changes can't be saved right now. Export a backup to keep a copy of your events."
      : cloud.available
        ? "Events are saved in this browser only. Sign in to keep them in your account and see them on your other devices."
        : "Events are saved in this browser on this device, and browsers can clear them (Safari does after 7 days without a visit). Export a backup now and then to keep a copy or move them to another device.";
  return h("div", { class: "data-tools" },
    h("p", { text }),
    h("div", { class: "row" },
      h("button", { class: "btn", type: "button", text: "Export backup", onclick: exportEvents }),
      canWrite() ? h("button", { class: "btn", type: "button", text: "Import backup", onclick: () => $("#importFile").click() }) : null,
      state.store === "cloud" ? h("button", { class: "btn ghost", type: "button", text: "Sign out", onclick: signOut }) : null,
      cloud.available && state.store === "local" ? h("button", { class: "btn ghost", type: "button", text: "Sign in to sync", onclick: signIn }) : null));
}
let confirmExamples = false, deletingExamples = false;
function examplesBanner(examples) {
  const box = h("div", { class: "examples" });
  const n = examples.length, label = n === 1 ? "1 example" : `${n} examples`;
  if (deletingExamples) {
    box.append(h("p", { text: "Removing the example events…" }), h("div", { class: "row" }, h("button", { class: "btn", type: "button", disabled: true, text: "Deleting…" })));
  } else if (!confirmExamples) {
    box.append(h("p", { text: `${n === 1 ? "1 example event is" : `${n} example events are`} loaded so you can try things out. Your own events sit alongside them.` }),
      h("div", { class: "row" }, h("button", { class: "btn", type: "button", text: "Remove examples", onclick: () => { confirmExamples = true; renderList(); } })));
  } else {
    const go = h("button", { class: "btn danger-solid", type: "button", text: `Delete ${label}` });
    go.addEventListener("click", async () => {
      if (deletingExamples) return;
      deletingExamples = true; renderList();
      try { for (const e of examples) await removeEvent(e.id); toast("Examples removed"); }
      catch (err) { handleWriteError(err); toast(describeError(err)); }
      finally { deletingExamples = false; confirmExamples = false; renderList(); }
    });
    box.append(h("p", { text: `Delete the ${label}? Events you added stay.` }),
      h("div", { class: "row" }, go, h("button", { class: "btn", type: "button", text: "Keep them", onclick: () => { confirmExamples = false; renderList(); } })));
  }
  return box;
}

// ---------- selection & detail
function selectEvent(id, opts = {}) {
  const e = byId(id);
  if (!e) return;
  state.selectedId = id;
  // picking an event anywhere moves the timeline to its year
  stopPlay();
  setYear(e.year, { settle: false });
  if (opts.fly !== false) globe.flyTo(e.lng, e.lat, { zoom: opts.zoom });
  state.view = "detail";
  confirmDelete = false;
  renderView();
  if (!narrow.matches) $("#panelBody").scrollTop = 0;
  const t = $("#detailView .d-title");
  if (t) t.focus({ preventScroll: true });
}
let confirmDelete = false, detailMatch = null;
function refreshDetail() {
  const e = state.selectedId && byId(state.selectedId);
  if (!e || matchMap.has(e.id) !== detailMatch) renderDetail();
}
function renderDetail() {
  const box = $("#detailView");
  const e = state.selectedId && byId(state.selectedId);
  if (!e) { state.view = "list"; renderView(); return; }
  const writable = canWrite();
  const d = matchMap.get(e.id);
  detailMatch = d != null;
  const meta = h("dl", { class: "d-meta" });
  const add = (k, v) => meta.append(h("dt", { text: k }), h("dd", null, v));
  add("When", h("span", null, fmtDate(e), h("span", { class: "mono", text: `  ${yearsAgo(e.year)}` })));
  if (e.place) add("Where", e.place);
  add("Location", h("span", { class: "mono", text: fmtCoord(e.lat, e.lng) }));
  const kids = [
    h("div", { class: "d-top" },
      h("button", { class: "btn ghost", type: "button", text: narrow.matches ? "Close" : "← Back", onclick: () => closeDetail({ focus: true }) }),
      e.example ? h("span", { class: "badge", text: "Example" }) : null),
    h("div", null,
      h("div", { class: "d-year", text: fmtDate(e) }),
      h("h2", { class: "d-title", tabindex: "-1", text: e.title })),
  ];
  if (e.category) kids.push(h("span", { class: "d-cat", text: CAT_LABEL[e.category] }));
  kids.push(meta);
  kids.push(e.description ? h("p", { class: "d-notes", text: e.description }) : h("p", { class: "d-notes", text: writable ? "No description yet. Choose Edit to add one." : "No description." }));
  const sameYear = state.events.filter((x) => x.year === e.year && x.id !== e.id).sort((a, b) => dateOrder(a, b) || a.title.localeCompare(b.title));
  if (sameYear.length) {
    kids.push(h("section", { class: "same-year", "aria-label": `Other events in ${fmtYear(e.year)}` },
      h("h3", { text: `Also in ${fmtYear(e.year)}` }),
      sameYear.map((x) => h("button", { type: "button", text: x.title, onclick: () => selectEvent(x.id, { fly: true }) }))));
  }
  if (d == null) kids.push(h("div", { class: "d-actions" }, h("button", { class: "btn", type: "button", text: `Move timeline to ${fmtYear(e.year)}`, onclick: () => setYear(e.year) })));
  if (writable) {
    if (!confirmDelete) {
      kids.push(h("div", { class: "d-actions" },
        h("button", { class: "btn", type: "button", text: "Edit", onclick: () => openForm(e.id) }),
        h("button", { class: "btn danger", type: "button", text: "Delete", onclick: () => { confirmDelete = true; renderDetail(); } })));
    } else {
      const go = h("button", { class: "btn danger-solid", type: "button", text: "Delete event" });
      go.addEventListener("click", async () => {
        go.disabled = true;
        try { await removeEvent(e.id); closeDetail({ focus: true }); toast("Event deleted"); }
        catch (err) { handleWriteError(err); go.disabled = false; toast(describeError(err)); }
      });
      kids.push(h("div", { class: "confirm" }, h("span", { text: `Delete “${e.title}”? This can't be undone.` }),
        h("div", { class: "row" }, go, h("button", { class: "btn", type: "button", text: "Cancel", onclick: () => { confirmDelete = false; renderDetail(); } }))));
    }
  }
  box.replaceChildren(h("div", { class: "detail" }, ...kids));
}

// ---------- add / edit form
const F = {
  title: $("#fTitle"), year: $("#fYear"), era: $("#fEra"), day: $("#fDay"), month: $("#fMonth"), place: $("#fPlace"),
  lat: $("#fLat"), lng: $("#fLng"), cat: $("#fCat"), desc: $("#fDesc"),
  err: $("#formErr"), save: $("#fSave"), locText: $("#fLocText"), heading: $("#formTitle"),
};
(() => {
  const dl = $("#placeList"), names = new Set();
  for (const p of PLACES) names.add(p.name);
  for (const c of COUNTRIES) names.add(c.name);
  dl.append(...[...names].sort((a, b) => a.localeCompare(b)).map((n) => h("option", { value: n })));
  MONTHS.forEach((m, i) => F.month.append(h("option", { value: String(i + 1), text: m })));
})();
function openForm(id) {
  stopPlay();
  const e = id ? byId(id) : null;
  state.editingId = e ? e.id : null;
  F.heading.textContent = e ? "Edit event" : "Add an event";
  F.save.textContent = e ? "Save changes" : "Save event";
  F.title.value = e ? e.title : "";
  const d = toDisplay(e ? e.year : state.year);
  F.year.value = e ? String(d.n) : "";
  F.era.value = d.era;
  F.month.value = e && e.month ? String(e.month) : "";
  F.day.value = e && e.day ? String(e.day) : "";
  F.place.value = e ? e.place : "";
  F.cat.value = e ? e.category : "";
  F.desc.value = e ? e.description : "";
  state.placeAuto = !e || !e.place;
  state.draft = e ? { lat: e.lat, lng: e.lng } : null;
  F.err.hidden = true;
  state.view = "form";
  renderView();
  renderDraft();
  $("#panelBody").scrollTop = 0;
  F.title.focus({ preventScroll: true });
  if (narrow.matches) $("#formView").scrollIntoView({ block: "start", behavior: reduceMotion.matches ? "auto" : "smooth" });
}
function closeForm() {
  state.view = state.editingId && byId(state.editingId) ? "detail" : "list";
  state.editingId = null; state.draft = null;
  renderView();
}
function setDraft(lat, lng, source) {
  state.draft = { lat: clamp(lat, -90, 90), lng: ((lng + 540) % 360) - 180 };
  if (source === "globe" && (state.placeAuto || !F.place.value.trim())) {
    F.place.value = describeLocation(state.draft.lng, state.draft.lat);
    state.placeAuto = true;
  }
  if (source !== "inputs") { F.lat.value = state.draft.lat.toFixed(3); F.lng.value = state.draft.lng.toFixed(3); }
  if (source === "place") globe.flyTo(state.draft.lng, state.draft.lat);
  F.err.hidden = true;
  renderDraft();
}
function renderDraft() {
  if (state.draft) {
    F.locText.className = "loc-text";
    F.locText.textContent = `Pinned at ${fmtCoord(state.draft.lat, state.draft.lng)}. Click the globe again to move it.`;
    if (document.activeElement !== F.lat) F.lat.value = state.draft.lat.toFixed(3);
    if (document.activeElement !== F.lng) F.lng.value = state.draft.lng.toFixed(3);
  } else {
    F.locText.className = "loc-text none";
    F.locText.textContent = "No location yet. Click the globe or pick a place above.";
    F.lat.value = ""; F.lng.value = "";
  }
  globe.request();
}
function tryPlace() {
  const p = PLACE_INDEX.get(F.place.value.trim().toLowerCase());
  if (p) { state.placeAuto = false; setDraft(p.lat, p.lng, "place"); }
}
F.place.addEventListener("input", () => { state.placeAuto = false; tryPlace(); });
F.place.addEventListener("change", tryPlace);
for (const inp of [F.lat, F.lng]) inp.addEventListener("input", () => {
  const lat = parseFloat(F.lat.value), lng = parseFloat(F.lng.value);
  if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) setDraft(lat, lng, "inputs");
});
for (const inp of [F.lat, F.lng]) inp.addEventListener("change", () => { if (state.draft) globe.flyTo(state.draft.lng, state.draft.lat); });
$("#formBack").addEventListener("click", closeForm);
$("#formCancel").addEventListener("click", closeForm);
$("#addBtn").addEventListener("click", () => openForm(null));
function formError(msg, field) { F.err.textContent = msg; F.err.hidden = false; if (field) field.focus(); }
$("#formView").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const title = F.title.value.trim();
  if (!title) return formError("Give the event a title.", F.title);
  const year = parseYear(F.year.value, F.era.value);
  if (year == null || Number.isNaN(year)) return formError("Enter the year as a number, such as 1066 or 44 BC.", F.year);
  if (year > NOW_YEAR) return formError(`That year is in the future. Enter ${NOW_YEAR} or earlier.`, F.year);
  const month = F.month.value ? Number(F.month.value) : null;
  let day = null;
  if (F.day.value.trim()) {
    if (!month) return formError("Pick a month to go with the day, or clear the day.", F.month);
    day = Number(F.day.value.trim());
    if (!Number.isInteger(day) || day < 1 || day > MONTH_DAYS[month - 1]) return formError(`${MONTHS[month - 1]} has days 1 to ${MONTH_DAYS[month - 1]}.`, F.day);
  }
  if (!state.draft) return formError("Choose where it happened: click the globe or pick a place.", F.place);
  const prev = state.editingId ? byId(state.editingId) : null;
  const body = {
    title, year, month, day, place: F.place.value.trim().slice(0, 120),
    lat: Math.round(state.draft.lat * 1000) / 1000, lng: Math.round(state.draft.lng * 1000) / 1000,
    category: F.cat.value || "", description: F.desc.value.trim().slice(0, 4000),
    example: false, createdAt: prev ? prev.createdAt : Date.now(), updatedAt: Date.now(),
  };
  F.save.disabled = true; F.save.textContent = "Saving…";
  try {
    const id = await putEvent(state.editingId, body);
    state.editingId = null; state.draft = null;
    state.selectedId = id;
    setYear(year, { settle: false });
    globe.flyTo(body.lng, body.lat);
    state.view = "detail";
    renderView();
    toast(prev ? "Changes saved" : "Event added");
    keepStorage();
  } catch (err) {
    handleWriteError(err);
    formError(describeError(err));
  } finally {
    F.save.disabled = false; F.save.textContent = state.editingId ? "Save changes" : "Save event";
  }
});

function onScrubStart() {
  if (state.view === "detail") { state.view = "list"; state.tab = "now"; state.selectedId = null; confirmDelete = false; renderView(); }
}

// ---------- toast
let toastTimer = 0;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.hidden = false;
  const live = $("#toastLive");
  live.textContent = "";
  requestAnimationFrame(() => { live.textContent = msg; });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}

narrow.addEventListener("change", () => renderView());
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { timeline.layout(); globe.request(); });

// read-only hooks for the end-to-end tests
window.__chronoglobe = Object.freeze({ view: () => globe.getView(), labelsShown: () => globe.labelsShown(), spin: () => globe.spinSpeed(), fading: () => afterglow.size });

// ---------- boot
renderChrome(); renderStats(); renderView(); update();
$("#signInBtn").addEventListener("click", signIn);
// signed in on this device before: wait for the account's events instead of flashing this browser's own
if (window.CHRONOGLOBE_FIREBASE && lsGet(SIGNED_IN_KEY) === "1") {
  cloudWait = setTimeout(() => { if (state.store === "connecting") initStore(); }, 10000);
} else initStore();
initCloud();
})();
