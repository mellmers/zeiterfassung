import { Component } from 'preact';

import styles from './styles.scss';

export default class WorkingTimesTable extends Component {


    render({ workingTimes, position }, state, context) {
        const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

        if (workingTimes === undefined || workingTimes === null || workingTimes.length <= 0) return <p style={(position && position === 'center' ? { textAlign: 'center' } : null)}>Keine Arbeitszeitdaten vorhanden</p>;

        // Arbeitszeiten nach Startzeit sortieren, Quelle: https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
        workingTimes.sort((a, b) => {
            const timeA = new Date(a.start.time).getTime();
            const timeB = new Date(b.start.time).getTime();

            if (timeA < timeB) {
                return 1;
            } else if (timeA > timeB) {
                return -1;
            }
            return 0;
        });

        return (
            <table className={styles.workingTimesTable + (position && position === 'center' ? ' ' + styles.positionCenter : '')} cellspacing='10'>
                <thead>
                <tr>
                    <th>Tag</th>
                    <th>Datum</th>
                    <th>Von</th>
                    <th>Bis</th>
                    <th>Dauer</th>
                </tr>
                </thead>
                <tbody>
                {workingTimes.map( (wT, index) => {
                    let start = new Date(wT.start.time),
                        end = null,
                        durationString = '-';

                    if (wT.end && wT.end.time) {
                        end = new Date(wT.end.time);

                        // Dauer berechnen (Zeitdifferenz zwischen Start und Ende)
                        let timeDifference = end - start,
                            duration = {};

                        let secondsInADay = 60 * 60 * 1000 * 24,
                            secondsInAHour = 60 * 60 * 1000;

                        duration.hours = Math.floor(timeDifference / secondsInAHour);
                        duration.minutes = Math.floor(((timeDifference % (secondsInADay)) % (secondsInAHour)) / (60 * 1000));
                        duration.seconds = Math.floor((((timeDifference % (secondsInADay)) % (secondsInAHour)) % (60 * 1000)) / 1000);

                        durationString = '';
                        if (duration.hours > 0) {
                            durationString += duration.hours + ' h ';
                        }
                        if (duration.hours > 0 || duration.minutes > 0) {
                            durationString += duration.minutes + ' m ';
                        }
                        durationString += duration.seconds + ' s';
                    }

                    return (
                        <tr key={index}>
                            <td>{days[start.getDay()]}{end && start.getDay() !== end.getDay() ? ' - ' + days[end.getDay()] : null}</td>
                            <td>{start.toLocaleDateString()}{end && start.toLocaleDateString() !== end.toLocaleDateString() ? ' - ' + end.toLocaleDateString() : null}</td>
                            <td>{start.toLocaleTimeString()}</td>
                            <td>{end ? end.toLocaleTimeString() : '-'}</td>
                            <td style={{textAlign: 'right'}}>{durationString.replace(/ /g, '\u00a0')}</td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        );
    }
}
