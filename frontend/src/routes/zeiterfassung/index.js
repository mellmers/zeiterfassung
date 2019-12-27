import { Component } from 'preact';
import ons from 'onsenui';
import { Button, Icon, Page } from 'react-onsenui';

import LocalDB from './../../utils/LocalDB';

import styles from './style.scss';

export default class Zeiterfassung extends Component {

    constructor(props) {
        super(props);

        this.state = {
            timer: null,
            timeTracking: props.currentUser ? props.currentUser.timeTracking : false,
            workingTimes: []
        };
    }

    componentWillMount() {
        // TODO: irgendwann LocalDB und Serverdaten synchronisieren
        LocalDB.table('localWorkingTimes').where('userId').equals(this.props.currentUser._id).reverse().sortBy('start.time').then( workingTimes => {
            this.setState({ workingTimes: workingTimes });
        });
    }

    componentDidMount() {
        // Shake-Detection (Modified), Quelle: https://github.com/alexgibson/shake.js/
        //
        // Determine if the DeviceMotionEvent is supported using feature detection.
        if (window.DeviceMotionEvent) {
            const threshold = 5, // shake strength threshold
                timeout = 1000; // determines the frequency of event generation

            let lastTime = new Date(),
                lastX = null,
                lastY = null,
                lastZ = null;

            // The device motion event returns data about the rotation and acceleration information
            // of the device. The event returns two properties: acceleration and accelerationIncldingGravity
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
                    //calculate time in milliseconds since last shake registered
                    currentTime = new Date();
                    timeDifference = currentTime.getTime() - lastTime.getTime();

                    if (timeDifference > timeout) {
                        this.handleTimeTrackingClick();
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

    /** Get current location, Quelle: https://whatwebcando.today/geolocation.html
      * return position object or null
      */
    getCurrentLocation() {
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

    async handleTimeTrackingClick() {
        const { currentUser } = this.props,
            { timeTracking } = this.state,
            now = new Date();
        let location = await this.getCurrentLocation();

        // TODO: Check online/offline, wenn online dann direkter Request an die API und Response in LocalDB

        if (timeTracking) {
            await LocalDB.table('localWorkingTimes').where('userId').equals(currentUser._id).reverse().toArray().then(async workingTimes => {
                for (let key in workingTimes) {
                if (!workingTimes[key].hasOwnProperty('end')) {
                        await LocalDB.table('localWorkingTimes').update(workingTimes[key].id, {
                            end: {
                                time: now,
                                location: location
                            },
                            updatedAt: now
                        });

                        break;
                    }
                }
            });

            // Stop timer
            clearInterval(this.interval);
            this.setState({ timer: null });

            // Benachrichtung anzeigen
            ons.notification.toast({
                buttonLabel: 'Ok',
                force: true,
                message: 'Zeiterfassung beendet am ' + now.toLocaleDateString() + ' um ' + now.toLocaleTimeString(),
                timeout: 3000
            });
        } else {
            await LocalDB.table('localWorkingTimes').add({
                userId: currentUser._id,
                start: {
                    time: now,
                    location: location
                },
                createdAt: now,
                updatedAt: now
            });

            // Setup timer interval
            this.interval = setInterval(this.countUpFrom.bind(this, now), 1000);
            // And call it once
            this.countUpFrom(now);

            // Benachrichtung anzeigen
            ons.notification.toast({
                buttonLabel: 'Ok',
                force: true,
                message: 'Zeiterfassung gestartet am ' + now.toLocaleDateString() + ' um ' + now.toLocaleTimeString(),
                timeout: 3000
            });
        }

        // Vibration mit Pattern, Quelle: https://whatwebcando.today/vibration.html
        if (navigator.vibrate) navigator.vibrate([100, 200, 200, 200]);

        // Update state
        LocalDB.table('localWorkingTimes').where('userId').equals(currentUser._id).reverse().sortBy('start.time').then( workingTimes => {
            this.setState({ timeTracking: !timeTracking, workingTimes: workingTimes });
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

    renderWorkingTimes() {
        const { workingTimes } = this.state;
        const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

        if (workingTimes.length <= 0) return;

        return (
            <table className={styles.workingTimesTable} cellspacing="10">
                <thead>
                    <tr>
                        <th>Tag</th>
                        <th>Datum</th>
                        <th>Von</th>
                        <th>Bis</th>
                    </tr>
                </thead>
                <tbody>
                    {workingTimes.map( (wT, index) => {
                        return (
                            <tr key={index}>
                                <td>{days[wT.start.time.getDay()]}{wT.end && wT.end.time && wT.start.time.getDay() !== wT.end.time.getDay() ? ' - ' + days[wT.end.time.getDay()] : null}</td>
                                <td>{wT.start && wT.start.time ? wT.start.time.toLocaleDateString() : '-'}{wT.end && wT.end.time && wT.start.time.toLocaleDateString() !== wT.end.time.toLocaleDateString() ? ' - ' + wT.end.time.toLocaleDateString() : null}</td>
                                <td>{wT.start && wT.start.time ? wT.start.time.toLocaleTimeString() : '-'}</td>
                                <td>{wT.end && wT.end.time ? wT.end.time.toLocaleTimeString() : '-'}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
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
                    {this.renderWorkingTimes()}
                </div>
            </Page>
        );
    }
}
