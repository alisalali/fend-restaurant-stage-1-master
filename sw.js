
// Static cache name version.
const staticCacheName = 'restaurant-reviews-v1';

// Assets array to cache 
const urlsToCache = [
  '/',
  '/index.html',
  '/restaurant.html',
  'css/styles.css',
  'data/restaurants.json',
  'img/1.jpg',
  'img/2.jpg',
  'img/3.jpg',
  'img/4.jpg',
  'img/5.jpg',
  'img/6.jpg',
  'img/7.jpg',
  'img/8.jpg',
  'img/9.jpg',
  'img/10.jpg',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js',
  'js/sw_reg.js',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
  'https://cdnjs.cloudflare.com/ajax/libs/vanilla-lazyload/8.10.0/lazyload.min.js'
];

// Define a callback for the install event and decide which files you want to cache
self.addEventListener('install', function (event) {
  // Install serviceworker steps
  event.waitUntil(
    caches.open(staticCacheName)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

/*  
* Function will occur in the activate callback is cache management.
* The activate callback will to wipe out any old caches in the install step, any old service worker, 
* which keeps control of all the current pages, will suddenly stop being able to serve files from that cache.
*/

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (cacheName) {
          return cacheName.startsWith('restaurant-reviews-') &&
            cacheName != staticCacheName;
        }).map(function (cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

/*
*  Defined fetch event and within event.respondWith(), we pass in a promise from caches.match().
*  This method looks at the request and finds any cached results from any of the caches your service worker created.
*  If we have a matching response, we return the cached value, otherwise we return the result of a call to fetch,
*  which will make a network request and return the data if anything can be retrieved from the network.
*/
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(function (response) {
        // Cache hit - return response
        if (response) {

          return response;
        }

        return fetch(event.request).then(
          function (response) {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(staticCacheName)
              .then(function (cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});