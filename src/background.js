const ROSTERFY_ORIGIN = "https://ushunger.rosterfy.com";

async function findRosterfyTab(activeTab) {
  try {
    if (activeTab?.url && new URL(activeTab.url).origin === ROSTERFY_ORIGIN) {
      return activeTab;
    }
  } catch (_) {}

  const rosterfyTabs = await chrome.tabs.query({ url: `${ROSTERFY_ORIGIN}/*` });
  if (rosterfyTabs.length) {
    return rosterfyTabs.find(tab => tab.active) || rosterfyTabs[0];
  }

  return null;
}

async function openOrFocusDashboard(rosterfyTab) {
  const baseUrl = chrome.runtime.getURL("src/dashboard.html");
  const dashboardUrl = `${baseUrl}?tabId=${encodeURIComponent(rosterfyTab.id)}`;

  const tabs = await chrome.tabs.query({});
  const existing = tabs.find(tab => tab.url?.startsWith(baseUrl));

  if (existing?.id) {
    await chrome.tabs.update(existing.id, { url: dashboardUrl, active: true });
    if (existing.windowId) await chrome.windows.update(existing.windowId, { focused: true });
    return;
  }

  await chrome.tabs.create({ url: dashboardUrl });
}

chrome.action.onClicked.addListener(async (activeTab) => {
  const rosterfyTab = await findRosterfyTab(activeTab);

  if (!rosterfyTab) {
    await chrome.tabs.create({ url: `${ROSTERFY_ORIGIN}/portal/dashboard` });
    return;
  }

  await openOrFocusDashboard(rosterfyTab);
});
