import LocalDB from './LocalDB';

export function updateCurrentUser(currentUser) {
    LocalDB.currentUser.put(currentUser, 0);
}

export async function getCurrentUser() {
    return new Promise( resolve => {
        LocalDB.currentUser.get(0).then( user => {
            if (user && user._id && user.token) {
                resolve(user);
            } else {
                resolve(null);
            }
        });
    });
}

/** Get current location, Quelle: https://whatwebcando.today/geolocation.html
 *  return position object or null
 */
export function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        // Determine if the location is supported using feature detection.
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(function (location) {
                if (location && location.coords) {
                    resolve({
                        type: 'Point',
                        coordinates: [location.coords.longitude, location.coords.latitude]
                    });
                } else {
                    resolve(null);
                }
            }, () => {
                resolve(null);
            });
        } else {
            console.log('Geolocation API not supported.');
            resolve(null);
        }
    });
}

// Quelle: https://developer.mozilla.org/en-US/docs/Web/API/notification
export function requestNotificationPermission() {
    if (!('Notification' in window)) {
        confirm('Die Notification API wird von diesem Browser nicht unterstützt. Du kannst daher keine Benachrichtung erhalten, wenn deine offline erfassten Arbeitszeiten mit dem Server synchronisiert wurden.');
    } else if (Notification.permission !== 'denied') {
        // Wenn die Benachrichtung noch nicht abgelehnt wurden, dann frage den Benutzer um Erlaubnis Benachrichtigungen anzuzeigen
        Notification.requestPermission().then(function (permission) {
            if (permission === 'denied') {
                confirm('Du erhältst keine Benachrichtung, wenn deine offline erfassten Arbeitszeiten erfolgreich mit dem Server synchronisiert wurden.');
            }
        });
    }
}
