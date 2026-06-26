(() => {
  const BASE_URL = "https://ushunger.rosterfy.com/api/v2";
  const EVENT_TYPE_ID = "503";

  function toRosterfyDatetime(date = new Date()) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function makeUpcomingEventsUrl(page, perPage) {
    const now = new Date();
    // Keep this close to the URL Rosterfy's own UI generates. Some Rosterfy filters are picky.
    const parts = [
      `page=${encodeURIComponent(String(page))}`,
      `perPage=${encodeURIComponent(String(perPage))}`,
      `filter[0][attr]=event_type_id`,
      `filter[0][operator]=%3D`,
      `filter[0][value]=${encodeURIComponent(EVENT_TYPE_ID)}`,
      `filter[1][attr]=end_timestamp`,
      `filter[1][operator]=%3E%3D%7Cempty`,
      `filter[1][datetime]=${encodeURIComponent(toRosterfyDatetime(now))}`,
      `filter[1][value]=${encodeURIComponent(now.toISOString())}`,
      `sortBy[0]=sort_order`,
      `sortBy[1]=start_timestamp`,
      `sortOrder[0]=asc`,
      `sortOrder[1]=asc`,
      `sortDesc=0`,
      `location=0`,
      `with_count[0]=shifts`
    ];

    return `${BASE_URL}/event?${parts.join("&")}`;
  }

  function makeMyEventsUrl(page, perPage) {
    // This intentionally includes status= and matches the order captured from Rosterfy Network.
    const parts = [
      `filter[0][attr]=current_user.filter%3Aevent_user_active`,
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
    ];

    return `${BASE_URL}/me/event?${parts.join("&")}`;
  }

  async function fetchPaged(makeUrl, perPage) {
    const all = [];
    let page = 1;

    while (true) {
      const url = makeUrl(page, perPage);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json, text/plain, */*",
          "X-Requested-With": "XMLHttpRequest"
        }
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Rosterfy API failed on page ${page}: ${response.status} ${response.statusText}. URL: ${url}. ${text.slice(0, 240)}`);
      }

      const json = await response.json();
      const data = Array.isArray(json.data) ? json.data : [];
      all.push(...data);

      if (!json.next_page_url || data.length === 0) break;
      page += 1;

      if (page > 50) {
        throw new Error("Stopped after 50 pages to avoid accidental excessive requests.");
      }
    }

    return all;
  }

  async function syncAll() {
    const events = await fetchPaged(makeUpcomingEventsUrl, 12);
    let myEvents = [];

    try {
      myEvents = await fetchPaged(makeMyEventsUrl, 10);
    } catch (error) {
      // Keep the dashboard useful even if the personal endpoint is unavailable.
      // The popup will show a warning via the payload.
      return {
        events,
        myEvents: [],
        myEventsWarning: error.message,
        syncedAt: new Date().toISOString()
      };
    }

    return {
      events,
      myEvents,
      syncedAt: new Date().toISOString()
    };
  }

  async function refreshMyEvents() {
    const myEvents = await fetchPaged(makeMyEventsUrl, 10);
    return {
      myEvents,
      syncedAt: new Date().toISOString()
    };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || !message.type) return false;

    if (message.type === "ROSTERFY_SYNC_ALL") {
      syncAll()
        .then(payload => sendResponse({ ok: true, payload }))
        .catch(error => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "ROSTERFY_REFRESH_MY_EVENTS") {
      refreshMyEvents()
        .then(payload => sendResponse({ ok: true, payload }))
        .catch(error => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    return false;
  });
})();
