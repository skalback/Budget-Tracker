const FILES_TO_CACHE = [
    '/',
    '/index.html',
    "/assets/css/styles.css",
    "/assets/js/index.js",
    "/assets/js/indexed_db.js",
    "/assets/images/icons/icon-192x192.png",
    "/assets/images/icons/icon-512x512.png",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
];

const STATIC_CACHE = 'static-cache-v1';
const RUNTIME_CACHE = `runtime-cache`;

self.addEventListener(`install`, event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener(`activate`, event => {
    const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
    event.waitUntil(
        caches.keys()
            .then((keylist) => {
                return Promise.all(
                    keyList.map((key) => {
                     if (key !== currentCaches) {
                        return caches.delete(key);
                          }
                    })
                  );
                })
            .then(() => self.clients.claim())
              );
            
            });

self.addEventListener(`fetch`, event => {
    if (event.request.url.includes("/api/transaction")) {
        event.respondWith(
          caches.open(RUNTIME_CACHE)
            .then(cache => {
               return fetch(event.request)
                .then(response =>{
                    cache.put(event.request.url, response.clone());
                    return response;
                })
                .catch(err => {
                    caches.match(event.request))
                });
            
            return;
        }
        event.respondWith(
            caches
                .open(STATIC_CACHE)
                .then(cache => {
                    return cache.match(event.request)
                        .then((response) => {
                            return response || fetch(event.request);
                        })
                })
        );
    });
    