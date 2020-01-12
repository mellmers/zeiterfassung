import express from 'express';

import WorkingTimeModel from '../models/WorkingTime';

import {UserIsAdmin, UserIsTerminal} from '../utils/helpers';

const router = express.Router();

// Routen
router.route('/')
    .post(toggleTracking)
    .get(getAll);
router.get('/:userId', getWorkingTimesByUserId);

export default router;

// Controller Methoden
async function toggleTracking(req, res, next) {
    const {start, end, longitude, latitude} = req.body;
    let userId = req.user.id,
        responseWT = null;

    if (req.body.userId && userId) {
        if (await UserIsAdmin(req.user.id, next)) {
            userId = req.body.userId;
        } else {
            res.status(403).json({status: 'error', message: 'Sie dürfen keine Arbeitszeit für einen anderen Benutzer speichern'});
            return;
        }
    }

    const now = new Date();

    try {
        await WorkingTimeModel.find({ userId: userId, end: { $eq: null } }, (err, foundWT) => {
            if (err) {
                res.status(400).json({
                    status: 'error',
                    message: 'Arbeitszeit kann nicht erstellt werden. Grund: ' + err.message || err.errmsg
                });
            } else if (foundWT && foundWT.length > 0) {
                // Update entry

                let wT = foundWT[0];

                wT.end = {
                    time: end || now,
                    location: null
                };
                wT.updatedAt = now;

                if (longitude && latitude) {
                    wT.end.location = {type: 'Point', coordinates: [longitude, latitude]};
                }

                wT.save().then(updatedWorkingTime => {
                    responseWT = updatedWorkingTime;
                    res.status(201).json({
                        status: 'success',
                        message: 'Arbeitszeiterfassung beendet',
                        data: { workingTime: responseWT }
                    });
                }).catch(err => {
                    res.status(400).json({status: 'error', message: 'Update der Arbeitszeit hat nicht funktioniert. Grund: ' + err});
                });
            } else {
                // New entry
                let wT = {
                    start: {
                        time: start || now,
                        location: null
                    },
                    userId: userId
                };

                if (longitude && latitude) {
                    wT.start.location = {type: 'Point', coordinates: [longitude, latitude]};
                }

                WorkingTimeModel.create(wT, (err, workingTime) => {
                    if (err) {
                        res.status(400).json({
                            status: 'error',
                            message: 'Arbeitszeit kann nicht erstellt werden. Grund: ' + err.message || err.errmsg
                        });
                    } else if (workingTime) {
                        responseWT = workingTime;
                        res.status(201).json({
                            status: 'success',
                            message: 'Arbeitszeiterfassung gestartet',
                            data: { workingTime: responseWT }
                        });
                    }
                });
            }
        });
    } catch (e) {
        res.status(400).json({
            status: 'error',
            message: 'Arbeitszeit kann nicht erstellt werden. Grund: ' + e.message || e.errmsg
        });
    }
}

async function getAll(req, res, next) {
    if (await UserIsTerminal(req.user.id, next)) {
        WorkingTimeModel.find({}, (err, workingTimes) => {
            if (err) {
                res.status(400).json({
                    status: 'error',
                    message: 'Abfrage der Arbeitszeiten gescheitert. Grund: ' + err.message || err.errmsg
                });
            } else if (workingTimes) {
                res.json({status: 'success', message: 'Alle Arbeitszeiten erfolgreich abgefragt', data: {workingTimes: workingTimes}});
            }
        });
    } else {
        WorkingTimeModel.find({ userId: req.user.id }, (err, workingTimes) => {
            if (err) {
                res.status(400).json({
                    status: 'error',
                    message: 'Abfrage der Arbeitszeiten gescheitert. Grund: ' + err.message || err.errmsg
                });
            } else if (workingTimes) {
                res.json({status: 'success', message: 'Deine Arbeitszeiten wurden erfolgreich abgefragt', data: {workingTimes: workingTimes}});
            }
        });
    }
}

async function getWorkingTimesByUserId(req, res, next) {
    if (await UserIsAdmin(req.user.id, next)) {
        WorkingTimeModel.find({ userId: req.params.userId }, (err, workingTimes) => {
            if (err) {
                res.status(400).json({
                    status: 'error',
                    message: 'Abfrage der Arbeitszeiten gescheitert. Grund: ' + err.message || err.errmsg
                });
            } else if (workingTimes) {
                res.json({status: 'success', message: 'Arbeitszeiten des Benutzers ' + req.params.userId + ' erfolgreich abgefragt', data: {workingTimes: workingTimes}});
            }
        });
    } else {
        res.status(403).json({status: 'error', message: 'Zugriff verweigert'});
    }
}
