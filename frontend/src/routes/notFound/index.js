import {Link} from 'preact-router';
import {Page} from 'react-onsenui';

import Toolbar from './../../components/toolbar';

import styles from './styles.scss';

export default function NotFound () {
    return (
        <Page renderToolbar={() => <Toolbar headline='404'/>}>
            <div className={'page-with-toolbar ' + styles.notFound}>
                <div>
                    <p>404 - Seite nicht gefunden</p>
                    <p><Link href='/'>Hier geht's zur Startseite</Link></p>
                </div>
            </div>
        </Page>
    );
}
