document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const oldIP = params.get("old");
  const newIP = params.get("new");
  const time = params.get("time");

  if (oldIP) document.getElementById("oldIP").textContent = oldIP;
  if (newIP) document.getElementById("newIP").textContent = newIP;
  if (time) {
    document.getElementById("changeTime").textContent = new Date(parseInt(time)).toLocaleString();
  }

  document.getElementById("dismissBtn").addEventListener("click", () => {
    window.close();
  });
});
