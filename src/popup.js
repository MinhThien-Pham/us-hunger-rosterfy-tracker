const ROSTERFY_ORIGIN = "https://ushunger.rosterfy.com";
const WAREHOUSE_ADDRESS = "830 S Ronald Reagan Blvd #142, Longwood, FL 32750";
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const STATE_SET = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC"
]);

const STATE_NAME_TO_ABBR = new Map(Object.entries({
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
  "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
  "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
  "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO",
  "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
  "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
  "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
  "Virginia": "VA", "Washington": "DC", "Washington DC": "DC", "Washington, DC": "DC",
  "Washington D.C.": "DC", "District of Columbia": "DC", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"
}));

const STATE_ORDER = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC","Canada","N/A"
];

const KNOWN_CITY_STATES = new Map(Object.entries({
  "Atlanta": "GA",
  "Baltimore": "MD",
  "Birmingham": "AL",
  "Bridgeport": "CT",
  "Brooklyn": "NY",
  "Charleston": "SC",
  "Charlotte": "NC",
  "Cincinnati": "OH",
  "Columbus": "OH",
  "Hartford": "CT",
  "Houston": "TX",
  "Jacksonville": "FL",
  "Jersey City": "NJ",
  "Lake Mary": "FL",
  "Louisville": "KY",
  "Miami": "FL",
  "New Hyde Park": "NY",
  "New Orleans": "LA",
  "Newark": "NJ",
  "Oklahoma City": "OK",
  "Orlando": "FL",
  "Philadelphia": "PA",
  "Pittsburgh": "PA",
  "Queens": "NY",
  "Raleigh": "NC",
  "Tampa": "FL",
  "Washington": "DC"
}));

const STATE_CENTERS = {
  AL:[32.8067,-86.7911], AK:[64.2008,-149.4937], AZ:[34.0489,-111.0937], AR:[35.2010,-91.8318],
  CA:[36.7783,-119.4179], CO:[39.5501,-105.7821], CT:[41.6032,-73.0877], DE:[38.9108,-75.5277],
  FL:[27.6648,-81.5158], GA:[32.1656,-82.9001], HI:[19.8968,-155.5828], ID:[44.0682,-114.7420],
  IL:[40.6331,-89.3985], IN:[40.2672,-86.1349], IA:[41.8780,-93.0977], KS:[39.0119,-98.4842],
  KY:[37.8393,-84.2700], LA:[30.9843,-91.9623], ME:[45.2538,-69.4455], MD:[39.0458,-76.6413],
  MA:[42.4072,-71.3824], MI:[44.3148,-85.6024], MN:[46.7296,-94.6859], MS:[32.3547,-89.3985],
  MO:[37.9643,-91.8318], MT:[46.8797,-110.3626], NE:[41.4925,-99.9018], NV:[38.8026,-116.4194],
  NH:[43.1939,-71.5724], NJ:[40.0583,-74.4057], NM:[34.5199,-105.8701], NY:[43.2994,-74.2179],
  NC:[35.7596,-79.0193], ND:[47.5515,-101.0020], OH:[40.4173,-82.9071], OK:[35.0078,-97.0929],
  OR:[43.8041,-120.5542], PA:[41.2033,-77.1945], RI:[41.5801,-71.4774], SC:[33.8361,-81.1637],
  SD:[43.9695,-99.9018], TN:[35.5175,-86.5804], TX:[31.9686,-99.9018], UT:[39.3210,-111.0937],
  VT:[44.5588,-72.5778], VA:[37.4316,-78.6569], WA:[47.7511,-120.7401], WV:[38.5976,-80.4549],
  WI:[43.7844,-88.7879], WY:[43.0760,-107.2903], DC:[38.9072,-77.0369]
};

const CITY_COORDS = {
  "Atlanta, GA":[33.7490,-84.3880], "Baltimore, MD":[39.2904,-76.6122],
  "Birmingham, AL":[33.5186,-86.8104], "Bloomington/Normal, IL":[40.5142,-88.9906],
  "Bridgeport, CT":[41.1865,-73.1952], "Brooklyn, NY":[40.6782,-73.9442],
  "Celebration, FL":[28.3253,-81.5331], "Charleston, SC":[32.7765,-79.9311],
  "Charlotte, NC":[35.2271,-80.8431], "Cincinnati, OH":[39.1031,-84.5120],
  "Columbus, OH":[39.9612,-82.9988], "Cranford, NJ":[40.6584,-74.2996],
  "Dallas, TX":[32.7767,-96.7970], "Darien, CT":[41.0787,-73.4693],
  "Hartford, CT":[41.7658,-72.6734], "Hayward, CA":[37.6688,-122.0808],
  "Houston, TX":[29.7604,-95.3698], "Indianapolis, IN":[39.7684,-86.1581],
  "Jacksonville, FL":[30.3322,-81.6557], "Jersey City, NJ":[40.7178,-74.0431],
  "Kissimmee, FL":[28.2920,-81.4076], "Lake Mary, FL":[28.7589,-81.3178],
  "Lawrenceville, GA":[33.9562,-83.9879], "Lincoln, RI":[41.9216,-71.4356],
  "Longwood, FL":[28.7031,-81.3384], "Louisville, KY":[38.2527,-85.7585],
  "Mesa, AZ":[33.4152,-111.8315], "Miami, FL":[25.7617,-80.1918],
  "Milwaukee, WI":[43.0389,-87.9065], "New Castle, DE":[39.6621,-75.5663],
  "New Hyde Park, NY":[40.7351,-73.6879], "New Orleans, LA":[29.9511,-90.0715],
  "Newark, NJ":[40.7357,-74.1724], "NYC, NY":[40.7128,-74.0060],
  "Oklahoma City, OK":[35.4676,-97.5164], "Orlando, FL":[28.5383,-81.3792],
  "Philadelphia, PA":[39.9526,-75.1652], "Pittsburgh, PA":[40.4406,-79.9959],
  "Port Orange, FL":[29.1383,-80.9956], "Princeton, NJ":[40.3573,-74.6672],
  "Queens, NY":[40.7282,-73.7949], "Raleigh, NC":[35.7796,-78.6382],
  "Robbinsville, NJ":[40.2146,-74.6193], "Rochester, NY":[43.1566,-77.6088],
  "San Antonio, TX":[29.4241,-98.4936], "Sioux Falls, SD":[43.5460,-96.7313],
  "St. Cloud, FL":[28.2489,-81.2812], "Stamford, CT":[41.0534,-73.5387],
  "Tampa, FL":[27.9506,-82.4572], "The Villages, FL":[28.9270,-82.0038],
  "Toronto, Canada":[43.6532,-79.3832], "Trinity, FL":[28.1808,-82.6818],
  "Wallingford, CT":[41.4570,-72.8232], "Washington, DC":[38.9072,-77.0369],
  "Wilmington, DE":[39.7391,-75.5398], "Winter Garden, FL":[28.5653,-81.5862]
};

const ORIGIN_AIRPORT = {
  code: "MCO",
  city: "Orlando",
  state: "FL",
  lat: 28.4312,
  lon: -81.3081
};

const DESTINATION_AIRPORTS = {
  "Atlanta, GA": { code: "ATL", lat: 33.6407, lon: -84.4277 },
  "Baltimore, MD": { code: "BWI", lat: 39.1774, lon: -76.6684 },
  "Birmingham, AL": { code: "BHM", lat: 33.5629, lon: -86.7535 },
  "Bridgeport, CT": { code: "BDL", lat: 41.9389, lon: -72.6832 },
  "Brooklyn, NY": { code: "JFK", lat: 40.6413, lon: -73.7781 },
  "Charleston, SC": { code: "CHS", lat: 32.8986, lon: -80.0405 },
  "Charlotte, NC": { code: "CLT", lat: 35.2144, lon: -80.9473 },
  "Cincinnati, OH": { code: "CVG", lat: 39.0488, lon: -84.6678 },
  "Columbus, OH": { code: "CMH", lat: 39.9980, lon: -82.8919 },
  "Cranford, NJ": { code: "EWR", lat: 40.6895, lon: -74.1745 },
  "Dallas, TX": { code: "DFW", lat: 32.8998, lon: -97.0403 },
  "Darien, CT": { code: "LGA", lat: 40.7769, lon: -73.8740 },
  "Hartford, CT": { code: "BDL", lat: 41.9389, lon: -72.6832 },
  "Hayward, CA": { code: "SFO", lat: 37.6213, lon: -122.3790 },
  "Houston, TX": { code: "IAH", lat: 29.9902, lon: -95.3368 },
  "Indianapolis, IN": { code: "IND", lat: 39.7169, lon: -86.2956 },
  "Jacksonville, FL": { code: "JAX", lat: 30.4941, lon: -81.6879 },
  "Jersey City, NJ": { code: "EWR", lat: 40.6895, lon: -74.1745 },
  "Louisville, KY": { code: "SDF", lat: 38.1744, lon: -85.7360 },
  "Milwaukee, WI": { code: "MKE", lat: 42.9472, lon: -87.8966 },
  "New Castle, DE": { code: "PHL", lat: 39.8744, lon: -75.2424 },
  "New Hyde Park, NY": { code: "LGA", lat: 40.7769, lon: -73.8740 },
  "New Orleans, LA": { code: "MSY", lat: 29.9934, lon: -90.2580 },
  "Newark, NJ": { code: "EWR", lat: 40.6895, lon: -74.1745 },
  "NYC, NY": { code: "LGA", lat: 40.7769, lon: -73.8740 },
  "Oklahoma City, OK": { code: "OKC", lat: 35.3931, lon: -97.6007 },
  "Philadelphia, PA": { code: "PHL", lat: 39.8744, lon: -75.2424 },
  "Pittsburgh, PA": { code: "PIT", lat: 40.4915, lon: -80.2329 },
  "Princeton, NJ": { code: "EWR", lat: 40.6895, lon: -74.1745 },
  "Queens, NY": { code: "LGA", lat: 40.7769, lon: -73.8740 },
  "Raleigh, NC": { code: "RDU", lat: 35.8801, lon: -78.7880 },
  "Rochester, NY": { code: "ROC", lat: 43.1189, lon: -77.6724 },
  "San Antonio, TX": { code: "SAT", lat: 29.5337, lon: -98.4698 },
  "Sioux Falls, SD": { code: "FSD", lat: 43.5820, lon: -96.7419 },
  "Stamford, CT": { code: "LGA", lat: 40.7769, lon: -73.8740 },
  "Tampa, FL": { code: "TPA", lat: 27.9755, lon: -82.5332 },
  "Toronto, Canada": { code: "YYZ", lat: 43.6777, lon: -79.6248 },
  "Wallingford, CT": { code: "BDL", lat: 41.9389, lon: -72.6832 },
  "Washington, DC": { code: "DCA", lat: 38.8512, lon: -77.0402 },
  "Wilmington, DE": { code: "PHL", lat: 39.8744, lon: -75.2424 }
};

const DEFAULT_EARNINGS_SETTINGS = {
  hourlyRate: 15,
  netRatio: 187 / 202.5,
  airportReportBufferHours: 2,
  arrivalAirportBufferHours: 0.5,
  averageFlightSpeedMph: 500,
  flightTaxiBufferHours: 0.5,
  travelUncertaintyHours: 0.75,
  defaultLocalEventHours: [3, 5],
  defaultSetupHours: [3, 4],
  defaultEventHours: [4, 6],
  defaultLargeEventHours: [8, 10]
};

let activeTabId = null;
let rawEvents = [];
let rawMyEvents = [];
let rawPendingEvents = [];
let rawMyShifts = [];
let localState = null;
let localStateLoaded = false;
let localStore = null;
let localStoreLoaded = false;
let projects = [];
let filteredProjects = [];
let baseFilteredProjects = [];
let selectedState = null;
let selectedCityKey = null;
let geoMapZoom = 4;
let geoMapCenterLat = 38.5;
let geoMapCenterLon = -96.5;
let isDraggingMap = false;
let mapDragStart = null;
let mapGlobalEventsWired = false;
let activeEstimateTooltip = null;
let activeEstimateTooltipAnchor = null;

const filters = {
  application: null, // null | open | closed
  myStatus: null,    // null | unapplied | applied | confirm | confirmed
  location: null,    // null | florida | outOfState | warehouse
  flag: null,        // null | new | reopened | starred | closingSoon | promoted
  weekday: "",
  weekdayType: "anyProjectDay",
  dateStart: "",
  dateEnd: "",
  dateMode: "include", // include | exclude
  duration: "",        // "" | oneDay | multiDay
  search: "",
  countMode: "projects"
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function setSyncStatus(text, type = "muted") {
  const el = $("#syncStatus");
  el.textContent = text;
  el.className = "pill muted-pill";
  if (type === "ok") el.className = "pill open-pill";
  if (type === "error") el.className = "pill closed-pill";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanDescriptionText(text) {
  const labelPattern = "(?:Travel\\s*(?:/|&|and)?\\s*Load\\s*in|Travel\\s*in|Travel|Fly\\s*in|Load\\s*in\\s*/?\\s*Setup|Load\\s*in|Setup\\s*Day|Setup|Event\\s*Day\\s*\\d*|EVENT|Return\\s*Travel|Return\\s*Day|Return)";
  const labelRegex = new RegExp(`([a-z0-9)\\]])(?=\\s*${labelPattern}\\b)`, "gi");

  return String(text || "")
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "\n")
    .replace(labelRegex, "$1\n")
    .replace(/\bReturn\n\s*Travel\b/gi, "Return Travel")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{2,}/g, "\n")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

function htmlToText(html) {
  const div = document.createElement("div");
  const htmlWithBreaks = String(html || "")
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\s*\/p\s*>\s*<\s*p[^>]*>/gi, "\n")
    .replace(/<\s*\/p\s*>/gi, "\n")
    .replace(/<\s*p[^>]*>/gi, "");
  div.innerHTML = htmlWithBreaks;
  return cleanDescriptionText(div.textContent);
}

function descriptionHtml(text, maxLength = null) {
  let value = cleanDescriptionText(text || "");
  if (maxLength && value.length > maxLength) {
    value = `${value.slice(0, maxLength).trimEnd()}...`;
  }
  return escapeHtml(value || "No description.").replace(/\n/g, "<br>");
}

function numberOrZero(value) {
  const n = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

const LOCAL_DATA_KEY = "usHungerRosterfyTracker";
const LEGACY_LOCAL_STATE_KEY = "usHungerRosterfyTrackerState";
const LEGACY_LOCAL_SNAPSHOT_KEY = "usHungerRosterfyTrackerSnapshot";
const DEFAULT_LOCAL_SETTINGS = {
  newBadgeDays: 7,
  reopenedBadgeDays: 14,
  closingSoonDays: 14,
  earnings: { ...DEFAULT_EARNINGS_SETTINGS }
};

function chromeStorageGet(keys) {
  return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
}

function chromeStorageSet(items) {
  return new Promise((resolve) => chrome.storage.local.set(items, resolve));
}

function chromeStorageRemove(keys) {
  return new Promise((resolve) => chrome.storage.local.remove(keys, resolve));
}

function makeDefaultLocalState() {
  return {
    initialized: false,
    projectHistory: {},
    starredProjects: {},
    settings: { ...DEFAULT_LOCAL_SETTINGS }
  };
}

function normalizeLocalState(saved = {}) {
  return {
    ...makeDefaultLocalState(),
    ...saved,
    projectHistory: saved.projectHistory || {},
    starredProjects: saved.starredProjects || {},
    settings: { ...DEFAULT_LOCAL_SETTINGS, ...(saved.settings || {}) }
  };
}

function isUsableSnapshot(snapshot) {
  return Boolean(snapshot && Array.isArray(snapshot.events) && snapshot.events.length > 0);
}

function normalizeSnapshot(snapshot) {
  if (!isUsableSnapshot(snapshot)) return null;
  return {
    events: snapshot.events || [],
    myEvents: snapshot.myEvents || [],
    pendingEvents: snapshot.pendingEvents || [],
    myShifts: snapshot.myShifts || [],
    syncedAt: snapshot.syncedAt || new Date().toISOString(),
    savedAt: snapshot.savedAt || new Date().toISOString()
  };
}

function makeDefaultLocalStore() {
  return {
    schemaVersion: 1,
    state: makeDefaultLocalState(),
    snapshot: null,
    updatedAt: null
  };
}

async function saveLocalStore() {
  if (!localStore) return;
  localStore.schemaVersion = 1;
  localStore.state = normalizeLocalState(localState || localStore.state || {});
  localStore.snapshot = normalizeSnapshot(localStore.snapshot);
  localStore.updatedAt = new Date().toISOString();
  await chromeStorageSet({
    [LOCAL_DATA_KEY]: {
      schemaVersion: localStore.schemaVersion,
      state: localStore.state,
      snapshot: localStore.snapshot,
      updatedAt: localStore.updatedAt
    }
  });
  await chromeStorageRemove([LEGACY_LOCAL_STATE_KEY, LEGACY_LOCAL_SNAPSHOT_KEY]);
}

async function loadLocalStore() {
  if (localStoreLoaded && localStore) return localStore;

  const result = await chromeStorageGet([
    LOCAL_DATA_KEY,
    LEGACY_LOCAL_STATE_KEY,
    LEGACY_LOCAL_SNAPSHOT_KEY
  ]);

  const savedStore = result?.[LOCAL_DATA_KEY];
  if (savedStore) {
    localStore = {
      ...makeDefaultLocalStore(),
      ...savedStore,
      state: normalizeLocalState(savedStore.state || {}),
      snapshot: normalizeSnapshot(savedStore.snapshot)
    };
  } else {
    localStore = {
      ...makeDefaultLocalStore(),
      state: normalizeLocalState(result?.[LEGACY_LOCAL_STATE_KEY] || {}),
      snapshot: normalizeSnapshot(result?.[LEGACY_LOCAL_SNAPSHOT_KEY])
    };
  }

  localState = localStore.state;
  localStoreLoaded = true;
  localStateLoaded = true;

  if (!savedStore || result?.[LEGACY_LOCAL_STATE_KEY] || result?.[LEGACY_LOCAL_SNAPSHOT_KEY]) {
    await saveLocalStore();
  }

  return localStore;
}

async function loadLocalState() {
  if (localStateLoaded && localState) return localState;
  const store = await loadLocalStore();
  localState = store.state;
  return localState;
}

async function saveLocalState() {
  await loadLocalStore();
  localStore.state = normalizeLocalState(localState || {});
  localState = localStore.state;
  await saveLocalStore();
}

async function loadCachedSnapshot() {
  const store = await loadLocalStore();
  return isUsableSnapshot(store.snapshot) ? store.snapshot : null;
}

async function saveCachedSnapshot(snapshot) {
  const nextSnapshot = normalizeSnapshot({
    ...(snapshot || {}),
    savedAt: new Date().toISOString()
  });
  if (!nextSnapshot) return;
  await loadLocalStore();
  localStore.snapshot = nextSnapshot;
  await saveLocalStore();
}

async function loadDashboardFromCache(snapshot) {
  rawEvents = snapshot.events || [];
  rawMyEvents = snapshot.myEvents || [];
  rawPendingEvents = snapshot.pendingEvents || [];
  rawMyShifts = snapshot.myShifts || [];
  projects = mergeAndNormalize(rawEvents, rawMyEvents, rawPendingEvents, rawMyShifts);
  await refreshLocalFlagsOnly();
  selectedState = null;
  selectedCityKey = null;
  const stamp = snapshot.syncedAt || snapshot.savedAt;
  setSyncStatus(stamp ? `Loaded local snapshot from ${new Date(stamp).toLocaleString()}` : "Loaded local snapshot", "ok");
  applyFilters();
}

function parseRosterfyDate(value) {
  if (!value) return null;
  const raw = String(value).trim();
  const cleaned = raw
    .replace(/\u202f/g, " ")
    .replace(/\.(\d{3})\d+Z$/, ".$1Z")
    .replace(/\.(\d{3})\d+$/, ".$1");
  const date = new Date(cleaned);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatStoredDateTime(value) {
  const date = parseRosterfyDate(value);
  return date ? date.toLocaleString() : "";
}

function isWithinDays(isoValue, days) {
  const date = parseRosterfyDate(isoValue);
  if (!date) return false;
  const ageMs = Date.now() - date.getTime();
  return ageMs >= 0 && ageMs <= days * 24 * 60 * 60 * 1000;
}

function inputDateToBoundary(value, isEnd = false) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  if (isEnd) date.setHours(23, 59, 59, 999);
  return date;
}

function projectOverlapsInputRange(project) {
  const startBoundary = inputDateToBoundary(filters.dateStart, false);
  const endBoundary = inputDateToBoundary(filters.dateEnd, true);
  if (!startBoundary && !endBoundary) return true;

  const projectStart = parseRosterfyDate(project.startTimestamp) || parseRosterfyDate(project.startDate);
  const projectEnd = parseRosterfyDate(project.endTimestamp) || parseRosterfyDate(project.endDate) || projectStart;
  if (!projectStart && !projectEnd) return false;

  const start = projectStart || projectEnd;
  const end = projectEnd || projectStart;
  if (startBoundary && end < startBoundary) return false;
  if (endBoundary && start > endBoundary) return false;
  return true;
}

function isOneDayProject(startLabel, endLabel, startIso, endIso) {
  if (startLabel && endLabel) return startLabel === endLabel;
  const start = parseRosterfyDate(startIso);
  const end = parseRosterfyDate(endIso);
  if (!start || !end) return false;
  return start.toDateString() === end.toDateString();
}

function getClosingSoonInfo(project) {
  const closeDate = parseRosterfyDate(project.appsCloseTimestamp);
  if (!closeDate || project.applicationStatus !== "open") {
    return { isClosingSoon: false, label: "", msUntilClose: null };
  }

  const msUntilClose = closeDate.getTime() - Date.now();
  const daysWindow = localState?.settings?.closingSoonDays ?? DEFAULT_LOCAL_SETTINGS.closingSoonDays;
  const isClosingSoon = msUntilClose > 0 && msUntilClose <= daysWindow * 24 * 60 * 60 * 1000;
  let label = "";

  if (msUntilClose > 0) {
    const minutes = Math.ceil(msUntilClose / 60000);
    if (minutes < 60) label = `Closes in ${minutes}m`;
    else if (minutes < 24 * 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      label = mins ? `Closes in ${hours}h ${mins}m` : `Closes in ${hours}h`;
    } else {
      label = `Closes in ${Math.ceil(minutes / (24 * 60))}d`;
    }
  }

  return { isClosingSoon, label, msUntilClose };
}

async function applyLocalHistoryAndFlags(normalizedProjects) {
  const state = await loadLocalState();
  const nowIso = new Date().toISOString();
  const wasInitialized = state.initialized === true;

  const updatedProjects = normalizedProjects.map(project => {
    const id = String(project.id);
    const existing = state.projectHistory[id];
    const starredEntry = state.starredProjects[id];
    let reopenedAt = existing?.reopenedAt || "";
    let reopenedCount = Number(existing?.reopenedCount || 0);

    if (wasInitialized && existing?.lastApplicationStatus === "closed" && project.applicationStatus === "open") {
      reopenedAt = nowIso;
      reopenedCount += 1;
    }

    const firstSeenAt = existing?.firstSeenAt || nowIso;
    state.projectHistory[id] = {
      ...(existing || {}),
      firstSeenAt,
      lastSeenAt: nowIso,
      lastApplicationStatus: project.applicationStatus,
      reopenedAt,
      reopenedCount,
      lastName: project.name,
      lastStartTimestamp: project.startTimestamp,
      lastUpdatedAt: project.updatedAt,
      lastAppsCloseTimestamp: project.appsCloseTimestamp
    };

    const closing = getClosingSoonInfo(project);
    const isNew = wasInitialized && isWithinDays(firstSeenAt, state.settings.newBadgeDays);
    const isReopened = project.applicationStatus === "open" && Boolean(reopenedAt) && isWithinDays(reopenedAt, state.settings.reopenedBadgeDays);

    return {
      ...project,
      firstSeenAt,
      firstSeenLabel: formatStoredDateTime(firstSeenAt),
      isNew,
      reopenedAt,
      reopenedLabel: formatStoredDateTime(reopenedAt),
      reopenedCount,
      isReopened,
      isStarred: Boolean(starredEntry),
      starredAt: starredEntry?.starredAt || "",
      starredLabel: formatStoredDateTime(starredEntry?.starredAt || ""),
      isClosingSoon: closing.isClosingSoon,
      closingSoonLabel: closing.label,
      msUntilClose: closing.msUntilClose
    };
  });

  state.initialized = true;
  await saveLocalState();
  return updatedProjects;
}

async function refreshLocalFlagsOnly() {
  const state = await loadLocalState();
  projects = projects.map(project => {
    const id = String(project.id);
    const history = state.projectHistory[id] || {};
    const starredEntry = state.starredProjects[id];
    const closing = getClosingSoonInfo(project);
    return {
      ...project,
      isNew: Boolean(history.firstSeenAt) && isWithinDays(history.firstSeenAt, state.settings.newBadgeDays),
      firstSeenAt: history.firstSeenAt || project.firstSeenAt || "",
      firstSeenLabel: formatStoredDateTime(history.firstSeenAt || project.firstSeenAt || ""),
      isReopened: project.applicationStatus === "open" && Boolean(history.reopenedAt) && isWithinDays(history.reopenedAt, state.settings.reopenedBadgeDays),
      reopenedAt: history.reopenedAt || "",
      reopenedLabel: formatStoredDateTime(history.reopenedAt || ""),
      reopenedCount: Number(history.reopenedCount || 0),
      isStarred: Boolean(starredEntry),
      starredAt: starredEntry?.starredAt || "",
      starredLabel: formatStoredDateTime(starredEntry?.starredAt || ""),
      isClosingSoon: closing.isClosingSoon,
      closingSoonLabel: closing.label,
      msUntilClose: closing.msUntilClose
    };
  });
}

async function toggleProjectStar(projectId) {
  const state = await loadLocalState();
  const id = String(projectId);
  if (state.starredProjects[id]) {
    delete state.starredProjects[id];
  } else {
    state.starredProjects[id] = { starredAt: new Date().toISOString() };
  }
  await saveLocalState();
  await refreshLocalFlagsOnly();
  applyFilters();
}

async function clearLocalHistory() {
  const ok = window.confirm("Clear local New/Reopened/Starred history? This will not change anything on Rosterfy.");
  if (!ok) return;
  localState = makeDefaultLocalState();
  localState.initialized = true;
  localStateLoaded = true;
  await saveLocalState();
  await refreshLocalFlagsOnly();
  applyFilters();
  setSyncStatus("Local history cleared", "ok");
}

function tidyCity(value) {
  return String(value || "")
    .replace(/\b(DOS|Day of Service|JPMC|PMC|Giving Tuesday|Jet Pack Program|Fountain Square)\b/ig, "")
    .replace(/^[\s:;\-]+|[\s:;\-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function findKnownCity(text) {
  const normalized = String(text || "").toLowerCase();
  const candidates = [...KNOWN_CITY_STATES.keys()].sort((a, b) => b.length - a.length);
  for (const cityName of candidates) {
    const escaped = cityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|[^a-z])${escaped.toLowerCase()}([^a-z]|$)`, "i");
    if (re.test(normalized)) {
      return { city: cityName, state: KNOWN_CITY_STATES.get(cityName) };
    }
  }
  return null;
}

function findNamedState(text) {
  const title = String(text || "");
  const stateNames = [...STATE_NAME_TO_ABBR.keys()].sort((a, b) => b.length - a.length);
  for (const stateName of stateNames) {
    const escaped = stateName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|[^A-Za-z])${escaped}([^A-Za-z]|$)`, "i");
    if (re.test(title)) {
      return STATE_NAME_TO_ABBR.get(stateName);
    }
  }
  return "";
}

function displayStateLabel(state) {
  return !state || state === "Unknown" || state === "N/A" ? "N/A" : state;
}

function stateSortIndex(state) {
  const label = displayStateLabel(state);
  const index = STATE_ORDER.indexOf(label);
  return index === -1 ? STATE_ORDER.length - 1 : index;
}

function parseLocationFromName(name, descriptionText) {
  const title = String(name || "");
  const text = `${title} ${descriptionText || ""}`;
  const hasWarehouse = /\bUSH\s+Warehouse\b/i.test(text) || /\bUS\s*Hunger\s+Warehouse\b/i.test(text);
  const parts = title.split(";").map(x => x.trim()).filter(Boolean);
  const company = parts[0] || "Unknown";

  let city = "";
  let state = "";
  let locationConfidence = "unknown";

  // Pattern anywhere in title: "City, ST" after semicolon, colon, or in normal text.
  // Covers: "9/11 DOS:Philadelphia, PA; ...", "9/11 Orlando, FL; ...", "Company; Darien, CT; ..."
  const commaCityState = title.match(/(?:^|[:;\-]\s*|\s)([A-Za-z][A-Za-z .'/&-]*?),\s*([A-Z]{2})(?=\b|\s|\)|;)/);
  if (commaCityState && STATE_SET.has(commaCityState[2])) {
    city = tidyCity(commaCityState[1]);
    state = commaCityState[2];
    locationConfidence = "title_city_state";

    // Rosterfy titles sometimes use "Toronto, CA" to mean Canada, not California.
    if (/^Toronto$/i.test(city) && state === "CA") {
      state = "Canada";
      locationConfidence = "title_city_country";
    }
  }

  // Pattern in semicolon parts: "Tampa FL 20K", "Wilmington DE 30K", "NJ 40K".
  if (!state) {
    for (const part of parts.slice(1)) {
      let m = part.match(/^(.+?)\s+([A-Z]{2})(?=\b|\s*\d|$|\)|;)/);
      if (m && STATE_SET.has(m[2])) {
        city = tidyCity(m[1]);
        state = m[2];
        locationConfidence = city ? "title_city_state" : "title_state_only";
        break;
      }

      m = part.match(/\b([A-Z]{2})\b(?=\s*\d|$|\)|;)/);
      if (m && STATE_SET.has(m[1])) {
        state = m[1];
        city = tidyCity(part.replace(/\b[A-Z]{2}\b.*$/, ""));
        locationConfidence = city ? "title_city_state" : "title_state_only";
        break;
      }
    }
  }

  // Pattern without comma/semicolon: "9/11 Day of Service Hartford CT 2026".
  if (!state) {
    const noComma = title.match(/(?:DOS:|Day of Service\s+|9\/11\s+)([A-Za-z][A-Za-z .'-]*?)\s+([A-Z]{2})(?=\b|\s+\d)/i);
    if (noComma && STATE_SET.has(noComma[2])) {
      city = tidyCity(noComma[1]);
      state = noComma[2];
      locationConfidence = "title_city_state";
    }
  }

  if (!state) {
    const namedState = findNamedState(title);
    if (namedState) {
      state = namedState;
      locationConfidence = "title_state_name";
    }
  }

  if (!state && /\bNYC\b/i.test(title)) {
    city = "NYC";
    state = "NY";
    locationConfidence = "title_city_alias";
  }

  // Known-city fallback for titles such as "JPMC - Houston - 2026" or state-only titles
  // like "JPMC - Lake Mary 600; FL 26,665 RLJ".
  if (!state || city === "Unknown city" || !city) {
    const known = findKnownCity(title);
    if (known && (!state || state === known.state)) {
      city = known.city;
      state = known.state;
      locationConfidence = locationConfidence === "unknown" ? "title_city_lookup" : `${locationConfidence}_city_lookup`;
    }
  }

  if (hasWarehouse && !state) {
    city = "Longwood";
    state = "FL";
    locationConfidence = "warehouse_fallback";
  }

  if (hasWarehouse && state === "FL" && (!city || city === "Unknown city")) {
    city = "Longwood";
    locationConfidence = "warehouse_fallback";
  }

  return {
    company,
    city: city || (state ? "Unknown city" : "N/A"),
    state: state || "N/A",
    isWarehouse: hasWarehouse,
    address: hasWarehouse ? WAREHOUSE_ADDRESS : "",
    locationConfidence
  };
}

function normalizeDayToken(value) {
  const token = String(value || "").toLowerCase().replace(/\./g, "");
  const map = {
    mon: "Monday", monday: "Monday",
    tue: "Tuesday", tues: "Tuesday", tuesday: "Tuesday",
    wed: "Wednesday", weds: "Wednesday", wednesday: "Wednesday",
    thu: "Thursday", thur: "Thursday", thurs: "Thursday", thursday: "Thursday",
    fri: "Friday", friday: "Friday",
    sat: "Saturday", saturday: "Saturday",
    sun: "Sunday", sunday: "Sunday"
  };
  return map[token] || "";
}

function extractDayAfterLabel(text, labelRegexes) {
  const normalized = String(text || "").replace(/\s+/g, " ");
  for (const labelRegex of labelRegexes) {
    const match = normalized.match(labelRegex);
    if (match) {
      const after = normalized.slice(match.index, match.index + 120);
      const day = after.match(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tues|Tue|Wed|Weds|Thurs|Thur|Thu|Fri|Sat|Sun)\.?\b/i);
      if (day) return normalizeDayToken(day[1]);
    }
  }
  return "";
}

function parseOperationalDays(descriptionText) {
  const travelDay = extractDayAfterLabel(descriptionText, [
    /Travel\s*(?:\/|&|and)?\s*Load\s*in\s*:?/i,
    /Fly\s*in\s*(?:\/|&|and)?\s*Load\s*in\s*:?/i,
    /Travel\s*in\s*:?/i,
    /Fly\s*in\s*:?/i,
    /(?:^|[^A-Za-z])Travel\s*:?/i,
    /Load\s*in\s*(?:\/|&|and)?\s*Setup\s*:?/i,
    /Load\s*in\s*:?/i,
    /Setup\s*:?/i
  ]);

  const eventDay = extractDayAfterLabel(descriptionText, [
    /Event\s*Day\s*:?/i,
    /\bEVENT\s*:?/i
  ]);

  const returnDay = extractDayAfterLabel(descriptionText, [
    /Return\s*Travel\s*:?/i,
    /Return\s*Day\s*:?/i,
    /Return\s*:?/i
  ]);

  return { travelDay, eventDay, returnDay };
}


function titleCaseDayDate(value) {
  return String(value || "")
    .replace(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Tues|Wed|Weds|Thu|Thur|Thurs|Fri|Sat|Sun)\b/gi, match => {
      const normalized = normalizeDayToken(match);
      return normalized || match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
    })
    .replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\b/gi, match => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase())
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeScheduleLabel(label) {
  return String(label || "")
    .replace(/\s+/g, " ")
    .replace(/\s*:\s*$/g, "")
    .replace(/\bEVENT\b/g, "Event")
    .replace(/\bFRIDAY\b/g, "Friday")
    .trim();
}

function scheduleKindFromLabel(label) {
  const value = String(label || "").toLowerCase();
  const hasReturn = /return/.test(value);
  const hasTravel = /travel|fly/.test(value);
  const hasSetup = /setup|load\s*in|load-in/.test(value);
  const hasEvent = /event/.test(value);
  if (hasReturn && hasEvent) return "eventReturn";
  if (hasReturn) return "return";
  if (hasTravel && hasSetup) return "travelSetup";
  if (hasSetup && hasEvent) return "setupEvent";
  if (hasTravel) return "travel";
  if (hasSetup) return "setup";
  if (hasEvent) return "event";
  return "project";
}

function parseScheduleItems(descriptionText) {
  const lines = cleanDescriptionText(descriptionText || "").split("\n").map(line => line.trim()).filter(Boolean);
  const items = [];
  const knownLabelPattern = /^(?:Travel\s*\/\s*Load\s*in|Travel\s*&\s*Load\s*in|Travel\s+and\s+Load\s*in|Travel\s*\/\s*Setup|Travel\s*&\s*Setup|Travel\s+and\s+Setup|Travel\s*in|Travel|Fly\s*in|Load\s*in\s*\/\s*Setup|Load\s*in|Setup\s*&\s*Event\s*Day|Setup\s*and\s*Event\s*Day|Setup\s*\/\s*Event\s*Day|Setup\s*Day|Setup|Event\s*Day\s*(?:&|and|\/)\s*Return|Event\s*Day\s*\d*|EVENT|Return\s*Travel|Return\s*Day|Return)\b/i;
  const scheduleDatePattern = /\b(?:(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tues|Tue|Wed|Weds|Thurs|Thur|Thu|Fri|Sat|Sun)\.?\s+\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tues|Tue|Wed|Weds|Thurs|Thur|Thu|Fri|Sat|Sun)\.?)\b/i;

  function makeItem(labelValue, dateValue, rawLine) {
    const label = normalizeScheduleLabel(labelValue);
    const rawDate = titleCaseDayDate(dateValue);
    if (!label || !rawDate || !knownLabelPattern.test(label)) return null;
    const dayNameMatch = rawDate.match(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tues|Tue|Wed|Weds|Thurs|Thur|Thu|Fri|Sat|Sun)\.?\b/i);
    return {
      label,
      dateText: rawDate,
      dayName: dayNameMatch ? normalizeDayToken(dayNameMatch[1]) : "",
      kind: scheduleKindFromLabel(label),
      rawLine
    };
  }

  for (const line of lines) {
    if (/\b\d+\s*(?:leads?|asst\s*leads?|support)\b/i.test(line)) continue;

    let item = null;
    const colonIndex = line.indexOf(":");
    if (colonIndex > -1) {
      const labelPart = line.slice(0, colonIndex).trim();
      const datePart = line.slice(colonIndex + 1).trim();
      const dateMatch = datePart.match(scheduleDatePattern);
      item = makeItem(labelPart, dateMatch ? dateMatch[0] : datePart, line);
    } else {
      const dateMatch = line.match(scheduleDatePattern);
      if (dateMatch) {
        const beforeDate = line.slice(0, dateMatch.index).trim();
        const afterDate = line.slice(dateMatch.index + dateMatch[0].length).trim();
        const labelPart = beforeDate || afterDate;
        item = makeItem(labelPart, dateMatch[0], line);
      }
    }

    if (item) items.push(item);
  }
  return items;
}

function parseCrewNeed(descriptionText) {
  const firstLine = cleanDescriptionText(descriptionText || "").split("\n").find(line => /\b\d+\s*(?:leads?|asst\s*leads?|support)\b/i.test(line)) || "";
  const leadMatch = firstLine.match(/(\d+)\s*leads?\b/i);
  const supportMatch = firstLine.match(/(\d+)\s*support\b/i);
  const asstLeadMatch = firstLine.match(/(\d+)\s*asst\s*leads?\b/i);
  return {
    leadCount: leadMatch ? numberOrZero(leadMatch[1]) : null,
    supportCount: supportMatch ? numberOrZero(supportMatch[1]) : null,
    asstLeadCount: asstLeadMatch ? numberOrZero(asstLeadMatch[1]) : null,
    sourceText: firstLine
  };
}

function getProjectDayCount(project) {
  if (project.scheduleItems?.length) return project.scheduleItems.length;
  if (project.isOneDay) return 1;
  return project.daysInRange?.length || 0;
}

function crewNeedHtml(project) {
  const crew = project.crewNeed || {};
  const lead = crew.leadCount === null || crew.leadCount === undefined ? "—" : formatNumber(crew.leadCount);
  const support = crew.supportCount === null || crew.supportCount === undefined ? "—" : formatNumber(crew.supportCount);
  const asst = crew.asstLeadCount ? `<div><strong>${escapeHtml(formatNumber(crew.asstLeadCount))}</strong> <span>asst</span></div>` : "";
  return `<div class="crew-need"><div><strong>${escapeHtml(lead)}</strong> <span>lead</span></div>${asst}<div><strong>${escapeHtml(support)}</strong> <span>support</span></div></div>`;
}

function scheduleHtml(project) {
  if (project.scheduleItems?.length) {
    return `<div class="schedule-list">${project.scheduleItems.map(item => `<div><strong>${escapeHtml(item.dateText)}</strong>: ${escapeHtml(item.label)}</div>`).join("")}</div>`;
  }
  if (project.startDate || project.endDate) {
    const start = project.startDate || project.startTimestamp || "—";
    const end = project.endDate && project.endDate !== project.startDate ? ` to ${project.endDate}` : "";
    return `<div class="schedule-list muted">${escapeHtml(start)}${escapeHtml(end)}</div>`;
  }
  return `<span class="muted">—</span>`;
}

function getDateRangeWeekdays(startIso, endIso) {
  if (!startIso || !endIso) return [];
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

  const days = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);

  const last = new Date(end);
  last.setHours(0, 0, 0, 0);

  while (cursor <= last) {
    const day = WEEKDAYS[cursor.getDay()];
    if (!days.includes(day)) days.push(day);
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function getShiftStatus(myShift) {
  if (!myShift) {
    return {
      shiftId: "",
      canConfirm: false,
      shiftStatus: "",
      shiftStatusType: "",
      appliedShiftUserId: ""
    };
  }

  const statusObject = myShift.nice?.applied_status?.object || {};
  const statusNice = myShift.nice?.applied_status?.nice || {};
  const statusType = String(statusObject.type || statusNice.type || "").toLowerCase();
  const statusName = statusObject.frontend_name || statusNice.type || "";

  return {
    shiftId: myShift.object?.id || "",
    canConfirm: myShift.permissions?.confirm === true,
    shiftStatus: statusName,
    shiftStatusType: statusType,
    appliedShiftUserId: myShift.nice?.applied_shift_user_id || ""
  };
}

function getMyEventStatus(myEvent, myShift) {
  const shift = getShiftStatus(myShift);
  const pendingByMe = shift.shiftStatusType === "pending" || shift.canConfirm;
  const confirmedByShift = shift.shiftStatusType === "confirmed";

  if (!myEvent && !pendingByMe && !myShift) {
    return {
      appliedByMe: false,
      pendingByMe: false,
      confirmedByMe: false,
      myStatus: "unapplied",
      myApplicationCreatedAt: "",
      myApplicationUpdatedAt: "",
      myShiftAppliedCount: 0,
      myShiftConfirmedCount: 0,
      myShiftDemandCount: 0,
      shiftId: "",
      canConfirm: false,
      shiftStatus: "",
      shiftStatusType: "",
      appliedShiftUserId: ""
    };
  }

  const shiftCount = myEvent?.extras?.shift_count || {};
  const confirmed = numberOrZero(shiftCount.confirmed);
  const applied = numberOrZero(shiftCount.applied);
  const demand = numberOrZero(shiftCount.demand);
  const appliedByMe = Boolean(myEvent) || Boolean(myShift) || applied > 0 || confirmed > 0;
  const confirmedByMe = confirmed > 0 || confirmedByShift;

  return {
    appliedByMe,
    pendingByMe,
    confirmedByMe,
    myStatus: confirmedByMe ? "confirmed" : pendingByMe ? "confirm" : appliedByMe ? "applied" : "unapplied",
    myApplicationCreatedAt: myEvent?.relations?.current_user?.nice?.created_at || myEvent?.relations?.current_user?.object?.created_at || "",
    myApplicationUpdatedAt: myEvent?.relations?.current_user?.nice?.updated_at || myEvent?.relations?.current_user?.object?.updated_at || "",
    myShiftAppliedCount: applied,
    myShiftConfirmedCount: confirmedByShift && confirmed === 0 ? 1 : confirmed,
    myShiftDemandCount: demand,
    shiftId: shift.shiftId,
    canConfirm: shift.canConfirm,
    shiftStatus: shift.shiftStatus,
    shiftStatusType: shift.shiftStatusType,
    appliedShiftUserId: shift.appliedShiftUserId
  };
}

function normalizeProject(event, myEvent, promotedEvent, myShift) {
  const obj = event.object || {};
  const nice = event.nice || {};
  const relations = event.relations || {};
  const permissions = event.permissions || {};

  const name = obj.name || nice.name || "Untitled project";
  const descriptionText = htmlToText(obj.description || "");
  const location = parseLocationFromName(name, descriptionText);
  const operationalDays = parseOperationalDays(descriptionText);
  const scheduleItems = parseScheduleItems(descriptionText);
  const crewNeed = parseCrewNeed(descriptionText);
  const my = getMyEventStatus(myEvent, myShift);
  const applicationStatus = permissions.apply === true ? "open" : "closed";
  const daysInRange = getDateRangeWeekdays(obj.start_timestamp, obj.end_timestamp);
  const oneDayProject = isOneDayProject(nice.start_timestamp__date || "", nice.end_timestamp__date || "", obj.start_timestamp || "", obj.end_timestamp || "");

  return {
    id: obj.id,
    token: obj.token || "",
    name,
    company: location.company,
    city: location.city,
    state: location.state,
    isWarehouse: location.isWarehouse,
    address: location.address,
    locationConfidence: location.locationConfidence,

    description: descriptionText,
    scheduleItems,
    crewNeed,
    startTimestamp: obj.start_timestamp || "",
    endTimestamp: obj.end_timestamp || "",
    startDate: nice.start_timestamp__date || "",
    startDay: nice.start_timestamp__dayofweek || "",
    endDate: nice.end_timestamp__date || "",
    endDay: nice.end_timestamp__dayofweek || "",
    timezone: obj.timezone || "",

    travelDay: operationalDays.travelDay,
    eventDay: operationalDays.eventDay,
    returnDay: operationalDays.returnDay,
    daysInRange,
    isOneDay: oneDayProject,
    durationKind: oneDayProject ? "oneDay" : "multiDay",

    applicationStatus,
    applicationsOpen: applicationStatus === "open",
    applyMessage: nice.apply?.message || (applicationStatus === "open" ? "Open" : "Closed / unavailable"),

    appliedByMe: my.appliedByMe,
    pendingByMe: my.pendingByMe,
    confirmedByMe: my.confirmedByMe,
    shiftId: my.shiftId,
    canConfirm: my.canConfirm,
    shiftStatus: my.shiftStatus,
    shiftStatusType: my.shiftStatusType,
    appliedShiftUserId: my.appliedShiftUserId,
    myStatus: my.myStatus,
    myApplicationCreatedAt: my.myApplicationCreatedAt,
    myApplicationUpdatedAt: my.myApplicationUpdatedAt,
    myShiftAppliedCount: my.myShiftAppliedCount,
    myShiftConfirmedCount: my.myShiftConfirmedCount,
    myShiftDemandCount: my.myShiftDemandCount,

    mealCount: numberOrZero(obj.custom_meal_count || nice.custom_meal_count),
    mealType: nice["custom_meal_type:value"] || nice.custom_meal_type || "",
    numberOfLines: numberOrZero(obj.number_of_assembly_lines),
    hpFormNumber: obj.custom_hp_form_number || "",
    shiftsCount: numberOrZero(relations.shifts_count),
    promoted: obj.promoted === 1 || nice.promoted === "Yes" || Boolean(promotedEvent),
    isCancelled: obj.is_cancelled === 1,
    isArchived: obj.is_archived === 1,
    isVirtual: obj.is_virtual === 1 || nice.is_virtual === "Yes",
    bannerImage: obj.banner_image || nice.grid_list_image || "",
    appsClose: nice.apps_close_timestamp || "",
    appsCloseTimestamp: obj.apps_close_timestamp || "",
    createdAt: nice.created_at || obj.created_at || "",
    updatedAt: nice.updated_at || obj.updated_at || "",
    approvalStatus: nice.approval_status || "",
    publishStatus: nice.status || "",
    rawEvent: event,

    rosterfyViewUrl: `${ROSTERFY_ORIGIN}/portal/event/${obj.id}/view`,
    rosterfyShiftsUrl: `${ROSTERFY_ORIGIN}/portal/event/${obj.id}/shifts`,
    rosterfyUrl: `${ROSTERFY_ORIGIN}/portal/event/${obj.id}/view`
  };
}


function getEarningsSettings() {
  return {
    ...DEFAULT_EARNINGS_SETTINGS,
    ...(localState?.settings?.earnings || {})
  };
}

function clampNumber(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function roundToQuarterHour(value) {
  return Math.round(Number(value || 0) * 4) / 4;
}

function formatHoursRange(low, high) {
  const clean = value => Number.isInteger(value) ? String(value) : String(value.toFixed(1)).replace(/\.0$/, "");
  return low === high ? `${clean(low)}h` : `${clean(low)}–${clean(high)}h`;
}

function formatMoney(value) {
  const n = Number(value || 0);
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatMoneyRange(low, high) {
  return Math.round(low) === Math.round(high) ? formatMoney(low) : `${formatMoney(low)}–${formatMoney(high)}`;
}

function confidenceRank(confidence) {
  if (confidence === "high") return 3;
  if (confidence === "medium") return 2;
  return 1;
}

function combineConfidence(parts) {
  if (!parts.length) return "low";
  const avg = parts.reduce((sum, part) => sum + confidenceRank(part.confidence), 0) / parts.length;
  if (avg >= 2.5) return "high";
  if (avg >= 1.75) return "medium";
  return "low";
}

function haversineMiles(lat1, lon1, lat2, lon2) {
  const toRad = degrees => degrees * Math.PI / 180;
  const earthMiles = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * earthMiles * Math.asin(Math.min(1, Math.sqrt(a)));
}

function getProjectAirport(project) {
  const state = project.state === "Canada" ? "Canada" : project.state;
  const cityKey = `${project.city}, ${state}`;
  if (DESTINATION_AIRPORTS[cityKey]) return DESTINATION_AIRPORTS[cityKey];
  const coord = getProjectCoordinate(project);
  if (!coord) return null;
  return { code: `${project.state || "??"} area`, lat: coord[0], lon: coord[1], fallback: true };
}

function isOutOfStateTravelProject(project) {
  if (!project.state || project.state === "N/A") return false;
  if (project.isWarehouse) return false;
  if (project.state === "Canada") return true;
  return project.state !== "FL";
}

function hasSetupSignal(project) {
  return /\b(setup|set up|load\s*in|load-in)\b/i.test(`${project.name} ${project.description}`);
}

function hasEventDaySignal(project) {
  return /\b(event\s*day|event:)\b/i.test(`${project.name} ${project.description}`);
}

function isLargeProject(project) {
  return project.mealCount >= 1000000 || project.numberOfLines >= 80 || /\b1\s*MM\b|\b1MM\b/i.test(project.name);
}

function isMediumLargeProject(project) {
  return project.mealCount >= 250000 || project.numberOfLines >= 40;
}

function makeEstimatePart(label, hoursLow, hoursHigh, confidence, reason, settings) {
  const low = roundToQuarterHour(hoursLow);
  const high = Math.max(low, roundToQuarterHour(hoursHigh));
  const grossLow = low * settings.hourlyRate;
  const grossHigh = high * settings.hourlyRate;
  const netLow = grossLow * settings.netRatio;
  const netHigh = grossHigh * settings.netRatio;
  return { label, hoursLow: low, hoursHigh: high, grossLow, grossHigh, netLow, netHigh, confidence, reason };
}


function formatEstimateDateText(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const month = date.toLocaleString("en-US", { month: "short" });
  const dayNum = date.getDate();
  const dayName = WEEKDAYS[date.getDay()];
  return `${month} ${dayNum} ${dayName}`;
}

function getProjectCalendarDates(project) {
  if (!project.startTimestamp || !project.endTimestamp) return [];
  const start = new Date(project.startTimestamp);
  const end = new Date(project.endTimestamp);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);

  const dates = [];
  while (cursor <= last && dates.length < 10) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function buildDateRangeEstimateItems(project, outOfStateTravel) {
  if (project.scheduleItems?.length || project.isOneDay) return [];
  const dates = getProjectCalendarDates(project);
  if (dates.length < 3) return [];

  const items = [];
  const lastIndex = dates.length - 1;
  const middleCount = Math.max(0, dates.length - (outOfStateTravel ? 2 : 0));

  dates.forEach((date, index) => {
    let label = "Event day";
    let kind = "event";

    if (outOfStateTravel && index === 0) {
      label = "Travel/Load in";
      kind = middleCount === 1 ? "travelSetup" : "travel";
    } else if (outOfStateTravel && index === lastIndex) {
      label = "Return Travel";
      kind = "return";
    } else if (outOfStateTravel) {
      const middleIndex = index - 1;
      if (middleCount === 1) {
        label = "Event day";
        kind = "event";
      } else if (middleIndex === 0) {
        label = "Setup day";
        kind = "setup";
      } else if (middleCount === 2) {
        label = "Event day";
        kind = "event";
      } else {
        label = `Event day ${middleIndex}`;
        kind = "event";
      }
    } else if (dates.length === 3) {
      if (index === 0) {
        label = "Setup day";
        kind = "setup";
      } else {
        label = `Event day ${index}`;
        kind = "event";
      }
    } else if (dates.length > 3) {
      if (index === 0) {
        label = "Setup day";
        kind = "setup";
      } else {
        label = `Event day ${index}`;
        kind = "event";
      }
    }

    items.push({
      label,
      dateText: formatEstimateDateText(date),
      dayName: WEEKDAYS[date.getDay()],
      kind,
      inferred: true,
      rawLine: "Estimated from project date range"
    });
  });
  return items;
}

function estimateTravelPart(project, label, settings) {
  const airport = getProjectAirport(project);
  if (!airport) {
    return makeEstimatePart(
      label,
      4,
      8,
      "low",
      "Out-of-state travel, but destination airport could not be matched. Uses a broad paid airport-to-airport travel range.",
      settings
    );
  }

  const miles = haversineMiles(ORIGIN_AIRPORT.lat, ORIGIN_AIRPORT.lon, airport.lat, airport.lon);
  const flightBlock = miles / settings.averageFlightSpeedMph + settings.flightTaxiBufferHours;
  const likely = settings.airportReportBufferHours + flightBlock + settings.arrivalAirportBufferHours;
  const uncertainty = settings.travelUncertaintyHours + (airport.fallback ? 1.0 : 0);
  const low = clampNumber(likely - uncertainty, 3, 14);
  const high = clampNumber(likely + uncertainty, low + 0.5, 16);
  const confidence = airport.fallback ? "low" : "medium";
  const reason = `Paid travel estimate from ${ORIGIN_AIRPORT.code} to ${airport.code}. Includes ${settings.airportReportBufferHours}h airport report/check-in buffer, estimated flight block, and ${settings.arrivalAirportBufferHours}h arrival airport buffer. Does not include home→airport or airport→hotel commute.`;
  return makeEstimatePart(label, low, high, confidence, reason, settings);
}

function hasCombinedSetupEventSignal(project) {
  return /\bsetup\s*(?:&|and|\/)\s*event\s*day\b|\bsetup\s*(?:&|and|\/)\s*event\b/i.test(`${project.name} ${project.description}`);
}

function hasCombinedTravelLoadInSignal(project) {
  return /\btravel\s*(?:\/|&|and)?\s*(?:load\s*in|load-in|setup)\b|\btravel\/load\s*in\b/i.test(`${project.name} ${project.description}`);
}

function combineEstimateParts(label, sourceParts, reason, settings) {
  const totals = sourceParts.reduce((acc, part) => {
    acc.hoursLow += part.hoursLow;
    acc.hoursHigh += part.hoursHigh;
    return acc;
  }, { hoursLow: 0, hoursHigh: 0 });
  return makeEstimatePart(label, totals.hoursLow, totals.hoursHigh, combineConfidence(sourceParts), reason, settings);
}

function makeSetupPart(project, label, settings) {
  return makeEstimatePart(
    label,
    settings.defaultSetupHours[0],
    settings.defaultSetupHours[1],
    project.description ? "medium" : "low",
    "Setup/load-in found in project title or description. Onboarding guidance said setup/teardown days are often around 3–4 hours.",
    settings
  );
}

function getEventEstimateConfig(project, settings, outOfStateTravel, large, mediumLarge) {
  let hours = settings.defaultEventHours;
  let confidence = project.isOneDay && !outOfStateTravel ? "high" : "medium";
  let reason = "Regular event-day estimate.";

  if (large) {
    hours = settings.defaultLargeEventHours;
    confidence = "medium";
    reason = "Large project estimate based on 1MM meal goal or high line count. Onboarding guidance said million meal packs can run 8–10 hours, sometimes longer.";
  } else if (mediumLarge) {
    hours = [6, 8];
    confidence = "medium";
    reason = "Medium/large project estimate based on meal goal or 40+ lines.";
  } else if (project.isWarehouse || project.state === "FL") {
    hours = settings.defaultLocalEventHours;
    reason = "Local/warehouse project estimate. Actual paid time depends on the lead's clock-in/out cues.";
  }

  return { hours, confidence, reason };
}

function estimateProjectEarnings(project) {
  const settings = getEarningsSettings();
  const parts = [];
  const outOfStateTravel = isOutOfStateTravelProject(project);
  const setupSignal = hasSetupSignal(project);
  const eventSignal = hasEventDaySignal(project);
  const setupOnlyTitle = /\bsetup\b/i.test(project.name) && !/\bevent\s*day\b/i.test(project.name);
  const eventOnlyTitle = /\bevent\s*day\b/i.test(project.name) && !/\bsetup\b/i.test(project.name);
  const large = isLargeProject(project);
  const mediumLarge = isMediumLargeProject(project);

  function eventPart(label) {
    const eventConfig = getEventEstimateConfig(project, settings, outOfStateTravel, large, mediumLarge);
    return makeEstimatePart(label, eventConfig.hours[0], eventConfig.hours[1], eventConfig.confidence, eventConfig.reason, settings);
  }

  function setupPart(label) {
    return makeSetupPart(project, label, settings);
  }

  function partFromScheduleItem(item) {
    const kind = item.kind;
    if (kind === "return") return estimateTravelPart(project, item.label, settings);
    if (kind === "eventReturn") {
      return outOfStateTravel
        ? combineEstimateParts(item.label, [eventPart(item.label), estimateTravelPart(project, item.label, settings)], "Event work and return travel on the same calendar day.", settings)
        : eventPart(item.label);
    }
    if (kind === "travel") return estimateTravelPart(project, item.label, settings);
    if (kind === "travelSetup") {
      return combineEstimateParts(item.label, [estimateTravelPart(project, item.label, settings), setupPart(item.label)], "Paid travel plus load-in/setup on the same calendar day.", settings);
    }
    if (kind === "setupEvent") {
      return combineEstimateParts(item.label, [setupPart(item.label), eventPart(item.label)], "Setup/load-in and event work on the same calendar day.", settings);
    }
    if (kind === "setup") return setupPart(item.label);
    if (kind === "event") return eventPart(item.label);
    return eventPart(item.label || "Project day");
  }

  const inferredScheduleItems = buildDateRangeEstimateItems(project, outOfStateTravel);

  if (project.scheduleItems?.length) {
    for (const item of project.scheduleItems) {
      const part = partFromScheduleItem(item);
      part.dateText = item.dateText;
      part.sourceLabel = item.label;
      part.kind = item.kind;
      parts.push(part);
    }
  } else if (inferredScheduleItems.length) {
    for (const item of inferredScheduleItems) {
      const part = partFromScheduleItem(item);
      part.dateText = item.dateText;
      part.sourceLabel = item.label;
      part.kind = item.kind;
      part.inferred = true;
      part.reason = `${part.reason} This day was inferred from the project date range because Rosterfy did not provide a detailed day-by-day schedule.`;
      parts.push(part);
    }
  } else {
    const setupAndEventSameCalendarDay = project.isOneDay && setupSignal && (eventSignal || hasCombinedSetupEventSignal(project));
    const travelAndLoadInSameCalendarDay = outOfStateTravel && setupSignal && hasCombinedTravelLoadInSignal(project);
    let travelToPart = null;

    if (outOfStateTravel) {
      travelToPart = estimateTravelPart(project, "Travel", settings);
      if (!travelAndLoadInSameCalendarDay) parts.push(travelToPart);
    }

    if (setupAndEventSameCalendarDay) {
      parts.push(combineEstimateParts("Setup + event day", [setupPart("Setup"), eventPart("Event day")], "Setup/load-in and event work on the same calendar day.", settings));
    } else if (setupSignal && !eventOnlyTitle) {
      const setup = setupPart(outOfStateTravel ? "Setup day" : "Setup / load-in");
      if (travelAndLoadInSameCalendarDay && travelToPart) {
        parts.push(combineEstimateParts("Travel + load-in", [travelToPart, setup], "Paid travel plus load-in/setup on the same calendar day.", settings));
      } else {
        parts.push(setup);
      }
    }

    const shouldAddEvent = !setupAndEventSameCalendarDay && (!setupOnlyTitle || eventSignal || !setupSignal);
    if (shouldAddEvent) {
      const label = setupOnlyTitle ? "Setup shift" : eventOnlyTitle || eventSignal ? "Event day" : project.isOneDay ? "Project day" : "Event / project day";
      parts.push(eventPart(label));
    }

    if (outOfStateTravel) parts.push(estimateTravelPart(project, "Return Travel", settings));
  }

  if (!parts.length) {
    parts.push(makeEstimatePart("Project day", settings.defaultLocalEventHours[0], settings.defaultLocalEventHours[1], "low", "Fallback estimate because project day details are unclear.", settings));
  }

  const totals = parts.reduce((acc, part) => {
    acc.hoursLow += part.hoursLow;
    acc.hoursHigh += part.hoursHigh;
    acc.grossLow += part.grossLow;
    acc.grossHigh += part.grossHigh;
    acc.netLow += part.netLow;
    acc.netHigh += part.netHigh;
    return acc;
  }, { hoursLow: 0, hoursHigh: 0, grossLow: 0, grossHigh: 0, netLow: 0, netHigh: 0 });

  return {
    parts,
    ...totals,
    confidence: combineConfidence(parts),
    hourlyRate: settings.hourlyRate,
    netRatio: settings.netRatio,
    label: `${formatMoneyRange(totals.netLow, totals.netHigh)} net`,
    grossLabel: `${formatMoneyRange(totals.grossLow, totals.grossHigh)} gross`,
    hoursLabel: formatHoursRange(roundToQuarterHour(totals.hoursLow), roundToQuarterHour(totals.hoursHigh))
  };
}

function confidenceLabel(confidence) {
  if (confidence === "high") return "High";
  if (confidence === "medium") return "Medium";
  return "Low";
}

function confidenceClass(confidence) {
  return `estimate-${confidence || "low"}`;
}

function estimateTooltipHtml(project) {
  const estimate = project.earningsEstimate;
  if (!estimate) return `<div class="estimate-tooltip-body">No estimate available.</div>`;
  const singleDay = estimate.parts.length === 1;
  return `
    <div class="estimate-tooltip-body ${singleDay ? "estimate-tooltip-single" : ""}">
      <div class="estimate-tooltip-header">
        <div>
          <div class="estimate-tooltip-title">Estimated Pay Breakdown</div>
          <div class="muted">Rate ${escapeHtml(formatMoney(estimate.hourlyRate))}/hour · Net ratio ${(estimate.netRatio * 100).toFixed(1)}%</div>
        </div>
        <div class="estimate-tooltip-total ${escapeHtml(confidenceClass(estimate.confidence))}">
          <strong>${escapeHtml(estimate.label)}</strong>
          <span>${escapeHtml(estimate.hoursLabel)}</span>
        </div>
      </div>
      <div class="estimate-tooltip-grid ${singleDay ? "single" : ""}">
        ${estimate.parts.map((part, index) => `
          <div class="estimate-tooltip-part ${singleDay ? "single" : ""}">
            <div class="estimate-tooltip-part-title">${escapeHtml(part.dateText ? `${part.dateText}: ${part.label}` : `Day ${index + 1} — ${part.label}`)}</div>
            <div class="estimate-tooltip-values ${escapeHtml(confidenceClass(part.confidence))}">
              <span>${escapeHtml(formatHoursRange(part.hoursLow, part.hoursHigh))}</span>
              <span>${escapeHtml(formatMoneyRange(part.netLow, part.netHigh))} net</span>
              <span>${escapeHtml(formatMoneyRange(part.grossLow, part.grossHigh))} gross</span>
            </div>
          </div>
        `).join("")}
      </div>
      ${singleDay ? "" : `
        <div class="estimate-tooltip-footer ${escapeHtml(confidenceClass(estimate.confidence))}">
          <strong>Totals:</strong>
          <span>${escapeHtml(estimate.hoursLabel)}</span>
          <span>${escapeHtml(estimate.label)}</span>
          <span>${escapeHtml(estimate.grossLabel)}</span>
        </div>
      `}
    </div>
  `;
}

function estimateCellHtml(project) {
  const estimate = project.earningsEstimate;
  if (!estimate) return `<span class="muted">—</span>`;
  return `
    <button class="estimate-cell ${escapeHtml(confidenceClass(estimate.confidence))}" type="button" data-project-id="${escapeHtml(project.id)}" aria-label="Show estimated pay breakdown">
      <span class="estimate-net">${escapeHtml(estimate.label)}</span>
      <span class="estimate-hours">${escapeHtml(estimate.hoursLabel)}</span>
    </button>
  `;
}

function estimateDetailHtml(project) {
  const estimate = project.earningsEstimate;
  if (!estimate) return "";
  return `
    <section class="estimate-detail">
      <h3>Estimated pay</h3>
      <div class="estimate-total estimate-${escapeHtml(estimate.confidence)}">
        <strong>${escapeHtml(estimate.label)}</strong>
        <span>${escapeHtml(estimate.grossLabel)} · ${escapeHtml(estimate.hoursLabel)}</span>
      </div>
      <div class="estimate-breakdown">
        ${estimate.parts.map((part, index) => `
          <div class="estimate-part">
            <div class="estimate-part-title">${escapeHtml(part.dateText ? `${part.dateText}: ${part.label}` : `Day ${index + 1} — ${part.label}`)}</div>
            <div class="estimate-part-values ${escapeHtml(confidenceClass(part.confidence))}">${escapeHtml(formatHoursRange(part.hoursLow, part.hoursHigh))} · Gross ${escapeHtml(formatMoneyRange(part.grossLow, part.grossHigh))} · Net ${escapeHtml(formatMoneyRange(part.netLow, part.netHigh))}</div>
            <div class="muted">${escapeHtml(part.reason)}</div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function combineEstimateTotals(projectList) {
  const estimates = projectList.map(project => project.earningsEstimate).filter(Boolean);
  const totals = estimates.reduce((acc, estimate) => {
    acc.hoursLow += estimate.hoursLow;
    acc.hoursHigh += estimate.hoursHigh;
    acc.grossLow += estimate.grossLow;
    acc.grossHigh += estimate.grossHigh;
    acc.netLow += estimate.netLow;
    acc.netHigh += estimate.netHigh;
    return acc;
  }, { hoursLow: 0, hoursHigh: 0, grossLow: 0, grossHigh: 0, netLow: 0, netHigh: 0 });
  return {
    ...totals,
    confidence: estimates.length ? combineConfidence(estimates.map(estimate => ({ confidence: estimate.confidence }))) : "low",
    count: estimates.length,
    label: estimates.length ? `${formatMoneyRange(totals.netLow, totals.netHigh)} net` : "$0 net",
    hoursLabel: estimates.length ? formatHoursRange(roundToQuarterHour(totals.hoursLow), roundToQuarterHour(totals.hoursHigh)) : "0h"
  };
}

function mergeAndNormalize(events, myEvents, pendingEvents = [], myShifts = []) {
  const myByEventId = new Map();
  for (const myEvent of myEvents) {
    const eventId = myEvent.object?.id || myEvent.relations?.current_user?.object?.event_id;
    if (eventId) myByEventId.set(eventId, myEvent);
  }

  const promotedByEventId = new Map();
  for (const promotedEvent of pendingEvents) {
    const eventId = promotedEvent.object?.id;
    if (eventId) promotedByEventId.set(eventId, promotedEvent);
  }

  const shiftsByEventId = new Map();
  for (const shift of myShifts) {
    const eventId = shift.object?.event_id;
    if (!eventId) continue;
    const previous = shiftsByEventId.get(eventId);
    // Prefer a shift that can be confirmed, then pending, then any latest known shift.
    const previousScore = previous ? ((previous.permissions?.confirm === true ? 100 : 0) + (String(previous.nice?.applied_status?.object?.type || "").toLowerCase() === "pending" ? 10 : 0)) : -1;
    const nextScore = (shift.permissions?.confirm === true ? 100 : 0) + (String(shift.nice?.applied_status?.object?.type || "").toLowerCase() === "pending" ? 10 : 0);
    if (!previous || nextScore >= previousScore) shiftsByEventId.set(eventId, shift);
  }

  const eventById = new Map();
  for (const event of events) {
    const eventId = event.object?.id;
    if (eventId) eventById.set(eventId, event);
  }
  for (const promotedEvent of pendingEvents) {
    const eventId = promotedEvent.object?.id;
    if (eventId && !eventById.has(eventId)) eventById.set(eventId, promotedEvent);
  }

  return [...eventById.values()]
    .map(event => normalizeProject(
      event,
      myByEventId.get(event.object?.id),
      promotedByEventId.get(event.object?.id),
      shiftsByEventId.get(event.object?.id)
    ))
    .map(project => ({ ...project, earningsEstimate: estimateProjectEarnings(project) }));
}

function myStatusLabel(status) {
  if (status === "confirmed") return "Confirmed";
  if (status === "confirm" || status === "pending") return "Pending";
  if (status === "applied") return "Applied";
  return "unapplied";
}

function canShowApplyAction(project) {
  return project.applicationStatus === "open" && project.myStatus === "unapplied";
}

function statusPill(project) {
  const applicationClass = project.applicationStatus === "open" ? "open-pill" : "closed-pill";
  const myClass = `${project.myStatus}-pill`;
  return `
    <div class="status-stack">
      <span class="status-pill ${applicationClass}">${project.applicationStatus === "open" ? "Open" : "Closed"}</span>
      <span class="status-pill ${myClass}">${myStatusLabel(project.myStatus)}</span>
    </div>
  `;
}

function flagBadgesHtml(project) {
  const badges = [];
  if (project.isNew) badges.push(["New", "new-badge"]);
  if (project.isReopened) badges.push(["Reopened", "reopened-badge"]);
  if (project.isClosingSoon && project.closingSoonLabel) badges.push([project.closingSoonLabel, "closing-badge"]);
  if (project.isStarred) badges.push(["Starred", "starred-badge"]);
  if (project.promoted) badges.push(["Promoted", "promoted-badge"]);
  if (project.isWarehouse) badges.push(["Warehouse", "warehouse-badge"]);
  return badges.map(([label, cls]) => `<span class="flag-badge ${cls}">${escapeHtml(label)}</span>`).join("");
}

function flagsSummary(project) {
  const flags = [];
  if (project.isNew) flags.push("New");
  if (project.isReopened) flags.push("Reopened");
  if (project.isStarred) flags.push("Starred");
  if (project.isClosingSoon && project.closingSoonLabel) flags.push(project.closingSoonLabel);
  if (project.promoted) flags.push("Promoted");
  return flags.join(", ");
}

function getProjectCityKey(project) {
  return project.isWarehouse ? "USH Warehouse / Longwood" : (project.city || "Unknown city");
}

function getProjectCoordinate(project) {
  if (project.isWarehouse) return CITY_COORDS["Longwood, FL"];
  const state = project.state === "Canada" ? "Canada" : project.state;
  const cityKey = `${project.city}, ${state}`;
  if (CITY_COORDS[cityKey]) return CITY_COORDS[cityKey];
  if (STATE_CENTERS[project.state]) return STATE_CENTERS[project.state];
  return null;
}

function aggregateByCityForMap() {
  const map = new Map();
  for (const project of baseFilteredProjects) {
    if (project.state === "N/A") continue;
    const cityKey = getProjectCityKey(project);
    const coord = getProjectCoordinate(project);
    if (!coord) continue;
    const key = `${project.state}|${cityKey}`;
    if (!map.has(key)) {
      map.set(key, { state: project.state, cityKey, projects: [], meals: 0, lines: 0, hasWarehouse: false, coord });
    }
    const bucket = map.get(key);
    bucket.projects.push(project);
    bucket.meals += project.mealCount;
    bucket.lines += project.numberOfLines;
    bucket.hasWarehouse = bucket.hasWarehouse || project.isWarehouse;
  }
  return [...map.values()];
}

function cityBucketLabel(bucket) {
  if (filters.countMode === "meals") return `${formatNumber(bucket.meals)} meals`;
  if (filters.countMode === "lines") return `${formatNumber(bucket.lines)} lines`;
  return `${formatNumber(bucket.projects.length)} projects`;
}

function getProjectValue(project) {
  if (filters.countMode === "meals") return project.mealCount;
  if (filters.countMode === "lines") return project.numberOfLines;
  return 1;
}

function aggregateByStateForMap() {
  const map = new Map();
  for (const project of baseFilteredProjects) {
    if (!project.state || project.state === "N/A") continue;
    if (!map.has(project.state)) {
      map.set(project.state, {
        kind: "state",
        state: project.state,
        cityKey: "",
        projects: [],
        meals: 0,
        lines: 0,
        hasWarehouse: false,
        coord: STATE_CENTERS[project.state] || null
      });
    }
    const bucket = map.get(project.state);
    bucket.projects.push(project);
    bucket.meals += project.mealCount;
    bucket.lines += project.numberOfLines;
    bucket.hasWarehouse = bucket.hasWarehouse || project.isWarehouse;
  }
  return [...map.values()].filter(bucket => bucket.coord);
}

function getMapBucketValue(bucket) {
  if (filters.countMode === "meals") return bucket.meals;
  if (filters.countMode === "lines") return bucket.lines;
  return bucket.projects.length;
}

function mapBucketLabel(bucket) {
  if (filters.countMode === "meals") return `${formatNumber(bucket.meals)} meals`;
  if (filters.countMode === "lines") return `${formatNumber(bucket.lines)} lines`;
  return `${formatNumber(bucket.projects.length)} projects`;
}

function shouldUseStateMapBuckets() {
  return geoMapZoom <= 4;
}

function mapScreenPoint(bucket, width, height) {
  const [lat, lon] = bucket.coord;
  const center = lonLatToWorldPixel(geoMapCenterLat, geoMapCenterLon, geoMapZoom);
  const point = lonLatToWorldPixel(lat, lon, geoMapZoom);
  return {
    x: point.x + width / 2 - center.x,
    y: point.y + height / 2 - center.y
  };
}

function clusterMapBuckets(buckets, width, height) {
  if (shouldUseStateMapBuckets() || geoMapZoom >= 6) return buckets;

  const threshold = geoMapZoom === 5 ? 34 : 44;
  const clusters = [];

  for (const bucket of buckets) {
    // Warehouse should stay pinned as its own marker when zoomed in to city mode.
    if (bucket.hasWarehouse) {
      clusters.push(bucket);
      continue;
    }

    const point = mapScreenPoint(bucket, width, height);
    const existing = clusters.find(cluster => {
      if (cluster.hasWarehouse) return false;
      const cPoint = mapScreenPoint(cluster, width, height);
      return Math.hypot(point.x - cPoint.x, point.y - cPoint.y) < threshold;
    });

    if (!existing) {
      clusters.push({ ...bucket, kind: "city" });
      continue;
    }

    const totalProjects = existing.projects.length + bucket.projects.length;
    existing.kind = "cluster";
    existing.cityKey = existing.cityKey === bucket.cityKey ? existing.cityKey : "Nearby cities";
    existing.projects.push(...bucket.projects);
    existing.meals += bucket.meals;
    existing.lines += bucket.lines;
    existing.hasWarehouse = existing.hasWarehouse || bucket.hasWarehouse;
    existing.coord = [
      ((existing.coord[0] * (totalProjects - bucket.projects.length)) + bucket.coord[0] * bucket.projects.length) / totalProjects,
      ((existing.coord[1] * (totalProjects - bucket.projects.length)) + bucket.coord[1] * bucket.projects.length) / totalProjects
    ];
    const states = new Set(existing.projects.map(project => project.state));
    existing.state = states.size === 1 ? [...states][0] : "";
  }

  return clusters;
}

function resetMapView() {
  geoMapZoom = 4;
  geoMapCenterLat = 38.5;
  geoMapCenterLon = -96.5;
  renderStateSummary();
}

function zoomMap(delta) {
  geoMapZoom = Math.max(3, Math.min(7, geoMapZoom + delta));
  renderStateSummary();
}

function lonLatToWorldPixel(lat, lon, zoom) {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const scale = 256 * 2 ** zoom;
  return {
    x: ((lon + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale
  };
}

function spreadOverlappingMapMarkers(markerItems, width, height) {
  const groups = [];

  for (const item of markerItems) {
    let group = groups.find(candidate => {
      const minDistance = Math.max(38, (candidate.averageSize + item.size) / 2 + 12);
      return Math.hypot(item.x - candidate.x, item.y - candidate.y) < minDistance;
    });

    if (!group) {
      group = { x: item.x, y: item.y, averageSize: item.size, items: [] };
      groups.push(group);
    }

    group.items.push(item);
    group.x = group.items.reduce((sum, m) => sum + m.x, 0) / group.items.length;
    group.y = group.items.reduce((sum, m) => sum + m.y, 0) / group.items.length;
    group.averageSize = group.items.reduce((sum, m) => sum + m.size, 0) / group.items.length;
  }

  for (const group of groups) {
    if (group.items.length <= 1) continue;

    const radius = Math.max(26, Math.min(58, 22 + group.items.length * 5));
    const sorted = group.items.sort((a, b) => {
      if (a.bucket.hasWarehouse !== b.bucket.hasWarehouse) return a.bucket.hasWarehouse ? -1 : 1;
      return String(a.bucket.state || a.bucket.cityKey).localeCompare(String(b.bucket.state || b.bucket.cityKey));
    });

    sorted.forEach((item, index) => {
      const angle = (-Math.PI / 2) + (index * 2 * Math.PI / sorted.length);
      item.x = Math.min(width - 22, Math.max(22, group.x + Math.cos(angle) * radius));
      item.y = Math.min(height - 22, Math.max(22, group.y + Math.sin(angle) * radius));
      item.isOffset = true;
    });
  }

  return markerItems;
}

function renderGeoMap() {
  const mapEl = $("#geoMap");
  if (!mapEl) return;

  const rawBuckets = shouldUseStateMapBuckets()
    ? aggregateByStateForMap()
    : aggregateByCityForMap().map(bucket => ({ ...bucket, kind: "city" }));

  if (!rawBuckets.length) {
    mapEl.className = "geo-map empty-state";
    mapEl.textContent = "No mappable city/state locations match the current filters.";
    return;
  }

  const width = Math.max(mapEl.clientWidth || 620, 320);
  const height = window.matchMedia("(min-width: 1100px)").matches ? 310 : 360;
  const zoom = geoMapZoom;
  const center = lonLatToWorldPixel(geoMapCenterLat, geoMapCenterLon, zoom);
  const leftOffset = width / 2 - center.x;
  const topOffset = height / 2 - center.y;
  const firstTileX = Math.floor((-leftOffset) / 256) - 1;
  const lastTileX = Math.floor((width - leftOffset) / 256) + 1;
  const firstTileY = Math.floor((-topOffset) / 256) - 1;
  const lastTileY = Math.floor((height - topOffset) / 256) + 1;
  const maxTile = 2 ** zoom;
  const tiles = [];

  for (let x = firstTileX; x <= lastTileX; x += 1) {
    for (let y = firstTileY; y <= lastTileY; y += 1) {
      if (y < 0 || y >= maxTile) continue;
      const wrappedX = ((x % maxTile) + maxTile) % maxTile;
      tiles.push(`<img class="geo-tile" src="https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png" alt="" style="left:${Math.round(leftOffset + x * 256)}px;top:${Math.round(topOffset + y * 256)}px">`);
    }
  }

  const buckets = clusterMapBuckets(rawBuckets, width, height);
  const maxValue = Math.max(1, ...buckets.map(getMapBucketValue));
  const markerItems = buckets.map(bucket => {
    const [lat, lon] = bucket.coord;
    const point = lonLatToWorldPixel(lat, lon, zoom);
    const x = point.x + leftOffset;
    const y = point.y + topOffset;
    if (x < -90 || x > width + 90 || y < -90 || y > height + 90) return null;
    const value = getMapBucketValue(bucket);
    const size = Math.max(28, Math.min(62, 24 + Math.sqrt(value / maxValue) * 36));
    return { bucket, value, size, x, y, isOffset: false };
  }).filter(Boolean);

  const markers = spreadOverlappingMapMarkers(markerItems, width, height).map(item => {
    const { bucket, value, size, x, y, isOffset } = item;
    const selected = bucket.kind === "state"
      ? selectedState === bucket.state && !selectedCityKey
      : selectedState === bucket.state && selectedCityKey === bucket.cityKey;
    const label = bucket.hasWarehouse && bucket.kind === "city" ? "W" : formatNumber(value);
    const titleLocation = bucket.kind === "state" ? bucket.state : `${bucket.cityKey}, ${bucket.state || "multiple states"}`;
    return `
      <button class="geo-marker ${selected ? "selected" : ""} ${bucket.hasWarehouse ? "warehouse-marker" : ""} ${bucket.kind === "cluster" ? "cluster-marker" : ""} ${isOffset ? "offset-marker" : ""}"
        data-kind="${escapeHtml(bucket.kind)}"
        data-state="${escapeHtml(bucket.state || "")}"
        data-city-key="${escapeHtml(bucket.cityKey || "")}"
        style="left:${Math.round(x)}px;top:${Math.round(y)}px;width:${Math.round(size)}px;height:${Math.round(size)}px"
        title="${escapeHtml(titleLocation)} · ${escapeHtml(mapBucketLabel(bucket))}">
        <span>${escapeHtml(label)}</span>
      </button>
    `;
  }).join("");

  mapEl.className = "geo-map";
  mapEl.style.height = `${height}px`;
  mapEl.innerHTML = `
    <div class="geo-map-canvas">
      ${tiles.join("")}
      ${markers}
      <div class="geo-controls">
        <button id="mapZoomInBtn" title="Zoom in">+</button>
        <button id="mapZoomOutBtn" title="Zoom out">−</button>
        <button id="mapResetBtn" title="Fit United States">Fit</button>
      </div>
      <div class="geo-map-mode">${shouldUseStateMapBuckets() ? "State clusters" : "City markers"}</div>
      <div class="geo-map-credit">Map tiles © OpenStreetMap</div>
    </div>
  `;

  $("#mapZoomInBtn")?.addEventListener("click", () => zoomMap(1));
  $("#mapZoomOutBtn")?.addEventListener("click", () => zoomMap(-1));
  $("#mapResetBtn")?.addEventListener("click", resetMapView);

  // Wheel zoom is intentionally disabled because it caused laggy re-rendering in the extension tab.
  // Use the + / − buttons for stable zooming; normal page scrolling is left alone.

  mapEl.addEventListener("mousedown", (event) => {
    if (event.target.closest("button")) return;
    isDraggingMap = true;
    const centerPixel = lonLatToWorldPixel(geoMapCenterLat, geoMapCenterLon, geoMapZoom);
    mapDragStart = { x: event.clientX, y: event.clientY, centerPixel };
    mapEl.classList.add("dragging");
  });

  $$(".geo-marker").forEach(marker => {
    marker.addEventListener("click", () => {
      const kind = marker.dataset.kind;
      const state = marker.dataset.state;
      const cityKey = marker.dataset.cityKey;

      if (kind === "state" || kind === "cluster" || !cityKey) {
        if (state) {
          selectedState = selectedState === state && !selectedCityKey ? null : state;
          selectedCityKey = null;
        }
      } else {
        selectedState = state;
        selectedCityKey = selectedCityKey === cityKey ? null : cityKey;
      }
      applyFilters();
    });
  });
}

function projectMatchesNonStateFilters(project) {
  if (filters.application && project.applicationStatus !== filters.application) return false;
  if (filters.myStatus && project.myStatus !== filters.myStatus) return false;

  if (filters.location === "florida" && project.state !== "FL") return false;
  if (filters.location === "outOfState" && (project.state === "FL" || project.state === "N/A")) return false;
  if (filters.location === "warehouse" && !project.isWarehouse) return false;

  if (filters.flag === "new" && !project.isNew) return false;
  if (filters.flag === "reopened" && !project.isReopened) return false;
  if (filters.flag === "starred" && !project.isStarred) return false;
  if (filters.flag === "closingSoon" && !project.isClosingSoon) return false;
  if (filters.flag === "promoted" && !project.promoted) return false;

  if (filters.duration === "oneDay" && !project.isOneDay) return false;
  if (filters.duration === "multiDay" && project.isOneDay) return false;

  if (filters.dateStart || filters.dateEnd) {
    const overlaps = projectOverlapsInputRange(project);
    if (filters.dateMode === "exclude" ? overlaps : !overlaps) return false;
  }

  if (filters.weekday) {
    const day = filters.weekday;
    if (filters.weekdayType === "travelDay" && project.travelDay !== day) return false;
    if (filters.weekdayType === "eventDay" && project.eventDay !== day) return false;
    if (filters.weekdayType === "returnDay" && project.returnDay !== day) return false;
    if (filters.weekdayType === "startDay" && project.startDay !== day) return false;
    if (filters.weekdayType === "endDay" && project.endDay !== day) return false;
    if (filters.weekdayType === "anyProjectDay") {
      const allDays = new Set([project.travelDay, project.eventDay, project.returnDay, project.startDay, project.endDay, ...project.daysInRange].filter(Boolean));
      if (!allDays.has(day)) return false;
    }
  }

  if (filters.search.trim()) {
    const needle = filters.search.trim().toLowerCase();
    const haystack = [
      project.name,
      project.company,
      project.city,
      project.state,
      project.mealType,
      project.description,
      project.hpFormNumber
    ].join(" ").toLowerCase();
    if (!haystack.includes(needle)) return false;
  }

  return true;
}

function projectMatchesFilters(project) {
  if (!projectMatchesNonStateFilters(project)) return false;
  if (selectedState && project.state !== selectedState) return false;
  if (selectedCityKey && getProjectCityKey(project) !== selectedCityKey) return false;
  return true;
}

function applyFilters() {
  baseFilteredProjects = projects.filter(projectMatchesNonStateFilters);
  filteredProjects = baseFilteredProjects.filter(projectMatchesFilters);
  renderAll();
}

function renderSummary() {
  const totalMeals = filteredProjects.reduce((sum, p) => sum + p.mealCount, 0);
  const totalLines = filteredProjects.reduce((sum, p) => sum + p.numberOfLines, 0);
  const promoted = filteredProjects.filter(p => p.promoted).length;
  const open = filteredProjects.filter(p => p.applicationStatus === "open").length;
  const closed = filteredProjects.filter(p => p.applicationStatus === "closed").length;
  const applied = filteredProjects.filter(p => p.myStatus === "applied").length;
  const confirm = filteredProjects.filter(p => p.myStatus === "confirm" || p.myStatus === "pending").length;
  const confirmed = filteredProjects.filter(p => p.myStatus === "confirmed").length;
  const confirmedEstimate = combineEstimateTotals(filteredProjects.filter(p => p.myStatus === "confirmed"));

  const cards = [
    ["Projects", filteredProjects.length],
    ["Promoted", promoted],
    ["Open", open],
    ["Closed", closed],
    ["Applied", applied],
    ["Pending", confirm],
    ["Confirmed", confirmed],
    ["Est. Pay", confirmedEstimate.label, confirmedEstimate.hoursLabel, confidenceClass(confirmedEstimate.confidence)],
    ["Meals", formatNumber(totalMeals)],
    ["Lines", formatNumber(totalLines)]
  ];

  $("#summaryGrid").innerHTML = cards.map(([label, value, subvalue, valueClass]) => `
    <div class="summary-card">
      <div class="label">${escapeHtml(label)}</div>
      <div class="value ${valueClass ? escapeHtml(valueClass) : ""}">${escapeHtml(value)}</div>
      ${subvalue ? `<div class="summary-subvalue ${valueClass ? escapeHtml(valueClass) : ""}">${escapeHtml(subvalue)}</div>` : ""}
    </div>
  `).join("");
}

function aggregateByState() {
  const map = new Map();
  for (const project of baseFilteredProjects) {
    const key = displayStateLabel(project.state);
    if (!map.has(key)) {
      map.set(key, { state: key, projects: [], meals: 0, lines: 0 });
    }
    const bucket = map.get(key);
    bucket.projects.push(project);
    bucket.meals += project.mealCount;
    bucket.lines += project.numberOfLines;
  }

  return [...map.values()].sort((a, b) => {
    const aIsUnknown = displayStateLabel(a.state) === "N/A";
    const bIsUnknown = displayStateLabel(b.state) === "N/A";
    if (aIsUnknown !== bIsUnknown) return aIsUnknown ? 1 : -1;
    const av = getBucketValue(a);
    const bv = getBucketValue(b);
    return bv - av || stateSortIndex(a.state) - stateSortIndex(b.state) || displayStateLabel(a.state).localeCompare(displayStateLabel(b.state));
  });
}

function getBucketValue(bucket) {
  if (filters.countMode === "meals") return bucket.meals;
  if (filters.countMode === "lines") return bucket.lines;
  return bucket.projects.length;
}

function bucketValueLabel(bucket) {
  const value = getBucketValue(bucket);
  if (filters.countMode === "meals") return `${formatNumber(value)} meals`;
  if (filters.countMode === "lines") return `${formatNumber(value)} lines`;
  return `${formatNumber(value)} projects`;
}

function bucketValueNumber(bucket) {
  return formatNumber(getBucketValue(bucket));
}

function renderStateSummary() {
  const stateSummary = $("#stateSummary");
  const citySummary = $("#citySummary");
  const buckets = aggregateByState();

  renderGeoMap();

  if (!buckets.length) {
    stateSummary.className = "state-summary empty-state";
    stateSummary.textContent = "No states match the current filters.";
    citySummary.classList.add("hidden");
    return;
  }

  stateSummary.className = "state-summary compact-state-summary";
  stateSummary.innerHTML = buckets.map(bucket => `
    <button class="state-card compact-state-card ${selectedState === bucket.state ? "selected" : ""}" data-state="${escapeHtml(bucket.state)}" title="${escapeHtml(bucketValueLabel(bucket))}">
      <span class="state-code">${escapeHtml(displayStateLabel(bucket.state))}</span>
      <span class="state-count">${escapeHtml(bucketValueNumber(bucket))}</span>
    </button>
  `).join("");

  $$(".state-card").forEach(card => {
    card.addEventListener("click", () => {
      const state = card.dataset.state;
      if (selectedState === state) {
        selectedState = null;
        selectedCityKey = null;
      } else {
        selectedState = state;
        selectedCityKey = null;
      }
      applyFilters();
    });
  });

  if (selectedState) {
    renderCitySummary(selectedState);
  } else {
    citySummary.classList.add("hidden");
  }
}

function renderCitySummary(state) {
  const citySummary = $("#citySummary");
  const cityMap = new Map();
  const stateProjects = baseFilteredProjects.filter(project => project.state === state);

  for (const project of stateProjects) {
    const cityKey = getProjectCityKey(project);
    if (!cityMap.has(cityKey)) {
      cityMap.set(cityKey, { city: cityKey, projects: [], meals: 0, lines: 0, hasWarehouse: false });
    }
    const bucket = cityMap.get(cityKey);
    bucket.projects.push(project);
    bucket.meals += project.mealCount;
    bucket.lines += project.numberOfLines;
    bucket.hasWarehouse = bucket.hasWarehouse || project.isWarehouse;
  }

  const buckets = [...cityMap.values()].sort((a, b) => getBucketValue(b) - getBucketValue(a) || a.city.localeCompare(b.city));

  citySummary.classList.remove("hidden");
  citySummary.innerHTML = `
    <div class="city-summary-header">
      <h2>${escapeHtml(displayStateLabel(state))} city groups</h2>
      <span class="muted">Click a city to filter the table. Click again to clear city filter.</span>
    </div>
    <div class="city-grid">
      ${buckets.map(bucket => `
        <button class="city-card ${selectedCityKey === bucket.city ? "selected" : ""}" data-city-key="${escapeHtml(bucket.city)}">
          <div class="city-name">${escapeHtml(bucket.city)} ${bucket.hasWarehouse ? '<span class="warehouse-badge">Warehouse</span>' : ""}</div>
          <div class="city-meta">${escapeHtml(bucketValueLabel(bucket))}</div>
          <div class="city-meta">${escapeHtml(formatNumber(bucket.meals))} meals · ${escapeHtml(formatNumber(bucket.lines))} lines</div>
        </button>
      `).join("")}
    </div>
  `;

  $$(".city-card").forEach(card => {
    card.addEventListener("click", () => {
      selectedCityKey = selectedCityKey === card.dataset.cityKey ? null : card.dataset.cityKey;
      applyFilters();
    });
  });
}

function hideEstimateTooltip() {
  if (activeEstimateTooltip) {
    activeEstimateTooltip.remove();
    activeEstimateTooltip = null;
    activeEstimateTooltipAnchor = null;
  }
}

function positionEstimateTooltip(anchor, tooltip) {
  const rect = anchor.getBoundingClientRect();
  const margin = 12;
  const tooltipRect = tooltip.getBoundingClientRect();
  let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
  left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));
  let top = rect.bottom + 8;
  if (top + tooltipRect.height > window.innerHeight - margin) {
    top = Math.max(margin, rect.top - tooltipRect.height - 8);
  }
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function showEstimateTooltip(projectId, anchor) {
  const project = getProjectById(projectId);
  if (!project || !project.earningsEstimate) return;
  hideEstimateTooltip();
  const tooltip = document.createElement("div");
  tooltip.className = project.earningsEstimate.parts.length === 1 ? "estimate-tooltip single" : "estimate-tooltip";
  tooltip.innerHTML = estimateTooltipHtml(project);
  document.body.appendChild(tooltip);
  activeEstimateTooltip = tooltip;
  activeEstimateTooltipAnchor = anchor;
  positionEstimateTooltip(anchor, tooltip);
}

function wireEstimateTooltips() {
  $$(".estimate-cell").forEach(button => {
    button.addEventListener("mouseenter", () => showEstimateTooltip(button.dataset.projectId, button));
    button.addEventListener("mouseleave", hideEstimateTooltip);
    button.addEventListener("focus", () => showEstimateTooltip(button.dataset.projectId, button));
    button.addEventListener("blur", hideEstimateTooltip);
  });
}

function renderTable() {
  const tbody = $("#projectsTbody");
  $("#resultCount").textContent = `${filteredProjects.length} shown`;

  hideEstimateTooltip();
  if (!filteredProjects.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="empty-state">No projects match the current filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredProjects.map(project => `
    <tr>
      <td>${statusPill(project)}</td>
      <td>
        <div class="project-title-row">
          <button class="star-btn ${project.isStarred ? "active" : ""}" data-project-id="${escapeHtml(project.id)}" title="${project.isStarred ? "Unstar project" : "Star project"}">${project.isStarred ? "★" : "☆"}</button>
          <div>
            <div class="project-name">${escapeHtml(project.name)}</div>
            <div class="project-badges">${flagBadgesHtml(project)}</div>
          </div>
        </div>
      </td>
      <td>${crewNeedHtml(project)}</td>
      <td>
        <strong>${escapeHtml(project.city)}, ${escapeHtml(displayStateLabel(project.state))}</strong>
        ${project.address ? `<div class="muted">${escapeHtml(project.address)}</div>` : ""}
      </td>
      <td class="day-count"><strong>${escapeHtml(formatNumber(getProjectDayCount(project) || 0))}</strong></td>
      <td>${scheduleHtml(project)}</td>
      <td>
        <div>${escapeHtml(formatNumber(project.mealCount))}</div>
        <div class="muted">${escapeHtml(project.mealType || "")}</div>
      </td>
      <td>${escapeHtml(formatNumber(project.numberOfLines))}</td>
      <td>${estimateCellHtml(project)}</td>
      <td>
        <div class="row-actions">
          <button class="small-action detail-project-btn" data-project-id="${escapeHtml(project.id)}">Details</button>
          <button class="small-action view-project-btn" data-project-id="${escapeHtml(project.id)}">View</button>
          ${project.canConfirm && project.shiftId ? `<button class="small-action confirm-action confirm-shift-btn" data-project-id="${escapeHtml(project.id)}">Confirm</button>` : canShowApplyAction(project) ? `<button class="small-action primary-action apply-project-btn" data-project-id="${escapeHtml(project.id)}">Apply</button>` : ""}
        </div>
      </td>
    </tr>
  `).join("");

  $$(".star-btn").forEach(button => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleProjectStar(button.dataset.projectId);
    });
  });

  wireEstimateTooltips();

  $$(".detail-project-btn").forEach(button => {
    button.addEventListener("click", () => showProjectDetail(button.dataset.projectId));
  });
  $$(".view-project-btn").forEach(button => {
    button.addEventListener("click", () => openProjectUrl(button.dataset.projectId, "view"));
  });
  $$(".apply-project-btn").forEach(button => {
    button.addEventListener("click", () => openProjectUrl(button.dataset.projectId, "shifts"));
  });
  $$(".confirm-shift-btn").forEach(button => {
    button.addEventListener("click", () => confirmProjectShift(button.dataset.projectId));
  });
}

function getProjectById(projectId) {
  return projects.find(project => String(project.id) === String(projectId));
}

function openProjectUrl(projectId, mode = "view") {
  const project = getProjectById(projectId);
  if (!project) return;
  const url = mode === "shifts" ? project.rosterfyShiftsUrl : project.rosterfyViewUrl;
  chrome.tabs.create({ url });
}

function detailRow(label, value) {
  if (value === undefined || value === null || value === "") return "";
  return `
    <div class="detail-row">
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value).replace(/\n/g, "<br>")}</dd>
    </div>
  `;
}

function showProjectDetail(projectId) {
  const project = getProjectById(projectId);
  if (!project) return;
  const modal = $("#projectModal");
  const body = $("#projectModalBody");
  const label = project.myStatus === "confirmed" ? "Confirmed" : (project.myStatus === "confirm" || project.myStatus === "pending") ? "Pending" : project.myStatus === "applied" ? "Applied" : project.applicationStatus === "open" ? "Open" : "Closed";

  body.innerHTML = `
    <div class="modal-header">
      ${project.bannerImage ? `<img class="detail-banner" data-src="${escapeHtml(project.bannerImage)}" alt="Event banner">` : ""}
      <div>
        <h2 id="projectModalTitle">${escapeHtml(project.name)}</h2>
        <div class="project-badges detail-badges">${flagBadgesHtml(project)}</div>
        <div class="detail-status-line">${statusPill(project)}</div>
      </div>
    </div>

    <div class="modal-actions">
      <button class="primary" id="modalViewBtn">Open View Page</button>
      <button id="modalStarBtn">${project.isStarred ? "★ Starred" : "☆ Star"}</button>
      ${project.canConfirm && project.shiftId ? '<button class="primary confirm-action" id="modalConfirmBtn">Confirm Shift</button>' : canShowApplyAction(project) ? '<button class="primary" id="modalApplyBtn">Open Shifts / Apply</button>' : ""}
      <button id="modalIcsBtn">Export this ICS</button>
    </div>

    <dl class="detail-grid">
      ${detailRow("Location", `${project.city}, ${displayStateLabel(project.state)}`)}
      ${detailRow("Address", project.address)}
      ${detailRow("Start", project.startDate || project.startTimestamp)}
      ${detailRow("End", project.endDate || project.endTimestamp)}
      ${detailRow("Project days", String(getProjectDayCount(project) || "—"))}
      ${detailRow("Schedule", project.scheduleItems?.length ? project.scheduleItems.map(item => `${item.dateText}: ${item.label}`).join("\n") : "")}
      ${detailRow("Travel/Load-in", project.travelDay || "—")}
      ${detailRow("Event day", project.eventDay || "—")}
      ${detailRow("Return", project.returnDay || "—")}
      ${detailRow("Applications close", project.appsClose || "—")}
      ${detailRow("Close countdown", project.closingSoonLabel)}
      ${detailRow("Promoted", project.promoted ? "Yes" : "No")}
      ${detailRow("Flags", flagsSummary(project))}
      ${detailRow("First seen", project.firstSeenLabel)}
      ${detailRow("Reopened", project.reopenedLabel)}
      ${detailRow("Starred", project.starredLabel)}
      ${detailRow("Project length", project.isOneDay ? "One-day project" : "Multi-day project")}
      ${detailRow("Apply message", project.applyMessage)}
      ${detailRow("Meal goal", `${formatNumber(project.mealCount)} ${project.mealType || ""}`)}
      ${detailRow("Assembly lines", formatNumber(project.numberOfLines))}
      ${detailRow("Shifts count", formatNumber(project.shiftsCount))}
      ${detailRow("HP form", project.hpFormNumber)}
      ${detailRow("Rosterfy event ID", project.id)}
      ${detailRow("Rosterfy shift ID", project.shiftId)}
      ${detailRow("Shift status", project.shiftStatus)}
      ${detailRow("Estimated net", project.earningsEstimate?.label)}
      ${detailRow("Estimated gross", project.earningsEstimate?.grossLabel)}
      ${detailRow("Estimated hours", project.earningsEstimate?.hoursLabel)}
    </dl>

    ${estimateDetailHtml(project)}

    <section class="detail-description">
      <h3>Description</h3>
      <p>${descriptionHtml(project.description)}</p>
    </section>
  `;

  modal.classList.remove("hidden");

  const detailBanner = body.querySelector(".detail-banner");
  if (detailBanner) {
    detailBanner.addEventListener("error", () => {
      detailBanner.remove();
    }, { once: true });
    detailBanner.src = detailBanner.dataset.src;
  }

  $("#modalViewBtn")?.addEventListener("click", () => openProjectUrl(project.id, "view"));
  $("#modalStarBtn")?.addEventListener("click", () => {
    toggleProjectStar(project.id);
    closeProjectModal();
  });
  $("#modalApplyBtn")?.addEventListener("click", () => openProjectUrl(project.id, "shifts"));
  $("#modalConfirmBtn")?.addEventListener("click", () => confirmProjectShift(project.id));
  $("#modalIcsBtn")?.addEventListener("click", () => downloadText(`us-hunger-rosterfy-${project.id}.ics`, makeIcs([project]), "text/calendar"));
}

function closeProjectModal() {
  $("#projectModal")?.classList.add("hidden");
}

function renderAll() {
  renderSummary();
  renderStateSummary();
  renderTable();
  const hasData = projects.length > 0;
  $("#exportCsvBtn").disabled = !hasData;
  $("#exportFilteredIcsBtn").disabled = !hasData;
  $("#exportConfirmedIcsBtn").disabled = !hasData;
}

function updateChipUi() {
  $$(".chip").forEach(chip => {
    const group = chip.dataset.filterGroup;
    const value = chip.dataset.filterValue;
    chip.classList.toggle("active", filters[group] === value);
  });
}

async function setData(events, myEvents, pendingEvents, myShifts, syncedAt) {
  rawEvents = events || [];
  rawMyEvents = myEvents || [];
  rawPendingEvents = pendingEvents || [];
  rawMyShifts = myShifts || [];
  const syncStamp = syncedAt || new Date().toISOString();
  await saveCachedSnapshot({
    events: rawEvents,
    myEvents: rawMyEvents,
    pendingEvents: rawPendingEvents,
    myShifts: rawMyShifts,
    syncedAt: syncStamp
  });
  projects = await applyLocalHistoryAndFlags(mergeAndNormalize(rawEvents, rawMyEvents, rawPendingEvents, rawMyShifts));
  selectedState = null;
  selectedCityKey = null;
  setSyncStatus(`Synced ${new Date(syncStamp).toLocaleString()}`, "ok");
  applyFilters();
}

async function updateMyEvents(myEvents, pendingEvents, myShifts, syncedAt) {
  rawMyEvents = myEvents || [];
  rawPendingEvents = pendingEvents || rawPendingEvents || [];
  rawMyShifts = myShifts || rawMyShifts || [];
  const syncStamp = syncedAt || new Date().toISOString();
  await saveCachedSnapshot({
    events: rawEvents,
    myEvents: rawMyEvents,
    pendingEvents: rawPendingEvents,
    myShifts: rawMyShifts,
    syncedAt: syncStamp
  });
  projects = await applyLocalHistoryAndFlags(mergeAndNormalize(rawEvents, rawMyEvents, rawPendingEvents, rawMyShifts));
  setSyncStatus(`My apps refreshed ${new Date(syncStamp).toLocaleString()}`, "ok");
  applyFilters();
}

function getApiUrlOverrides() {
  return {
    eventUrl: $("#eventUrlInput")?.value?.trim() || "",
    myEventsUrl: $("#myEventUrlInput")?.value?.trim() || ""
  };
}

async function sendToContentScript(type, payload = {}) {
  if (!activeTabId) throw new Error("No active Rosterfy tab found.");

  const response = await chrome.tabs.sendMessage(activeTabId, { type, payload });
  if (!response?.ok) {
    throw new Error(response?.error || "Unknown extension message error.");
  }
  return response.payload;
}

async function syncAll() {
  setSyncStatus("Syncing...", "muted");
  try {
    const payload = await sendToContentScript("ROSTERFY_SYNC_ALL", getApiUrlOverrides());
    await setData(payload.events, payload.myEvents, payload.pendingEvents, payload.myShifts, payload.syncedAt);
    if (payload.myEventsWarning) {
      $("#tabStatus").innerHTML = `<span class="warning">Opportunities synced, but my applications failed. ${escapeHtml(payload.myEventsWarning)}</span>`;
    } else if (payload.myShiftsWarning) {
      $("#tabStatus").innerHTML = `<span class="warning">Synced, but shift confirm status could not be checked. ${escapeHtml(payload.myShiftsWarning)}</span>`;
    } else if (payload.pendingEventsWarning) {
      $("#tabStatus").innerHTML = `<span class="warning">Synced, but promoted events could not be checked. ${escapeHtml(payload.pendingEventsWarning)}</span>`;
    }
  } catch (error) {
    console.error(error);
    setSyncStatus("Sync failed", "error");
    $("#tabStatus").innerHTML = `<span class="error">${escapeHtml(error.message)}</span>`;
  }
}

async function refreshMyApplications() {
  setSyncStatus("Refreshing my applications...", "muted");
  try {
    const payload = await sendToContentScript("ROSTERFY_REFRESH_MY_EVENTS", getApiUrlOverrides());
    await updateMyEvents(payload.myEvents, payload.pendingEvents, payload.myShifts, payload.syncedAt);
  } catch (error) {
    console.error(error);
    setSyncStatus("Refresh failed", "error");
    $("#tabStatus").innerHTML = `<span class="error">${escapeHtml(error.message)}</span>`;
  }
}

async function confirmProjectShift(projectId) {
  const project = getProjectById(projectId);
  if (!project) return;
  if (!project.shiftId || !project.canConfirm) {
    window.alert("This project does not have a confirmable shift in the current sync data. Try Refresh Apps first.");
    return;
  }

  const ok = window.confirm(`Confirm this shift?\n\n${project.name}\nShift ID: ${project.shiftId}`);
  if (!ok) return;

  setSyncStatus("Confirming shift...", "muted");
  try {
    await sendToContentScript("ROSTERFY_CONFIRM_SHIFT", { shiftId: project.shiftId });
    setSyncStatus("Shift confirmed. Refreshing...", "ok");
    await refreshMyApplications();
    closeProjectModal();
  } catch (error) {
    console.error(error);
    setSyncStatus("Confirm failed", "error");
    window.alert(`Confirm failed: ${error.message}`);
  }
}

function toCsv(rows) {
  const headers = [
    "id", "name", "company", "city", "state", "isWarehouse", "address", "locationConfidence",
    "applicationStatus", "promoted", "myStatus", "appliedByMe", "pendingByMe", "confirmedByMe", "shiftId", "canConfirm", "shiftStatus", "appliedShiftUserId", "myShiftAppliedCount", "myShiftConfirmedCount",
    "isNew", "firstSeenAt", "isReopened", "reopenedAt", "isStarred", "starredAt", "isClosingSoon", "closingSoonLabel", "appsCloseTimestamp", "isOneDay",
    "startDate", "startDay", "endDate", "endDay", "travelDay", "eventDay", "returnDay",
    "mealCount", "mealType", "numberOfLines", "estimatedNet", "estimatedGross", "estimatedHours", "estimateConfidence", "hpFormNumber", "description"
  ];

  const escape = value => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [
    headers.join(","),
    ...rows.map(row => headers.map(header => {
      if (header === "estimatedNet") return escape(row.earningsEstimate?.label || "");
      if (header === "estimatedGross") return escape(row.earningsEstimate?.grossLabel || "");
      if (header === "estimatedHours") return escape(row.earningsEstimate?.hoursLabel || "");
      if (header === "estimateConfidence") return escape(row.earningsEstimate?.confidence || "");
      return escape(row[header]);
    }).join(","))
  ].join("\n");
}

function downloadText(filename, text, mimeType) {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatIcsDate(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function cleanIcsText(text) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function makeIcs(rows) {
  const now = formatIcsDate(new Date());
  const events = rows.map(project => {
    const start = formatIcsDate(project.startTimestamp);
    const end = formatIcsDate(project.endTimestamp);
    if (!start || !end) return "";

    const label = project.myStatus === "confirmed"
      ? "Confirmed"
      : (project.myStatus === "confirm" || project.myStatus === "pending")
        ? "Pending"
        : project.myStatus === "applied"
        ? "Applied"
        : project.applicationStatus === "open"
          ? "Open"
          : "Closed";

    const description = [
      `Status: ${label}`,
      `Application: ${project.applicationStatus}`,
      `My status: ${project.myStatus}`,
      flagsSummary(project) ? `Flags: ${flagsSummary(project)}` : "",
      project.closingSoonLabel ? `Closing: ${project.closingSoonLabel}` : "",
      project.firstSeenLabel ? `First seen: ${project.firstSeenLabel}` : "",
      project.shiftId ? `Shift ID: ${project.shiftId}` : "",
      project.shiftStatus ? `Shift status: ${project.shiftStatus}` : "",
      `Location: ${project.city}, ${project.state}`,
      project.address ? `Address: ${project.address}` : "",
      `Travel/Load-in day: ${project.travelDay || "Unknown"}`,
      `Event day: ${project.eventDay || "Unknown"}`,
      `Return day: ${project.returnDay || "Unknown"}`,
      `Meals: ${formatNumber(project.mealCount)} ${project.mealType || ""}`,
      `Lines: ${formatNumber(project.numberOfLines)}`,
      "",
      project.description
    ].filter(Boolean).join("\n");

    return [
      "BEGIN:VEVENT",
      `UID:${project.id}@us-hunger-rosterfy-tracker`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${cleanIcsText(`[${label}] ${project.name}`)}`,
      `DESCRIPTION:${cleanIcsText(description)}`,
      "END:VEVENT"
    ].join("\n");
  }).filter(Boolean);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//US Hunger Rosterfy Tracker//EN",
    ...events,
    "END:VCALENDAR"
  ].join("\n");
}

function exportCsv() {
  downloadText("us-hunger-rosterfy-projects.csv", toCsv(filteredProjects), "text/csv");
}

function exportFilteredIcs() {
  downloadText("us-hunger-rosterfy-filtered.ics", makeIcs(filteredProjects), "text/calendar");
}

function exportConfirmedIcs() {
  const confirmed = projects.filter(project => project.myStatus === "confirmed");
  downloadText("us-hunger-rosterfy-confirmed.ics", makeIcs(confirmed), "text/calendar");
}

function clearFilters() {
  filters.application = null;
  filters.myStatus = null;
  filters.location = null;
  filters.flag = null;
  filters.weekday = "";
  filters.weekdayType = "anyProjectDay";
  filters.dateStart = "";
  filters.dateEnd = "";
  filters.dateMode = "include";
  filters.duration = "";
  filters.search = "";
  selectedState = null;
  selectedCityKey = null;

  $("#weekdaySelect").value = "";
  $("#weekdayTypeSelect").value = "anyProjectDay";
  $("#dateStartInput").value = "";
  $("#dateEndInput").value = "";
  $("#dateModeSelect").value = "include";
  $("#durationSelect").value = "";
  $("#searchInput").value = "";
  updateChipUi();
  applyFilters();
}

const isFullPageDashboard = location.pathname.endsWith("/dashboard.html");

async function openFullDashboard() {
  if (!activeTabId) {
    const tab = await findRosterfyTab();
    activeTabId = tab?.id || null;
  }

  const query = activeTabId ? `?tabId=${encodeURIComponent(activeTabId)}` : "";
  await chrome.tabs.create({ url: chrome.runtime.getURL(`src/dashboard.html${query}`) });
}

async function findRosterfyTab() {
  const params = new URLSearchParams(location.search);
  const tabIdParam = Number(params.get("tabId"));

  if (Number.isInteger(tabIdParam) && tabIdParam > 0) {
    try {
      const tab = await chrome.tabs.get(tabIdParam);
      const url = tab?.url ? new URL(tab.url) : null;
      if (url?.origin === ROSTERFY_ORIGIN) return tab;
    } catch (error) {
      console.warn("Could not use tabId from dashboard URL", error);
    }
  }

  try {
    const rosterfyTabs = await chrome.tabs.query({ url: `${ROSTERFY_ORIGIN}/*` });
    if (rosterfyTabs.length) return rosterfyTabs[0];
  } catch (error) {
    console.warn("Could not query Rosterfy tabs", error);
  }

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeUrl = activeTab?.url ? new URL(activeTab.url) : null;
  return activeUrl?.origin === ROSTERFY_ORIGIN ? activeTab : null;
}

function wireMapGlobalEvents() {
  if (mapGlobalEventsWired) return;
  mapGlobalEventsWired = true;

  window.addEventListener("mouseup", () => {
    if (!isDraggingMap) return;
    isDraggingMap = false;
    mapDragStart = null;
    $("#geoMap")?.classList.remove("dragging");
  });

  window.addEventListener("mousemove", (event) => {
    if (!isDraggingMap || !mapDragStart) return;
    const dx = event.clientX - mapDragStart.x;
    const dy = event.clientY - mapDragStart.y;
    const scale = 256 * 2 ** geoMapZoom;
    const newCenterX = mapDragStart.centerPixel.x - dx;
    const newCenterY = mapDragStart.centerPixel.y - dy;
    geoMapCenterLon = (newCenterX / scale) * 360 - 180;
    const n = Math.PI - 2 * Math.PI * newCenterY / scale;
    geoMapCenterLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    renderGeoMap();
  });
}

function wireEvents() {
  wireMapGlobalEvents();
  $("#openRosterfyBtn")?.addEventListener("click", () => chrome.tabs.create({ url: ROSTERFY_ORIGIN }));
  $("#openDashboardBtn")?.addEventListener("click", openFullDashboard);
  if (isFullPageDashboard) $("#openDashboardBtn")?.classList.add("hidden");
  $("#syncAllBtn").addEventListener("click", syncAll);
  $("#refreshMyBtn").addEventListener("click", refreshMyApplications);
  $("#exportCsvBtn").addEventListener("click", exportCsv);
  $("#exportFilteredIcsBtn").addEventListener("click", exportFilteredIcs);
  $("#exportConfirmedIcsBtn").addEventListener("click", exportConfirmedIcs);
  $("#clearLocalHistoryBtn")?.addEventListener("click", clearLocalHistory);
  $("#clearFiltersBtn").addEventListener("click", clearFilters);
  $("#closeProjectModalBtn")?.addEventListener("click", closeProjectModal);
  $("#projectModal")?.addEventListener("click", (event) => {
    if (event.target.id === "projectModal") closeProjectModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProjectModal();
  });

  $$(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const group = chip.dataset.filterGroup;
      const value = chip.dataset.filterValue;
      filters[group] = filters[group] === value ? null : value;
      updateChipUi();
      applyFilters();
    });
  });

  $("#weekdaySelect").addEventListener("change", (event) => {
    filters.weekday = event.target.value;
    applyFilters();
  });

  $("#weekdayTypeSelect").addEventListener("change", (event) => {
    filters.weekdayType = event.target.value;
    applyFilters();
  });


  $("#dateStartInput")?.addEventListener("change", (event) => {
    filters.dateStart = event.target.value;
    applyFilters();
  });

  $("#dateEndInput")?.addEventListener("change", (event) => {
    filters.dateEnd = event.target.value;
    applyFilters();
  });

  $("#dateModeSelect")?.addEventListener("change", (event) => {
    filters.dateMode = event.target.value;
    applyFilters();
  });

  $("#durationSelect")?.addEventListener("change", (event) => {
    filters.duration = event.target.value;
    applyFilters();
  });

  const runSearch = () => {
    filters.search = $("#searchInput")?.value || "";
    applyFilters();
  };

  $("#searchBtn")?.addEventListener("click", runSearch);
  $("#searchInput")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") runSearch();
  });

  $("#filterToggleBtn")?.addEventListener("click", () => {
    const drawer = $("#filterDrawer");
    if (!drawer) return;
    const isHidden = drawer.classList.toggle("hidden");
    $("#filterToggleBtn")?.setAttribute("aria-expanded", String(!isHidden));
  });

  $("#settingsToggleBtn")?.addEventListener("click", () => {
    const drawer = $("#settingsPanel");
    if (!drawer) return;
    const isHidden = drawer.classList.toggle("hidden");
    $("#settingsToggleBtn")?.setAttribute("aria-expanded", String(!isHidden));
  });

  $("#countModeSelect").addEventListener("change", (event) => {
    filters.countMode = event.target.value;
    renderStateSummary();
  });

  window.addEventListener("scroll", hideEstimateTooltip, true);
  window.addEventListener("resize", hideEstimateTooltip);
}

async function init() {
  wireEvents();

  const tab = await findRosterfyTab();
  activeTabId = tab?.id || null;
  const isRosterfy = Boolean(activeTabId);

  if (!isRosterfy) {
    $("#tabStatus").textContent = "Open a US Hunger Rosterfy tab, then reload this dashboard.";
    $("#notRosterfyPanel").classList.remove("hidden");
    $("#dashboard").classList.add("hidden");
    return;
  }

  $("#tabStatus").textContent = isFullPageDashboard
    ? `Connected to US Hunger Rosterfy tab #${activeTabId}.`
    : "Connected to US Hunger Rosterfy tab.";
  $("#notRosterfyPanel").classList.add("hidden");
  $("#dashboard").classList.remove("hidden");

  const cachedSnapshot = await loadCachedSnapshot();
  if (cachedSnapshot) {
    await loadDashboardFromCache(cachedSnapshot);
    return;
  }

  setSyncStatus("No local data yet. Syncing once...", "muted");
  syncAll();
}

init().catch(error => {
  console.error(error);
  setSyncStatus("Init failed", "error");
  $("#tabStatus").innerHTML = `<span class="error">${escapeHtml(error.message)}</span>`;
});
