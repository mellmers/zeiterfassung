import {Component} from 'preact';
import ons from 'onsenui';
import {Button, Input, Page} from 'react-onsenui';
import QRReader from 'react-qr-reader';
import bcrypt from 'bcryptjs';

import Toolbar from './../../components/toolbar';

import API from './../../utils/API';
import {getCurrentLocation, requestNotificationPermission} from './../../utils/helpers';
import LocalDB from './../../utils/LocalDB';

import styles from './styles.scss';

export default class Terminal extends Component {

    state = {
        disableActions: false,
        pinCode: '',
        scanData: null,
        showQRScanner: false,
        staffNumber: ''
    };

    componentWillMount() {
        // Benutzerdaten bei Seitenaufruf aus der DB holen
        this.fetchUsersData();
        // Jede Stunde Daten holen, wenn Internetverbindung
        this.fetchInterval = setInterval(this.fetchUsersData.bind(this), 60 * 60 * 1000);

        // Hole Arbeitszeiten und speichere diese in LocalDB und state
        if (navigator.onLine) {
            API.getInstance()._fetch('/working-time')
                .then(response => {
                    if (response.status === 'success') {
                        LocalDB.localWorkingTimes.clear();
                        LocalDB.localWorkingTimes.bulkPut(response.data.workingTimes);
                    }
                });
        }
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
                    this.toggleTimeTracking(user);
                } else {
                    ons.notification.toast({
                        buttonLabel: 'Ok',
                        force: true,
                        message: 'Angaben falsch',
                        timeout: 3000
                    });
                    this.setState({ disableActions: false });
                }
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

    async toggleTimeTracking(user) {
        const timeTracking = await this.isTimeTracking(user),
            now = new Date();
        let location = await getCurrentLocation(),
            postBody = {
                userId: user._id
            };

        requestNotificationPermission();

        if (timeTracking) {
            // Update vorhandene Arbeitszeit
            await LocalDB.localWorkingTimes.where({ userId: user._id }).reverse().toArray().then(async workingTimes => {
                for (let key in workingTimes) {
                    if (!workingTimes[key].hasOwnProperty('end')) {
                        await LocalDB.localWorkingTimes.update(workingTimes[key].id, {
                            end: {
                                time: now,
                                location: location
                            },
                            updatedAt: now
                        });

                        // Speichere Endzeit, um diese an die Datenbank zu schicken
                        postBody.end = now;

                        break;
                    }
                }
            });

            // Benachrichtung anzeigen
            ons.notification.toast({
                buttonLabel: 'Ok',
                message: 'Herzlichen Willkommen, ' + user.firstName + ' ' + user.familyName + '! <br/> Die Zeiterfassung wurde am ' + now.toLocaleDateString() + ' um ' + now.toLocaleTimeString() + ' Uhr gestoppt.',
                timeout: 10000
            });
        } else {
            // Neue Arbeitszeit anlegen
            await LocalDB.localWorkingTimes.add({
                userId: user._id,
                start: {
                    time: now,
                    location: location
                },
                createdAt: now,
                updatedAt: now
            });

            // Speichere Startzeit, um diese an die Datenbank zu schicken
            postBody.start = now;

            // Benachrichtung anzeigen
            ons.notification.toast({
                buttonLabel: 'Ok',
                message: 'Herzlichen Willkommen, ' + user.firstName + ' ' + user.familyName + '! <br/> Die Zeiterfassung wurde am ' + now.toLocaleDateString() + ' um ' + now.toLocaleTimeString() + ' Uhr gestartet.',
                timeout: 10000
            });
        }

        // Vibration mit Pattern, Quelle: https://whatwebcando.today/vibration.html
        if (navigator.vibrate) navigator.vibrate([100, 200, 200, 200]);

        // Speichere Location, um diese an die Datenbank zu schicken
        if (location) {
            postBody.longitude = location.coordinates[0];
            postBody.latitude = location.coordinates[1];
        }
        // Request an die API, um die Daten persistent zu speichern
        // Falls der Request nicht funktioniert, weil keine Internetverbindung besteht, soll der Service Worker diesen Request
        // zur Background Sync Queue hinzufügen, um den Request später zu verarbeiten
        API.getInstance()._fetch('/working-time', 'POST', postBody);

        // Wenn alles fertig ist, resette Login Formular
        this.setState({
            staffNumber: '',
            pinCode: '',
            disableActions: false
        });
    }

    // Überprüfe, ob die Zeiterfassung für einen Benutzer bereits läuft
    async isTimeTracking(user) {
        return new Promise( resolve => {
            LocalDB.localWorkingTimes.where({userId: user._id}).reverse().sortBy('start.time').then(workingTimes => {
                let timeTracking = false;

                // Arbeitszeiten des Benutzers nach Eintrag ohne 'end'-Date durchsuchen
                // Wenn es eine Zeit gibt, dann läuft die Zeiterfassung bereits
                for (let key in workingTimes) {
                    if (!workingTimes[key].hasOwnProperty('end')) {
                        timeTracking = true;
                        break;
                    }
                }

                resolve(timeTracking);
            });
        });
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
                                onChange={this.handleInputChange.bind(this)}
                                value={state.staffNumber}
                                required
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
                                value={state.pinCode}
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
