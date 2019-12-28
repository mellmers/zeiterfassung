import {Component} from 'preact';
import ons from 'onsenui';
import {Button, Input, Page} from 'react-onsenui';
import QRReader from 'react-qr-reader';
import bcrypt from 'bcryptjs';

import Toolbar from './../../components/toolbar';

import API from './../../utils/API';
import LocalDB from './../../utils/LocalDB';

import styles from './styles.scss';

export default class Terminal extends Component {

    state = {
        disableActions: false,
        pinCode: null,
        scanData: null,
        showQRScanner: false,
        staffNumber: null
    };

    componentWillMount() {
        // Benutzerdaten bei Seitenaufruf aus der DB holen
        this.fetchUsersData();
        // Jede Stunde Daten holen, wenn Internetverbindung
        this.fetchInterval = setInterval(this.fetchUsersData.bind(this), 60 * 60 * 1000);
    }

    componentWillUnmount() {
        clearInterval(this.fetchInterval);
    }

    // Wenn die Anwendung eine Internetverbindung hat, dann hole Benutzerdaten und speichere diese in LocalDB
    fetchUsersData() {
        if (navigator.onLine) {
            API.getInstance()._fetch('/users')
                .then(response => {
                    if (response.status === 'success') {
                        LocalDB.users.bulkPut(response.data.users);
                    }
                });
        }
    }

    handleInputChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    handleLogin(e) {
        e.preventDefault();
        const { staffNumber, pinCode } = this.state;

        this.setState({ disableActions: true });


        // TODO: Anmeldung lokal, Arbeitszeit erfassen und wenn online synchronisieren
        if (staffNumber && pinCode) {
            LocalDB.users.where({ staffNumber: parseInt(staffNumber) }).first( user => {
                if (user && bcrypt.compareSync(pinCode, user.pinCode)) {
                    // TODO: Arbeitszeiterfassung starten/stoppen, vibrieren und Benachrichtung anzeigen
                    const now = new Date();
                    // Start
                    ons.notification.toast({
                        buttonLabel: 'Ok',
                        force: true,
                        message: 'Herzlichen Willkommen, ' + user.firstName + ' ' + user.familyName + '! <br/> Die Zeiterfassung wurde gestartet am ' + now.toLocaleDateString() + ' um ' + now.toLocaleTimeString() + ' Uhr',
                        timeout: 10000
                    });
                } else {
                    ons.notification.toast({
                        buttonLabel: 'Ok',
                        force: true,
                        message: 'Angaben falsch',
                        timeout: 3000
                    });
                }
                this.setState({ disableActions: false });
            }).catch(error => {
                console.error(error.stack || error);
                this.setState({ disableActions: false });
            });
        }
    }

    handleScan(data) {
        console.log('QR-Data:', data);
        if (data) {
            this.setState({
                scanData: data,
                showQRScanner: false
            });
        }

        // TODO: Ähnlich 'handleLogin'
    }

    handleError(err) {
        alert(err);
        this.setState({ showQRScanner: false });
    }

    openQRCodeScanner() {
        this.setState({ showQRScanner: true });
    }

    render(props, state, context) {

        if (state.showQRScanner) {
            return (
                <QRReader
                    delay={300}
                    onError={this.handleError.bind(this)}
                    onScan={this.handleScan.bind(this)}
                    style={{ width: '100%', maxHeight: '100%' }}
                />
            );
        }

        return (
            <Page renderToolbar={() => <Toolbar headline='Terminal' />}>
                <div className={'page-with-toolbar ' + styles.terminal}>
                    <form onSubmit={this.handleLogin.bind(this)}>
                        <h1>Arbeitszeit erfassen</h1>
                        <p>
                            <Input
                                id='staffNumber'
                                name='staffNumber'
                                placeholder='Personalnummer'
                                modifier='material'
                                required
                                onChange={this.handleInputChange.bind(this)}
                            >
                            </Input>
                        </p>

                        <p>
                            <Input
                                id='pinCode'
                                name='pinCode'
                                placeholder='Pin'
                                type='password'
                                modifier='material'
                                onChange={this.handleInputChange.bind(this)}
                                maxLength={4}
                                required
                            >
                            </Input>
                        </p>

                        <p>
                            <button className={'button' + ( !ons.platform.isIOS() ? ' button--material' : '') } type='submit' disabled={state.disableActions}>Anmelden</button>
                        </p>

                        <p className={styles.spacer}>oder</p>

                        <Button onClick={this.openQRCodeScanner.bind(this)} disabled={state.disableActions}>QR-Code scannen</Button>

                        <div>{state.scanData}</div>
                    </form>
                </div>
            </Page>
        );
    }
}
