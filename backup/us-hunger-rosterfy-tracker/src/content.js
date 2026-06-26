(() => {
  const BASE_URL = "https://ushunger.rosterfy.com/api/v2";
  const EVENT_TYPE_ID = "503";

  function makeUpcomingEventsUrl(page, perPage) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("perPage", String(perPage));

    params.set("filter[0][attr]", "event_type_id");
    params.set("filter[0][operator]", "=");
    params.set("filter[0][value]", EVENT_TYPE_ID);

    // Upcoming/current only. Closed application opportunities are still included.
    params.set("filter[1][attr]", "end_timestamp");
    params.set("filter[1][operator]", ">=|empty");
    params.set("filter[1][value]", new Date().toISOString());

    params.set("sortBy[0]", "sort_order");
    params.set("sortBy[1]", "start_timestamp");
    params.set("sortOrder[0]", "asc");
    params.set("sortOrder[1]", "asc");
    params.set("sortDesc", "0");
    params.set("location", "0");
    params.set("with_count[0]", "shifts");

    return `${BASE_URL}/event?${params.toString()}`;
  }

  function makeMyEventsUrl(page, perPage) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("perPage", String(perPage));

    params.set("filter[0][attr]", "current_user.filter:event_user_active");
    params.set("filter[0][operator]", "=");
    params.set("filter[0][value]", "1");

    params.set("filter[1][attr]", "event_type_id");
    params.set("filter[1][operator]", "=");
    params.set("filter[1][value]", EVENT_TYPE_ID);

    params.set("extras[0]", "shift_count");
    params.set("sortBy", "created_at");
    params.set("sortOrder", "desc");
    params.set("with[0]", "current_user");

    return `${BASE_URL}/me/event?${params.toString()}`;
  }

  async function fetchPaged(makeUrl, perPage = 100) {
    const all = [];
    let page = 1;

    while (true) {
      const url = makeUrl(page, perPage);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Rosterfy API failed on page ${page}: ${response.status} ${response.statusText}. ${text.slice(0, 180)}`);
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
    const [events, myEvents] = await Promise.all([
      fetchPaged(makeUpcomingEventsUrl, 100),
      fetchPaged(makeMyEventsUrl, 100)
    ]);

    return {
      events,
      myEvents,
      syncedAt: new Date().toISOString()
    };
  }

  async function refreshMyEvents() {
    const myEvents = await fetchPaged(makeMyEventsUrl, 100);
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
