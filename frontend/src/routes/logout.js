import {route} from 'preact-router';
import ons from 'onsenui';

import LocalDB from './../utils/LocalDB';

export default function Logout () {
    // Benutzerdaten löschen
    LocalDB.currentUser.clear();
    LocalDB.users.clear();
    // Benachrichtigung ausgeben
    ons.notification.toast({
        force: true,
        message: 'Abgemeldet',
        timeout: 3000
    });
    // Zur Login-Seite weiterleiten
    route('/login');
}
