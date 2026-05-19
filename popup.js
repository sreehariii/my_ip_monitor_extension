document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({ action: "popupOpened" });
  loadData();

  document.getElementById("refreshBtn").addEventListener("click", refreshIP);
});

async function loadData() {
  const result = await chrome.storage.local.get(["lastIP", "lastCheck", "history", "changed"]);

  if (result.lastIP) {
    document.getElementById("currentIP").textContent = result.lastIP;
  }

  if (result.lastCheck) {
    document.getElementById("lastCheck").textContent = `Last checked: ${timeAgo(result.lastCheck)}`;
  }

  if (result.changed) {
    const statusBar = document.getElementById("statusBar");
    statusBar.classList.add("changed");
    document.getElementById("statusText").textContent = "IP Changed!";
  }

  renderHistory(result.history || []);
}

function renderHistory(history) {
  const container = document.getElementById("historyList");

  if (history.length === 0) {
    container.innerHTML = '<p class="empty-state">No changes detected yet</p>';
    return;
  }

  container.innerHTML = history.map(entry => `
    <div class="history-item">
      <div class="change-ips">
        <span class="old-ip">${escapeHtml(entry.oldIP)}</span>
        <span class="arrow">→</span>
        <span class="new-ip">${escapeHtml(entry.newIP)}</span>
      </div>
      <div class="change-time">${formatDate(entry.timestamp)}</div>
    </div>
  `).join("");
}

async function refreshIP() {
  const btn = document.getElementById("refreshBtn");
  btn.classList.add("spinning");
  btn.disabled = true;

  try {
    const response = await fetch("https://secopstools.org/api/myip");
    if (!response.ok) throw new Error("Failed");
    const data = await response.json();
    const currentIP = data.ip;

    const result = await chrome.storage.local.get(["lastIP", "history"]);
    const lastIP = result.lastIP;
    const history = result.history || [];

    if (lastIP && lastIP !== currentIP) {
      history.unshift({
        oldIP: lastIP,
        newIP: currentIP,
        timestamp: Date.now()
      });
      if (history.length > 20) history.length = 20;

      await chrome.storage.local.set({
        lastIP: currentIP,
        history: history,
        lastCheck: Date.now(),
        changed: true
      });
    } else {
      await chrome.storage.local.set({
        lastIP: currentIP,
        lastCheck: Date.now()
      });
    }

    loadData();
  } catch (e) {
    document.getElementById("currentIP").textContent = "Error fetching IP";
  } finally {
    btn.classList.remove("spinning");
    btn.disabled = false;
  }
}

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
