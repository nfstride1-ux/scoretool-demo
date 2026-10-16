/* Minimal pass-through service worker so Android can install the app and use the share target. No caching. v2026-10-16b-testers-help */
self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',()=>{});
