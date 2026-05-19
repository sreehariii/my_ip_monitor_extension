const CHECK_INTERVAL_MINUTES = 10;
const API_URL = "https://secopstools.org/api/myip";

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("checkIP", { periodInMinutes: CHECK_INTERVAL_MINUTES });
  checkIP();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkIP") {
    checkIP();
  }
});

async function checkIP() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch IP");
    const data = await response.json();
    const currentIP = data.ip;

    const result = await chrome.storage.local.get(["lastIP", "history"]);
    const lastIP = result.lastIP;
    const history = result.history || [];

    if (lastIP && lastIP !== currentIP) {
      // IP changed!
      history.unshift({
        oldIP: lastIP,
        newIP: currentIP,
        timestamp: Date.now()
      });

      // Keep only last 20 changes
      if (history.length > 20) history.length = 20;

      await chrome.storage.local.set({
        lastIP: currentIP,
        history: history,
        lastCheck: Date.now(),
        changed: true
      });

      // Show notification
      chrome.notifications.create("ip-changed", {
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: "IP Address Changed!",
        message: `Your IP changed from ${lastIP} to ${currentIP}`,
        priority: 2
      });

      // Open alert popup window
      const alertUrl = chrome.runtime.getURL(
        `alert.html?old=${encodeURIComponent(lastIP)}&new=${encodeURIComponent(currentIP)}&time=${Date.now()}`
      );
      chrome.windows.create({
        url: alertUrl,
        type: "popup",
        width: 520,
        height: 380,
        focused: true
      });

      // Set badge
      chrome.action.setBadgeText({ text: "!" });
      chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
    } else {
      await chrome.storage.local.set({
        lastIP: currentIP,
        lastCheck: Date.now()
      });
    }
  } catch (error) {
    console.error("IP check failed:", error);
  }
}

// Clear badge when popup is opened
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "popupOpened") {
    chrome.action.setBadgeText({ text: "" });
    chrome.storage.local.set({ changed: false });
  }
});
