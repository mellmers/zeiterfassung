import { Component } from 'preact';
import ons from 'onsenui';
import { Button, Icon, Page } from 'react-onsenui';

import WorkingTimesTable from './../../components/workingTimesTable';

import API from './../../utils/API';
import {getCurrentLocation, requestNotificationPermission} from './../../utils/helpers';
import LocalDB from './../../utils/LocalDB';

import styles from './style.scss';

export default class Zeiterfassung extends Component {

    constructor(props) {
        super(props);

        this.state = {
            timer: null,
            timeTracking: false,
            workingTimes: []
        };
    }

    componentWillMount() {
        if (navigator.onLine) {
            this.updateWorkingTimes();
        } else {
            // Falls keine Verbindung besteht, dann nehme Daten aus der LocalDB und setze Arbeitszeiten in den state
            this.updateStateWithDataFromLocalDB();
        }
    }

    componentDidMount() {
        // Shake-Detection, Quelle: https://github.com/alexgibson/shake.js/
        // Ein Teil des Quellcodes habe ich hier verwendet, um die Schüttel-Geste des Smartphones zu erkennen.
        // Dabei wird die "Device Orientation API" benutzt, um die Beschleunigung des Geräts auszulesen.
        //
        // Überprüfe, ob DeviceMotionEvent vom Browser unterstützt wird
        if ('DeviceMotionEvent' in window) {
            const threshold = 7, // Startschwelle für das Erkennen der Geste
                timeout = 2000; // Intervall zwischen dem Aufruf der Geste

            // Verwende das Datum, um zu verhindern, dass mehrere Schüttel-Gesten kurz nacheinander ausgelöst werden
            let lastTime = new Date(),
                lastX = null,
                lastY = null,
                lastZ = null;

            window.addEventListener('devicemotion', e => {
                let current = e.accelerationIncludingGravity,
                    currentTime,
                    timeDifference;

                if ((lastX === null) && (lastY === null) && (lastZ === null)) {
                    lastX = current.x;
                    lastY = current.y;
                    lastZ = current.z;
                    return;
                }

                let deltaX = Math.abs(lastX - current.x),
                    deltaY = Math.abs(lastY - current.y),
                    deltaZ = Math.abs(lastZ - current.z);

                if (((deltaX > threshold) && (deltaY > threshold)) || ((deltaX > threshold) && (deltaZ > threshold)) || ((deltaY > threshold) && (deltaZ > threshold))) {
                    // Berechne die Zeit in Millisekunden seit der letzten registrierten Schüttel-Geste
                    currentTime = new Date();
                    timeDifference = currentTime.getTime() - lastTime.getTime();

                    if (timeDifference > timeout) {
                        this.handleTimeTrackingClick(); // Starte/Stoppe Zeiterfassung
                        lastTime = new Date();
                    }
                }

                lastX = current.x;
                lastY = current.y;
                lastZ = current.z;
            }, false);
        } else {
            console.log('DeviceMotion is not supported.');
        }
    }

    // 'Count Up from Date and Time with Javascript', Quelle: https://guwii.com/bytes/count-date-time-javascript/
    countUpFrom(from) {
        let countFrom = new Date(from),
            timeDifference = (new Date() - countFrom),
            timer = {};

        let secondsInADay = 60 * 60 * 1000 * 24,
            secondsInAHour = 60 * 60 * 1000;

        timer.days = Math.floor(timeDifference / (secondsInADay));
        timer.hours = Math.floor((timeDifference % (secondsInADay)) / (secondsInAHour));
        timer.minutes = Math.floor(((timeDifference % (secondsInADay)) % (secondsInAHour)) / (60 * 1000));
        timer.seconds = Math.floor((((timeDifference % (secondsInADay)) % (secondsInAHour)) % (60 * 1000)) / 1000);

        if (timer.hours < 10) {
            timer.hours = '0' + timer.hours;
        }
        if (timer.minutes < 10) {
            timer.minutes = '0' + timer.minutes;
        }
        if (timer.seconds < 10) {
            timer.seconds = '0' + timer.seconds;
        }

        this.setState({ timer: timer });
    };

    async handleTimeTrackingClick() {
        const { currentUser } = this.props,
            { timeTracking } = this.state,
            now = new Date();
        let location = await getCurrentLocation(),
            postBody = {};

        requestNotificationPermission();

        // Falls keine Verbindung besteht, setze Arbeitszeit basierend auf den Daten in der LocalDB
        if (!navigator.onLine) {
            if (timeTracking) {
                // Update vorhandene Arbeitszeit
                await LocalDB.localWorkingTimes.where({ userId: currentUser._id }).reverse().toArray().then(async workingTimes => {
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
                    message: 'Zeiterfassung beendet am ' + now.toLocaleDateString() + ' um ' + now.toLocaleTimeString(),
                    timeout: 3000
                });
            } else {
                // Neue Arbeitszeit anlegen
                await LocalDB.localWorkingTimes.add({
                    userId: currentUser._id,
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
                    message: 'Zeiterfassung gestartet am ' + now.toLocaleDateString() + ' um ' + now.toLocaleTimeString(),
                    timeout: 3000
                });
            }

            // Update state
            this.updateStateWithDataFromLocalDB();
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
        API.getInstance()._fetch('/working-times', 'POST', postBody).then( response => {
            if (response.status === 'success') {
                const workingTime = response.data.workingTime;
                const time = new Date( (workingTime.end ? workingTime.end.time : workingTime.start.time) ),
                    timeTracking = workingTime.end === undefined;

                // Benachrichtung anzeigen
                ons.notification.toast({
                    buttonLabel: 'Ok',
                    message: 'Zeiterfassung ' + (timeTracking ? 'gestartet' : 'beendet') + ' am ' + time.toLocaleDateString() + ' um ' + time.toLocaleTimeString() + ' Uhr',
                    timeout: 3000
                });

                this.updateWorkingTimes();
            }
        });
    }

    // Hole Arbeitszeiten aus der LocalDB, sortiere die Daten nach Startzeit und update den state
    updateStateWithDataFromLocalDB() {
        LocalDB.localWorkingTimes.where({ userId: this.props.currentUser._id }).reverse().sortBy('start.time').then( workingTimes => {
            // Timer zurücksetzen
            clearInterval(this.interval);
            this.setState({ timer: null });

            // Arbeitszeiten nach Eintrag ohne 'end'-Date durchsuchen
            // Wenn es eine Zeit gibt, dann muss der Timer aktiviert werden
            // und der state 'timeTracking' muss auf true gesetzt werden
            let timeTracking = false;
            for (let key in workingTimes) {
                if (!workingTimes[key].hasOwnProperty('end')) {
                    const startTime = new Date(workingTimes[key].start.time);
                    // Setup timer interval
                    this.interval = setInterval(this.countUpFrom.bind(this, startTime), 1000);
                    // Und einmal aufrufen, damit der Timer sofort anfängt zu zählen
                    this.countUpFrom(startTime);

                    timeTracking = true;
                    break;
                }
            }

            // Update state
            this.setState({
                workingTimes: workingTimes,
                timeTracking: timeTracking
            });
        });
    }

    updateWorkingTimes() {
        API.getInstance()._fetch('/working-times')
            .then(response => {
                if (response.status === 'success') {
                    LocalDB.localWorkingTimes.clear();
                    LocalDB.localWorkingTimes.bulkPut(response.data.workingTimes).then(this.updateStateWithDataFromLocalDB.bind(this));
                }
            });
    }

    renderTimer() {
        const { timer } = this.state;

        if (timer === null) return <div className={styles.timerInactive} />;

        return (
            <div className={styles.timer}>
                {timer.days > 0 ? timer.days + ':' : null}{timer.hours > 0 ? timer.hours + ':' : null}{timer.minutes}:{timer.seconds}
            </div>
        );
    }

    render(props, { timer, timeTracking, workingTimes }, context) {
        return (
            <Page>
                <div className={styles.pageContent + (timeTracking ? ' ' + styles.timeTracking : '')}>
                    <Button
                        className={styles.button}
                        onClick={this.handleTimeTrackingClick.bind(this)}
                    >
                        Zeiterfassung {timeTracking ? 'stoppen' : 'starten'}
                        <Icon
                            className={styles.btnIcon}
                            icon={timeTracking ? 'fa-stop-circle' : 'fa-play-circle'}
                            size={24}
                        />
                    </Button>

                    {this.renderTimer()}
                    <WorkingTimesTable workingTimes={workingTimes} position='center' />
                </div>
            </Page>
        );
    }
}
