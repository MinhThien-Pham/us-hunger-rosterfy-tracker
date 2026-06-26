(() => {
  const ROSTERFY_ORIGIN = window.location.origin;
  const BASE_URL = `${ROSTERFY_ORIGIN}/api/v2`;
  const EVENT_TYPE_ID = "503";
  const FETCH_TIMEOUT_MS = 20000;

  function injectPageFetcher() {
    if (document.documentElement.dataset.usHungerRosterfyTrackerInjected === "true") return;
    document.documentElement.dataset.usHungerRosterfyTrackerInjected = "true";
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("src/page-fetcher.js");
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
  }

  injectPageFetcher();

  function toRosterfyDatetime(date = new Date()) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function toRosterfyIso(date = new Date()) {
    return date.toISOString().replace(/\.\d{3}Z$/, "Z");
  }

  function absoluteRosterfyUrl(url) {
    return new URL(url, ROSTERFY_ORIGIN).href;
  }

  function addOrSetPage(url, page) {
    const u = new URL(url, ROSTERFY_ORIGIN);
    u.searchParams.set("page", String(page));
    return u.href;
  }

  function pageFetchJson(url, requestOptions = {}) {
    injectPageFetcher();
    const requestId = `usht_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        window.removeEventListener("message", onMessage);
        reject(new Error(`Page fetch timed out. URL: ${url}`));
      }, FETCH_TIMEOUT_MS);

      function onMessage(event) {
        if (event.source !== window) return;
        const data = event.data || {};
        if (data.source !== "US_HUNGER_TRACKER_PAGE" || data.type !== "FETCH_JSON_RESULT" || data.requestId !== requestId) return;

        clearTimeout(timeout);
        window.removeEventListener("message", onMessage);

        if (!data.ok) {
          const error = new Error(`HTTP ${data.status} ${data.statusText || ""}. URL: ${data.url || url}. ${String(data.text || "").slice(0, 240)}`);
          error.status = data.status;
          error.url = data.url || url;
          error.body = data.text || "";
          reject(error);
          return;
        }

        if (!data.json || typeof data.json !== "object") {
          const error = new Error(`Response was not JSON. URL: ${data.url || url}. ${String(data.text || "").slice(0, 240)}`);
          error.status = data.status;
          error.url = data.url || url;
          error.body = data.text || "";
          reject(error);
          return;
        }

        resolve(data.json);
      }

      window.addEventListener("message", onMessage);
      window.postMessage({
        source: "US_HUNGER_TRACKER_CONTENT",
        type: "FETCH_JSON",
        requestId,
        url: absoluteRosterfyUrl(url),
        method: requestOptions.method || "GET",
        bodyKind: requestOptions.bodyKind || "",
        fields: requestOptions.fields || {}
      }, "*");
    });
  }

  async function contentFetchJson(url, requestOptions = {}) {
    const headers = {
      "Accept": "application/json, text/plain, */*",
      "X-Requested-With": "XMLHttpRequest"
    };
    const fetchOptions = {
      method: requestOptions.method || "GET",
      credentials: "include",
      headers
    };

    if (fetchOptions.method !== "GET") {
      if (requestOptions.bodyKind === "formData") {
        const formData = new FormData();
        for (const [key, value] of Object.entries(requestOptions.fields || {})) {
          formData.append(key, value);
        }
        fetchOptions.body = formData;
      } else if (requestOptions.fields && Object.keys(requestOptions.fields).length) {
        headers["Content-Type"] = "application/json";
        fetchOptions.body = JSON.stringify(requestOptions.fields);
      }
    }

    const response = await fetch(absoluteRosterfyUrl(url), fetchOptions);

    const text = await response.text().catch(() => "");
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status} ${response.statusText}. URL: ${url}. ${text.slice(0, 240)}`);
      error.status = response.status;
      error.url = url;
      error.body = text;
      throw error;
    }

    try {
      return text ? JSON.parse(text) : null;
    } catch (_error) {
      const error = new Error(`Response was not JSON. URL: ${url}. ${text.slice(0, 240)}`);
      error.status = response.status;
      error.url = url;
      error.body = text;
      throw error;
    }
  }

  async function fetchJson(url, requestOptions = {}) {
    // Page-context fetch is closer to what works in DevTools Console/Rosterfy itself.
    // If it fails because the injected bridge has not loaded yet, fall back to content-script fetch.
    try {
      return await pageFetchJson(url, requestOptions);
    } catch (pageError) {
      try {
        return await contentFetchJson(url, requestOptions);
      } catch (_contentError) {
        throw pageError;
      }
    }
  }

  function eventUrlCandidates(page, perPage, overrideUrl) {
    if (overrideUrl) return [addOrSetPage(overrideUrl, page)];

    const now = new Date();
    const nowLocal = toRosterfyDatetime(now);
    const nowIso = toRosterfyIso(now);

    return [
      [
        `${BASE_URL}/event?page=${encodeURIComponent(String(page))}`,
        `perPage=${encodeURIComponent(String(perPage))}`,
        `filter[0][attr]=event_type_id`,
        `filter[0][operator]=%3D`,
        `filter[0][value]=${encodeURIComponent(EVENT_TYPE_ID)}`,
        `filter[1][attr]=end_timestamp`,
        `filter[1][operator]=%3E%3D%7Cempty`,
        `filter[1][datetime]=${encodeURIComponent(nowLocal)}`,
        `filter[1][value]=${encodeURIComponent(nowIso)}`,
        `sortBy[0]=sort_order`,
        `sortBy[1]=start_timestamp`,
        `sortOrder[0]=asc`,
        `sortOrder[1]=asc`,
        `sortDesc=0`,
        `location=0`,
        `with_count[0]=shifts`
      ].join("&"),
      `${BASE_URL}/event?page=${encodeURIComponent(String(page))}&perPage=${encodeURIComponent(String(perPage))}&filter[0][attr]=event_type_id&filter[0][operator]=%3D&filter[0][value]=${encodeURIComponent(EVENT_TYPE_ID)}`,
      `${BASE_URL}/event?page=${encodeURIComponent(String(page))}&filter[0][attr]=event_type_id&filter[0][value]=${encodeURIComponent(EVENT_TYPE_ID)}`,
      [
        `${BASE_URL}/event?page=${encodeURIComponent(String(page))}`,
        `perPage=${encodeURIComponent(String(perPage))}`,
        `filter[0][attr]=event_type_id`,
        `filter[0][operator]=%3D`,
        `filter[0][value]=${encodeURIComponent(EVENT_TYPE_ID)}`,
        `sortBy[0]=sort_order`,
        `sortBy[1]=start_timestamp`,
        `sortOrder[0]=asc`,
        `sortOrder[1]=asc`,
        `sortDesc=0`,
        `location=0`,
        `with_count[0]=shifts`
      ].join("&"),
      [
        `${BASE_URL}/event?page=${encodeURIComponent(String(page))}`,
        `perPage=${encodeURIComponent(String(perPage))}`,
        `filter[0][attr]=event_type_id`,
        `filter[0][operator]=%3D`,
        `filter[0][value]=${encodeURIComponent(EVENT_TYPE_ID)}`,
        `filter[1][attr]=end_timestamp`,
        `filter[1][operator]=%3E%3D%7Cempty`,
        `filter[1][value]=${encodeURIComponent(nowLocal)}`,
        `sortBy[0]=sort_order`,
        `sortBy[1]=start_timestamp`,
        `sortOrder[0]=asc`,
        `sortOrder[1]=asc`,
        `sortDesc=0`,
        `location=0`,
        `with_count[0]=shifts`
      ].join("&")
    ];
  }


  function promotedEventsUrlCandidates(page, perPage, overrideUrl) {
    // Rosterfy dashboard uses promoted=1 for promoted events.
    // This is a project flag only; it is not the user's Pending/Confirm status.
    const nowIso = toRosterfyIso(new Date());
    return [
      [
        `${BASE_URL}/event?page=${encodeURIComponent(String(page))}`,
        `perPage=${encodeURIComponent(String(perPage))}`,
        `filter[0][attr]=end_timestamp`,
        `filter[0][operator]=%3E%7Cempty`,
        `filter[0][value]=${encodeURIComponent(nowIso)}`,
        `filter[1][attr]=promoted`,
        `filter[1][operator]=%3D`,
        `filter[1][value]=1`,
        `sortBy[0]=sort_order`,
        `sortBy[1]=start_timestamp`,
        `sortOrder[0]=asc`,
        `sortOrder[1]=asc`,
        `sortDesc=0`,
        `location=0`,
        `with_count[0]=shifts`
      ].join("&")
    ];
  }

  function myShiftsUrlCandidates(page, perPage, _overrideUrl) {
    // Dashboard "Upcoming Shifts" endpoint. This is the source of truth for
    // shift-level statuses and the shift id needed by /event/shift/{shiftId}/confirm.
    return [
      [
        `${BASE_URL}/me/event/shift?with[0]=shift_type`,
        `with[1][0]=family_shift_users`,
        `with[1][1]=20`,
        `attention=1`,
        `page=${encodeURIComponent(String(page))}`,
        `perPage=${encodeURIComponent(String(perPage))}`,
        `no_count=1`,
        `sortBy[0]=start_timestamp`,
        `sortBy[1]=event_shift.id`,
        `sortOrder[0]=asc`,
        `sortOrder[1]=asc`,
        `extras[0]=upcoming_shift_attributes`,
        `extras[1]=maps`
      ].join("&")
    ];
  }

  function myEventsUrlCandidates(page, perPage, overrideUrl) {
    if (overrideUrl) return [addOrSetPage(overrideUrl, page)];

    return [
      [
        `${BASE_URL}/me/event?filter[0][attr]=current_user.filter%3Aevent_user_active`,
        `filter[0][operator]=%3D`,
        `filter[0][value]=1`,
        `filter[1][attr]=event_type_id`,
        `filter[1][operator]=%3D`,
        `filter[1][value]=${encodeURIComponent(EVENT_TYPE_ID)}`,
        `status=`,
        `page=${encodeURIComponent(String(page))}`,
        `perPage=${encodeURIComponent(String(perPage))}`,
        `extras[0]=shift_count`,
        `sortBy=created_at`,
        `sortOrder=desc`,
        `with[0]=current_user`
      ].join("&"),
      `${BASE_URL}/me/event?page=${encodeURIComponent(String(page))}&perPage=${encodeURIComponent(String(perPage))}`,
      [
        `${BASE_URL}/me/event?page=${encodeURIComponent(String(page))}`,
        `perPage=${encodeURIComponent(String(perPage))}`,
        `filter[0][attr]=current_user.filter%3Aevent_user_active`,
        `filter[0][operator]=%3D`,
        `filter[0][value]=1`,
        `filter[1][attr]=event_type_id`,
        `filter[1][operator]=%3D`,
        `filter[1][value]=${encodeURIComponent(EVENT_TYPE_ID)}`,
        `extras[0]=shift_count`,
        `sortBy=created_at`,
        `sortOrder=desc`,
        `with[0]=current_user`
      ].join("&")
    ];
  }

  async function fetchPagedWithCandidates(makeCandidateUrls, perPage, label, overrideUrl) {
    const all = [];
    let page = 1;
    let json = null;
    let workingUrl = "";
    const errors = [];

    for (const candidateUrl of makeCandidateUrls(page, perPage, overrideUrl)) {
      try {
        json = await fetchJson(candidateUrl);
        workingUrl = candidateUrl;
        break;
      } catch (error) {
        errors.push(`${error.status || "ERR"}: ${candidateUrl}`);
      }
    }

    if (!json) {
      throw new Error(`${label} failed. Tried ${errors.length} URL variant(s). First errors: ${errors.slice(0, 3).join(" | ")}`);
    }

    while (true) {
      const data = Array.isArray(json.data) ? json.data : [];
      all.push(...data);

      if (!json.next_page_url || data.length === 0) break;
      page += 1;

      if (page > 50) {
        throw new Error(`Stopped ${label} after 50 pages to avoid accidental excessive requests.`);
      }

      workingUrl = absoluteRosterfyUrl(json.next_page_url);
      json = await fetchJson(workingUrl);
    }

    return { data: all, workingUrl };
  }

  async function fetchPromotedEvents() {
    try {
      const promotedResult = await fetchPagedWithCandidates(promotedEventsUrlCandidates, 6, "Rosterfy promoted/upcoming shifts API", "");
      return { data: promotedResult.data, warning: "" };
    } catch (error) {
      return { data: [], warning: error.message };
    }
  }

  async function fetchMyShifts() {
    try {
      const result = await fetchPagedWithCandidates(myShiftsUrlCandidates, 50, "Rosterfy my upcoming shifts API", "");
      return { data: result.data, warning: "" };
    } catch (error) {
      return { data: [], warning: error.message };
    }
  }

  async function confirmShift(shiftId) {
    if (!shiftId) throw new Error("Missing shift id.");
    const url = `${BASE_URL}/event/shift/${encodeURIComponent(String(shiftId))}/confirm`;
    return fetchJson(url, {
      method: "POST",
      bodyKind: "formData",
      fields: {}
    });
  }

  async function syncAll(options = {}) {
    const eventsResult = await fetchPagedWithCandidates(eventUrlCandidates, 12, "Rosterfy events API", options.eventUrl || "");
    let myEvents = [];
    let myEventsWarning = "";

    try {
      const myEventsResult = await fetchPagedWithCandidates(myEventsUrlCandidates, 10, "Rosterfy my events API", options.myEventsUrl || "");
      myEvents = myEventsResult.data;
    } catch (error) {
      myEventsWarning = error.message;
    }

    const promotedEventsResult = await fetchPromotedEvents();
    const myShiftsResult = await fetchMyShifts();

    return {
      events: eventsResult.data,
      myEvents,
      pendingEvents: promotedEventsResult.data, // legacy field name; contains promoted=1 events
      myShifts: myShiftsResult.data,
      myEventsWarning,
      pendingEventsWarning: promotedEventsResult.warning,
      myShiftsWarning: myShiftsResult.warning,
      debug: {
        eventsWorkingUrl: eventsResult.workingUrl
      },
      syncedAt: new Date().toISOString()
    };
  }

  async function refreshMyEvents(options = {}) {
    const myEventsResult = await fetchPagedWithCandidates(myEventsUrlCandidates, 10, "Rosterfy my events API", options.myEventsUrl || "");
    const promotedEventsResult = await fetchPromotedEvents();
    const myShiftsResult = await fetchMyShifts();
    return {
      myEvents: myEventsResult.data,
      pendingEvents: promotedEventsResult.data, // legacy field name; contains promoted=1 events
      myShifts: myShiftsResult.data,
      pendingEventsWarning: promotedEventsResult.warning,
      myShiftsWarning: myShiftsResult.warning,
      debug: {
        myEventsWorkingUrl: myEventsResult.workingUrl
      },
      syncedAt: new Date().toISOString()
    };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || !message.type) return false;

    if (message.type === "ROSTERFY_SYNC_ALL") {
      syncAll(message.payload || {})
        .then(payload => sendResponse({ ok: true, payload }))
        .catch(error => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "ROSTERFY_REFRESH_MY_EVENTS") {
      refreshMyEvents(message.payload || {})
        .then(payload => sendResponse({ ok: true, payload }))
        .catch(error => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "ROSTERFY_CONFIRM_SHIFT") {
      confirmShift(message.payload?.shiftId)
        .then(payload => sendResponse({ ok: true, payload }))
        .catch(error => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    return false;
  });
})();
