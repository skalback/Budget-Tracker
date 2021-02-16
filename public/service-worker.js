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
    if (event.request.url.includes("/api/") && event.request.method !== "GET") {
        event.respondWith(
          caches.open(RUNTIME_CACHE)
            .then(cache => {
               return fetch(event.request)
                .then(response =>{
                    cache.put(event.request, response.clone());
                    return response;
                })
                .catch(() => caches.match(event.request))
                });
            
            return;
        }
    event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
    
                return caches
                    .open(RUNTIME_CACHE)
                    .then(cache =>
                        fetch(event.request).then(response =>
                            cache.put(event.request, response.clone()).then(() => response)
                        )
                    );
            })
        );
    });