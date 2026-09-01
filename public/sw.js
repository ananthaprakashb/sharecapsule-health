const CACHE_NAME = 'sharecapsule-health-v8'
const APP_SHELL = ['/', '/manifest.webmanifest', '/app-icon.svg', '/icon-192.png', '/icon-180.png']

self.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))) })
self.addEventListener('activate', (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('sharecapsule-health-') && key !== CACHE_NAME).map((key) => caches.delete(key))))); self.clients.claim() })
self.addEventListener('message', (event) => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting() })
self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => { if (response.ok) event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()))); return response }).catch(() => caches.match(request).then((cached) => cached || caches.match('/'))))
    return
  }
  event.respondWith(caches.match(request).then((cached) => { if (cached) return cached; return fetch(request).then((response) => { if (response.ok) event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()))); return response }) }))
})
self.addEventListener('notificationclick', (event) => { event.notification.close(); const target = event.notification.data?.url || '/#/routines'; event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => { const existing = clients.find((client) => 'focus' in client); if (existing) { existing.navigate(target); return existing.focus() } return self.clients.openWindow(target) })) })
