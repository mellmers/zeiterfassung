self.__precacheManifest = [].concat(self.__precacheManifest || []);

const isNav = event => event.request.mode === 'navigate',
    bgSyncQueueName = 'zeiterfassungBgSyncQueue';

/**
 * Adding this before `precacheAndRoute` lets us handle all
 * the navigation requests even if they are in precache.
 */
workbox.routing.registerRoute(
    ({ event }) => isNav(event),
    new workbox.strategies.NetworkFirst({
        // this cache is plunged with every new service worker deploy so we dont need to care about purging the cache.
        cacheName: workbox.core.cacheNames.precache,
        networkTimeoutSeconds: 5, // if u dont start getting headers within 5 sec fallback to cache.
        plugins: [
            new workbox.cacheableResponse.Plugin({
                statuses: [200], // only cache valid responses, not opaque responses e.g. wifi portal.
            }),
            new workbox.backgroundSync.Plugin(bgSyncQueueName, {
                maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
            }),
        ],
    })
);

workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.setCatchHandler(({ event }) => {
    if (isNav(event))
        return caches.match(workbox.precaching.getCacheKeyForURL('/index.html'));
    return Response.error();
});

const queue = new workbox.backgroundSync.Queue(bgSyncQueueName);

self.addEventListener('fetch', (event) => {
    // Clone the request to ensure it's safe to read when
    // adding to the Queue.
    const promiseChain = fetch(event.request.clone())
        .catch((err) => {
            console.log('SW sync:', event, event.request);
            return queue.pushRequest({request: event.request});
        });

    event.waitUntil(promiseChain);
});
