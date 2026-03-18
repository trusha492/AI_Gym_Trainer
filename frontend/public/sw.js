self.addEventListener("install", (event) => {
  self.skipWaiting(); // Activate worker immediately
  console.log("Service Worker Installed");
});

self.addEventListener("fetch", (event) => {
  event.waitUntil(clients.claim());
  // basic caching (optional)
});