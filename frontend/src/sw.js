self.__precacheManifest = [].concat(self.__precacheManifest || []);

const isNav = event => event.request.mode === 'navigate';

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
        ],
    })
);

workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.setCatchHandler(({ event }) => {
    if (isNav(event))
        return caches.match(workbox.precaching.getCacheKeyForURL('/index.html'));
    return Response.error();
});

// Custom part

// Arbeitszeiten API-Anfragen mit Workbox Background Sync speichern und senden, wenn das Gerät wieder online ist, dann Benachrichtigung anzeigen
// 1. Quelle: https://jgw96.github.io/blog/2018/07/29/Easy-Background-Sync-with-Workbox/ (veralteter Callback)
// 2. Quelle: https://developers.google.com/web/tools/workbox/reference-docs/latest/workbox.backgroundSync.Queue
const bgSyncQueueName = 'zeiterfassungBgSyncQueue';
// Benachrichtungsberechtigung muss zuerst vom Benutzer eingeholt werden. Dies geschieht, wenn der Benutzer
// das erste mal eine Arbeitszeit anlegen möchte
const showNotification = () => {
    console.log('Show notification');

    self.registration.showNotification('Arbeitszeiten übertragen', {
        body: 'Das Gerät ist wieder online. Deine Arbeitszeiten wurden erfolgreich übertragen!',
        icon: 'assets/icons/android-chrome-512x512.png',
        badge: 'assets/icons/favicon-32x32.png'
    });
};
const bgSyncPlugin = new workbox.backgroundSync.Plugin(bgSyncQueueName, {
    maxRetentionTime: 24 * 60, // Retry for max of 24 Hours
    onSync: async queue => {
        console.log('Queue', queue);
        try {
            await queue.replayRequests();
            showNotification();
        } catch (error) {
            showNotification();
            console.log(error);
        }
    }
});
// POST-Anfragen an den /working-time API-Endpunkt abfangen und speichern, wenn die Anwendung offline ist
workbox.routing.registerRoute(
    'https://zeiterfassung.moritzellmers.de/api/working-time',
    workbox.strategies.networkOnly({
        plugins: [bgSyncPlugin]
    }),
    'POST'
);
