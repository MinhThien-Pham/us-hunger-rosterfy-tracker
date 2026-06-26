(() => {
  if (window.__usHungerRosterfyTrackerPageFetcher) return;
  window.__usHungerRosterfyTrackerPageFetcher = true;

  function collectStorageValues(storage) {
    const values = [];
    if (!storage) return values;
    try {
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i);
        if (!key) continue;
        const value = storage.getItem(key);
        if (value) values.push(value);
      }
    } catch (_error) {
      // Some storage access can fail depending on browser/site settings.
    }
    return values;
  }

  function decodeJwtPayload(token) {
    try {
      const part = token.split(".")[1];
      if (!part) return null;
      const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
      return JSON.parse(atob(padded));
    } catch (_error) {
      return null;
    }
  }

  function findBearerToken() {
    const values = [
      ...collectStorageValues(window.localStorage),
      ...collectStorageValues(window.sessionStorage)
    ];

    // Rosterfy's app uses an Authorization: Bearer <jwt> header. The token is
    // usually stored somewhere in page storage, not as a normal cookie. We only
    // read it inside this page and never send it back to the extension UI.
    const jwtRegex = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
    const candidates = [];

    for (const value of values) {
      const matches = String(value).match(jwtRegex) || [];
      for (const token of matches) {
        const payload = decodeJwtPayload(token);
        candidates.push({ token, payload, length: token.length });
      }
    }

    if (!candidates.length) return "";

    // Prefer a token that looks like the Rosterfy API access token. Otherwise,
    // use the longest JWT found, which is usually the access token rather than
    // an analytics/session helper token.
    candidates.sort((a, b) => {
      const aScore = (a.payload?.scopes ? 100 : 0) + (a.payload?.aud ? 10 : 0) + a.length;
      const bScore = (b.payload?.scopes ? 100 : 0) + (b.payload?.aud ? 10 : 0) + b.length;
      return bScore - aScore;
    });

    return candidates[0].token;
  }

  function findRosterfySessionId() {
    const values = [
      ...collectStorageValues(window.localStorage),
      ...collectStorageValues(window.sessionStorage)
    ];

    for (const value of values) {
      const str = String(value);
      const direct = str.match(/rosterfy[-_]?session[-_]?id["'\s:=]+([a-f0-9]{16,64})/i);
      if (direct) return direct[1];

      const hex = str.match(/[a-f0-9]{32}/i);
      if (hex && /session/i.test(str)) return hex[0];
    }

    return "";
  }

  function makeRosterfyHeaders() {
    const headers = {
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "Rosterfy-Platform": "portal",
      "Rosterfy-Path": window.location.pathname || "/portal/event/type/503/list"
    };

    const token = findBearerToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const sessionId = findRosterfySessionId();
    if (sessionId) headers["Rosterfy-Session-Id"] = sessionId;

    return headers;
  }

  window.addEventListener("message", async (event) => {
    if (event.source !== window) return;
    const data = event.data || {};
    if (data.source !== "US_HUNGER_TRACKER_CONTENT" || data.type !== "FETCH_JSON") return;

    const { requestId, url, method = "GET", bodyKind = "", fields = {} } = data;
    try {
      const headers = makeRosterfyHeaders();
      const fetchOptions = {
        method,
        credentials: "include",
        headers
      };

      if (method !== "GET") {
        if (bodyKind === "formData") {
          const formData = new FormData();
          for (const [key, value] of Object.entries(fields || {})) {
            formData.append(key, value);
          }
          fetchOptions.body = formData;
        } else if (fields && Object.keys(fields).length) {
          headers["Content-Type"] = "application/json";
          fetchOptions.body = JSON.stringify(fields);
        }
      }

      const response = await fetch(url, fetchOptions);

      const text = await response.text();
      let json = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch (_error) {
        json = null;
      }

      window.postMessage({
        source: "US_HUNGER_TRACKER_PAGE",
        type: "FETCH_JSON_RESULT",
        requestId,
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        text,
        json
      }, "*");
    } catch (error) {
      window.postMessage({
        source: "US_HUNGER_TRACKER_PAGE",
        type: "FETCH_JSON_RESULT",
        requestId,
        ok: false,
        status: 0,
        statusText: "FETCH_ERROR",
        url,
        text: error?.message || String(error),
        json: null
      }, "*");
    }
  });
})();
