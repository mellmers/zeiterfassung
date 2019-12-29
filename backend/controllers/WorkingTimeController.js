import express from 'express';

import WorkingTimeModel from '../models/WorkingTime';

import { UserIsAdmin } from '../utils/helpers';
import UserModel from "../models/User";

const router = express.Router();

// routes
router.route('/')
    .post(toggleTracking)
    .get(getAll);

export default router;

// Controller methods

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
            } else if (foundWT && foundWT.length === 1) {
                console.log('Update entry');
                // Update entry

                let wT = foundWT[0];

                wT.end = {
                    time: end || now,
                    location: null
                };
                wT.updatedAt = now;

                // Oldenburg: 8.1506953 | 53.1441014
                if (longitude && latitude) {
                    wT.end.location = {type: 'Point', coordinates: [longitude, latitude]};
                }

                wT.save().then(updatedWorkingTime => {
                    responseWT = updatedWorkingTime;
                    res.status(201).json({
                        status: 'success',
                        message: 'Arbeitszeiterfassung gestoppt',
                        data: { workingTime: responseWT }
                    });
                }).catch(err => {
                    res.status(400).json({status: 'error', message: 'Update der Arbeitszeit hat nicht funktioniert. Grund: ' + err});
                });
            } else {
                console.log('New entry');
                // New entry
                let wT = {
                    start: {
                        time: start || now,
                        location: null
                    },
                    userId: userId
                };

                // Oldenburg: 8.1506953 | 53.1441014
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
    if (await UserIsAdmin(req.user.id, next)) {
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
        res.status(403).json({status: 'error', message: 'Zugriff verweigert'});
    }
}
