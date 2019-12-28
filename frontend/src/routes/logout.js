import {route} from 'preact-router';
import ons from 'onsenui';

import LocalDB from './../utils/LocalDB';

export default function Logout () {
    LocalDB.currentUser.delete(0);
    ons.notification.toast({
        force: true,
        message: 'Abgemeldet',
        timeout: 3000
    });
    route('/login');
}
