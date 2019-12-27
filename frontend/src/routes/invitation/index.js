import { Component } from 'preact';
import { Page } from 'react-onsenui';

import QRCode from './../../components/QRCode';
import Toolbar from './../../components/toolbar';

import API from './../../utils/API';

import styles from './styles.scss';

export default class Invitation extends Component {

    state = {
        error: null,
        loading: true,
        user: null
    };

    componentWillMount() {
        API.getInstance()._fetch('/users/invitation/' + this.props.id, 'GET')
            .then(response => {
                if (response.status === 'error') {
                    this.setState({error: response.message});
                } else if (response.data && response.data.user) {
                    this.setState({user: response.data.user});
                }
            }, () => {})
            .then(() => {
                this.setState({loading: false});
            });
    }

    render(props, { error, loading, user }, context) {
        console.log(props, user);

        return (
            <Page renderToolbar={() => <Toolbar headline='Zeiterfassung' />}>
                <div className={'page-with-toolbar ' + styles.invitation}>
                    {loading ? <p>Benutzerdaten werden geladen ...</p> :
                     error ? <p>{error}</p> :
                     user ? (
                         <div className={styles.data}>
                             <p>Bitte drucke folgenden QR-Code aus, um deine Arbeitszeit an einem Terminal zu starten/stoppen:</p>
                             <QRCode value={''+user.staffNumber} />
                             <p>oder logge dich mit deinen Daten über ein Gerät deiner Wahl an, um deine Benutzerdaten zu verwalten und Arbeitszeiten zu erfassen:</p>
                             <p>Personalnummer: <strong>{user.staffNumber}</strong></p>
                             <p>Pin: <strong>(wird persönlich mitgeteilt)</strong></p>
                         </div>
                     ) :
                     <p>Unbekannter Fehler</p>}
                </div>
            </Page>
        );
    }
}
