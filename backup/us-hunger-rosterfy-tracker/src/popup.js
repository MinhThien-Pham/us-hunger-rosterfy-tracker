const ROSTERFY_ORIGIN = "https://ushunger.rosterfy.com";
const WAREHOUSE_ADDRESS = "830 S Ronald Reagan Blvd #142, Longwood, FL 32750";
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const STATE_SET = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC"
]);

let activeTabId = null;
let rawEvents = [];
let rawMyEvents = [];
let projects = [];
let filteredProjects = [];
let selectedState = null;

const filters = {
  application: null, // null | open | closed
  myStatus: null,    // null | unapplied | applied | confirmed
  location: null,    // null | florida | outOfState | warehouse
  weekday: "",
  weekdayType: "anyProjectDay",
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

function htmlToText(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent.replace(/\s+/g, " ").trim();
}

function numberOrZero(value) {
  const n = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function parseLocationFromName(name, descriptionText) {
  const text = `${name || ""} ${descriptionText || ""}`;
  const hasWarehouse = /\bUSH\s+Warehouse\b/i.test(text) || /\bUS\s*Hunger\s+Warehouse\b/i.test(text);
  const parts = String(name || "").split(";").map(x => x.trim()).filter(Boolean);
  const company = parts[0] || "Unknown";

  let city = "";
  let state = "";
  let locationConfidence = "unknown";

  // Pattern: "Company; San Antonio, TX; 50K RLJ"
  const cityStateMatch = String(name || "").match(/;\s*([^;]*?),\s*([A-Z]{2})(?:\b|\s|\)|;)/);
  if (cityStateMatch && STATE_SET.has(cityStateMatch[2])) {
    city = cityStateMatch[1].trim();
    state = cityStateMatch[2];
    locationConfidence = "title_city_state";
  }

  // Pattern: "Company; Wilmington DE 30K" or "Company; OH 30K"
  if (!state) {
    for (const part of parts.slice(1)) {
      const m = part.match(/\b([A-Z]{2})\b(?=\s*\d|$|\)|;)/);
      if (m && STATE_SET.has(m[1])) {
        state = m[1];
        city = part.replace(/\b[A-Z]{2}\b.*$/, "").trim().replace(/,$/, "");
        locationConfidence = city ? "title_city_state" : "title_state_only";
        break;
      }
    }
  }

  if (!state && /\bNYC\b/i.test(name || "")) {
    city = "NYC";
    state = "NY";
    locationConfidence = "title_city_alias";
  }

  if (hasWarehouse && !state) {
    city = "Longwood";
    state = "FL";
    locationConfidence = "warehouse_fallback";
  }

  if (hasWarehouse && state === "FL" && !city) {
    city = "Longwood";
    locationConfidence = "warehouse_fallback";
  }

  return {
    company,
    city: city || (state ? "Unknown city" : "Unknown"),
    state: state || "Unknown",
    isWarehouse: hasWarehouse,
    address: hasWarehouse ? WAREHOUSE_ADDRESS : "",
    locationConfidence
  };
}

function extractDayAfterLabel(text, labelRegexes) {
  const normalized = String(text || "").replace(/\s+/g, " ");
  for (const labelRegex of labelRegexes) {
    const match = normalized.match(labelRegex);
    if (match) {
      const after = normalized.slice(match.index, match.index + 100);
      const day = after.match(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i);
      if (day) {
        return day[1].charAt(0).toUpperCase() + day[1].slice(1).toLowerCase();
      }
    }
  }
  return "";
}

function parseOperationalDays(descriptionText) {
  const travelDay = extractDayAfterLabel(descriptionText, [
    /Travel\s*(?:\/|&|and)?\s*Load\s*in\s*:?/i,
    /Travel\s*in\s*:?/i,
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

function getMyEventStatus(myEvent) {
  if (!myEvent) {
    return {
      appliedByMe: false,
      confirmedByMe: false,
      myStatus: "unapplied",
      myApplicationCreatedAt: "",
      myApplicationUpdatedAt: "",
      myShiftAppliedCount: 0,
      myShiftConfirmedCount: 0,
      myShiftDemandCount: 0
    };
  }

  const shiftCount = myEvent.extras?.shift_count || {};
  const confirmed = numberOrZero(shiftCount.confirmed);
  const applied = numberOrZero(shiftCount.applied);
  const demand = numberOrZero(shiftCount.demand);

  return {
    appliedByMe: true,
    confirmedByMe: confirmed > 0,
    myStatus: confirmed > 0 ? "confirmed" : "applied",
    myApplicationCreatedAt: myEvent.relations?.current_user?.nice?.created_at || myEvent.relations?.current_user?.object?.created_at || "",
    myApplicationUpdatedAt: myEvent.relations?.current_user?.nice?.updated_at || myEvent.relations?.current_user?.object?.updated_at || "",
    myShiftAppliedCount: applied,
    myShiftConfirmedCount: confirmed,
    myShiftDemandCount: demand
  };
}

function normalizeProject(event, myEvent) {
  const obj = event.object || {};
  const nice = event.nice || {};
  const relations = event.relations || {};
  const permissions = event.permissions || {};

  const name = obj.name || nice.name || "Untitled project";
  const descriptionText = htmlToText(obj.description || "");
  const location = parseLocationFromName(name, descriptionText);
  const operationalDays = parseOperationalDays(descriptionText);
  const my = getMyEventStatus(myEvent);
  const applicationStatus = permissions.apply === true ? "open" : "closed";
  const daysInRange = getDateRangeWeekdays(obj.start_timestamp, obj.end_timestamp);

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

    applicationStatus,
    applicationsOpen: applicationStatus === "open",
    applyMessage: nice.apply?.message || (applicationStatus === "open" ? "Open" : "Closed / unavailable"),

    appliedByMe: my.appliedByMe,
    confirmedByMe: my.confirmedByMe,
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
    promoted: obj.promoted === 1 || nice.promoted === "Yes",
    isCancelled: obj.is_cancelled === 1,
    isArchived: obj.is_archived === 1,
    isVirtual: obj.is_virtual === 1 || nice.is_virtual === "Yes",
    bannerImage: obj.banner_image || nice.grid_list_image || "",

    // TODO: replace after confirming actual Rosterfy detail route.
    rosterfyUrl: ROSTERFY_ORIGIN
  };
}

function mergeAndNormalize(events, myEvents) {
  const myByEventId = new Map();
  for (const myEvent of myEvents) {
    const eventId = myEvent.object?.id || myEvent.relations?.current_user?.object?.event_id;
    if (eventId) myByEventId.set(eventId, myEvent);
  }

  return events.map(event => normalizeProject(event, myByEventId.get(event.object?.id)));
}

function statusPill(project) {
  const applicationClass = project.applicationStatus === "open" ? "open-pill" : "closed-pill";
  const myClass = `${project.myStatus}-pill`;
  return `
    <div><span class="status-pill ${applicationClass}">${project.applicationStatus === "open" ? "Open" : "Closed"}</span></div>
    <div style="margin-top:6px"><span class="status-pill ${myClass}">${project.myStatus}</span></div>
  `;
}

function projectMatchesFilters(project) {
  if (filters.application && project.applicationStatus !== filters.application) return false;
  if (filters.myStatus && project.myStatus !== filters.myStatus) return false;

  if (filters.location === "florida" && project.state !== "FL") return false;
  if (filters.location === "outOfState" && (project.state === "FL" || project.state === "Unknown")) return false;
  if (filters.location === "warehouse" && !project.isWarehouse) return false;

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

function applyFilters() {
  filteredProjects = projects.filter(projectMatchesFilters);
  if (selectedState && !filteredProjects.some(p => p.state === selectedState)) {
    selectedState = null;
  }
  renderAll();
}

function renderSummary() {
  const totalMeals = filteredProjects.reduce((sum, p) => sum + p.mealCount, 0);
  const totalLines = filteredProjects.reduce((sum, p) => sum + p.numberOfLines, 0);
  const open = filteredProjects.filter(p => p.applicationStatus === "open").length;
  const closed = filteredProjects.filter(p => p.applicationStatus === "closed").length;
  const applied = filteredProjects.filter(p => p.myStatus === "applied").length;
  const confirmed = filteredProjects.filter(p => p.myStatus === "confirmed").length;

  const cards = [
    ["Projects", filteredProjects.length],
    ["Open", open],
    ["Closed", closed],
    ["Applied", applied],
    ["Confirmed", confirmed],
    ["Meals", formatNumber(totalMeals)],
    ["Lines", formatNumber(totalLines)]
  ];

  $("#summaryGrid").innerHTML = cards.map(([label, value]) => `
    <div class="summary-card">
      <div class="label">${escapeHtml(label)}</div>
      <div class="value">${escapeHtml(value)}</div>
    </div>
  `).join("");
}

function aggregateByState() {
  const map = new Map();
  for (const project of filteredProjects) {
    const key = project.state || "Unknown";
    if (!map.has(key)) {
      map.set(key, { state: key, projects: [], meals: 0, lines: 0 });
    }
    const bucket = map.get(key);
    bucket.projects.push(project);
    bucket.meals += project.mealCount;
    bucket.lines += project.numberOfLines;
  }

  return [...map.values()].sort((a, b) => {
    const av = getBucketValue(a);
    const bv = getBucketValue(b);
    return bv - av || a.state.localeCompare(b.state);
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

function renderStateSummary() {
  const stateSummary = $("#stateSummary");
  const citySummary = $("#citySummary");
  const buckets = aggregateByState();

  if (!buckets.length) {
    stateSummary.className = "state-summary empty-state";
    stateSummary.textContent = "No states match the current filters.";
    citySummary.classList.add("hidden");
    return;
  }

  stateSummary.className = "state-summary";
  stateSummary.innerHTML = buckets.map(bucket => `
    <div class="state-card ${selectedState === bucket.state ? "selected" : ""}" data-state="${escapeHtml(bucket.state)}">
      <div class="state-code">${escapeHtml(bucket.state)}</div>
      <div class="state-count">${escapeHtml(bucketValueLabel(bucket))}</div>
      <div class="muted">${bucket.projects.filter(p => p.isWarehouse).length ? "Includes warehouse" : ""}</div>
    </div>
  `).join("");

  $$(".state-card").forEach(card => {
    card.addEventListener("click", () => {
      const state = card.dataset.state;
      selectedState = selectedState === state ? null : state;
      renderStateSummary();
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
  const stateProjects = filteredProjects.filter(project => project.state === state);

  for (const project of stateProjects) {
    const cityKey = project.isWarehouse ? "USH Warehouse / Longwood" : (project.city || "Unknown city");
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
    <h2>${escapeHtml(state)} city groups</h2>
    <div class="city-grid">
      ${buckets.map(bucket => `
        <div class="city-card">
          <div class="city-name">${escapeHtml(bucket.city)} ${bucket.hasWarehouse ? '<span class="warehouse-badge">Warehouse</span>' : ""}</div>
          <div class="city-meta">${escapeHtml(bucketValueLabel(bucket))}</div>
          <div class="city-meta">${escapeHtml(formatNumber(bucket.meals))} meals · ${escapeHtml(formatNumber(bucket.lines))} lines</div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderTable() {
  const tbody = $("#projectsTbody");
  $("#resultCount").textContent = `${filteredProjects.length} shown`;

  if (!filteredProjects.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No projects match the current filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredProjects.map(project => `
    <tr>
      <td>${statusPill(project)}</td>
      <td>
        <div class="project-name">${escapeHtml(project.name)} ${project.isWarehouse ? '<span class="warehouse-badge">Warehouse</span>' : ""}</div>
        <div class="project-desc">${escapeHtml(project.description).slice(0, 220)}${project.description.length > 220 ? "..." : ""}</div>
      </td>
      <td>
        <strong>${escapeHtml(project.city)}, ${escapeHtml(project.state)}</strong>
        ${project.address ? `<div class="muted">${escapeHtml(project.address)}</div>` : ""}
        <div class="muted">${escapeHtml(project.locationConfidence)}</div>
      </td>
      <td>
        <div>${escapeHtml(project.startDate || project.startTimestamp)}</div>
        <div class="muted">to ${escapeHtml(project.endDate || project.endTimestamp)}</div>
      </td>
      <td>
        <div>Travel: ${escapeHtml(project.travelDay || "—")}</div>
        <div>Event: ${escapeHtml(project.eventDay || "—")}</div>
        <div>Return: ${escapeHtml(project.returnDay || "—")}</div>
      </td>
      <td>
        <div>${escapeHtml(formatNumber(project.mealCount))}</div>
        <div class="muted">${escapeHtml(project.mealType || "")}</div>
      </td>
      <td>${escapeHtml(formatNumber(project.numberOfLines))}</td>
    </tr>
  `).join("");
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

function setData(events, myEvents, syncedAt) {
  rawEvents = events || [];
  rawMyEvents = myEvents || [];
  projects = mergeAndNormalize(rawEvents, rawMyEvents);
  filteredProjects = projects.filter(projectMatchesFilters);
  selectedState = null;
  setSyncStatus(`Synced ${new Date(syncedAt).toLocaleString()}`, "ok");
  renderAll();
}

function updateMyEvents(myEvents, syncedAt) {
  rawMyEvents = myEvents || [];
  projects = mergeAndNormalize(rawEvents, rawMyEvents);
  filteredProjects = projects.filter(projectMatchesFilters);
  setSyncStatus(`My apps refreshed ${new Date(syncedAt).toLocaleString()}`, "ok");
  renderAll();
}

async function sendToContentScript(type) {
  if (!activeTabId) throw new Error("No active Rosterfy tab found.");

  const response = await chrome.tabs.sendMessage(activeTabId, { type });
  if (!response?.ok) {
    throw new Error(response?.error || "Unknown extension message error.");
  }
  return response.payload;
}

async function syncAll() {
  setSyncStatus("Syncing...", "muted");
  try {
    const payload = await sendToContentScript("ROSTERFY_SYNC_ALL");
    setData(payload.events, payload.myEvents, payload.syncedAt);
  } catch (error) {
    console.error(error);
    setSyncStatus("Sync failed", "error");
    $("#tabStatus").innerHTML = `<span class="error">${escapeHtml(error.message)}</span>`;
  }
}

async function refreshMyApplications() {
  setSyncStatus("Refreshing my applications...", "muted");
  try {
    const payload = await sendToContentScript("ROSTERFY_REFRESH_MY_EVENTS");
    updateMyEvents(payload.myEvents, payload.syncedAt);
  } catch (error) {
    console.error(error);
    setSyncStatus("Refresh failed", "error");
    $("#tabStatus").innerHTML = `<span class="error">${escapeHtml(error.message)}</span>`;
  }
}

function toCsv(rows) {
  const headers = [
    "id", "name", "company", "city", "state", "isWarehouse", "address", "locationConfidence",
    "applicationStatus", "myStatus", "appliedByMe", "confirmedByMe", "myShiftAppliedCount", "myShiftConfirmedCount",
    "startDate", "startDay", "endDate", "endDay", "travelDay", "eventDay", "returnDay",
    "mealCount", "mealType", "numberOfLines", "hpFormNumber", "description"
  ];

  const escape = value => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [
    headers.join(","),
    ...rows.map(row => headers.map(header => escape(row[header])).join(","))
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
      : project.myStatus === "applied"
        ? "Applied"
        : project.applicationStatus === "open"
          ? "Open"
          : "Closed";

    const description = [
      `Status: ${label}`,
      `Application: ${project.applicationStatus}`,
      `My status: ${project.myStatus}`,
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
  filters.weekday = "";
  filters.weekdayType = "anyProjectDay";
  filters.search = "";
  selectedState = null;

  $("#weekdaySelect").value = "";
  $("#weekdayTypeSelect").value = "anyProjectDay";
  $("#searchInput").value = "";
  updateChipUi();
  applyFilters();
}

function wireEvents() {
  $("#openRosterfyBtn").addEventListener("click", () => chrome.tabs.create({ url: ROSTERFY_ORIGIN }));
  $("#syncAllBtn").addEventListener("click", syncAll);
  $("#refreshMyBtn").addEventListener("click", refreshMyApplications);
  $("#exportCsvBtn").addEventListener("click", exportCsv);
  $("#exportFilteredIcsBtn").addEventListener("click", exportFilteredIcs);
  $("#exportConfirmedIcsBtn").addEventListener("click", exportConfirmedIcs);
  $("#clearFiltersBtn").addEventListener("click", clearFilters);

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

  $("#searchInput").addEventListener("input", (event) => {
    filters.search = event.target.value;
    applyFilters();
  });

  $("#countModeSelect").addEventListener("change", (event) => {
    filters.countMode = event.target.value;
    renderStateSummary();
  });
}

async function init() {
  wireEvents();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTabId = tab?.id || null;

  const url = tab?.url ? new URL(tab.url) : null;
  const isRosterfy = url?.origin === ROSTERFY_ORIGIN;

  if (!isRosterfy) {
    $("#tabStatus").textContent = "Current tab is not US Hunger Rosterfy.";
    $("#notRosterfyPanel").classList.remove("hidden");
    $("#dashboard").classList.add("hidden");
    return;
  }

  $("#tabStatus").textContent = "Connected to US Hunger Rosterfy tab.";
  $("#notRosterfyPanel").classList.add("hidden");
  $("#dashboard").classList.remove("hidden");

  // One initial sync when opened on Rosterfy. After that, the user controls refresh manually.
  syncAll();
}

init().catch(error => {
  console.error(error);
  setSyncStatus("Init failed", "error");
  $("#tabStatus").innerHTML = `<span class="error">${escapeHtml(error.message)}</span>`;
});
