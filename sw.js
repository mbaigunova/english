const CACHE_NAME = 'wordbox-v2'
const ASSETS = ['./', './index.html', './manifest.json']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Сначала сеть (чтобы приходили обновления), если интернета нет — из кэша
self.addEventListener('fetch', e => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.hostname === 'api.anthropic.com') return

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copy = res.clone()
          caches.open(CACHE_NAME).then(c => c.put(req, copy))
        }
        return res
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  )
})
