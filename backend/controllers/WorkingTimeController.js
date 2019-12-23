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

    if (req.body.userId && req.user.id) {
        if (await UserIsAdmin(req.user.id, next)) {
            userId = req.body.userId;
        } else {
            res.status(403).json({status: 'error', message: 'Sie dürfen keine Arbeitszeit für einen anderen Benutzer speichern'});
            return;
        }
    }

    let user = null;
    await UserModel.findById(userId).then(u => {
        user = u;
    }).catch(err => {
        res.status(404).json({status: 'error', message: 'Benutzer nicht gefunden'});
    });

    // Abbrechen, wenn Benutzer nicht gefunden wird
    if (user === null) return;

    const now = new Date();

    try {
        const updateUserAndSendResponse = function () {
            user.timeTracking = !user.timeTracking;
            user.updatedAt = now;

            user.save().then(updatedUser => {
                res.status(201).json({
                    status: 'success',
                    message: 'Arbeitszeiterfassung ' + (user.timeTracking ? 'gestoppt' : 'gestartet'),
                    data: { workingTime: responseWT }
                });

            }).catch(err => {
                res.status(400).json({status: 'error', message: 'Benutzer konnte nicht bearbeitet werden. Grund: ' + err});
            });
        };

        await WorkingTimeModel.find({ userId: user._id, end: { $eq: null } }, (err, foundWT) => {
            if (err) {
                res.status(400).json({
                    status: 'error',
                    message: 'Arbeitszeit kann nicht erstellt werden. Grund: ' + err.message || err.errmsg
                });
            } else if (foundWT && foundWT.length === 1) {
                // Update entry
                console.log(foundWT);

                let wT = foundWT[0];

                wT.end = {
                    time: now,
                    location: null
                };
                wT.updatedAt = now;

                // Oldenburg: 8.1506953 | 53.1441014
                if (longitude && latitude) {
                    wT.end.location = {type: 'Point', coordinates: [longitude, latitude]};
                }

                wT.save().then(updatedWorkingTime => {
                    responseWT = updatedWorkingTime;
                    updateUserAndSendResponse();
                }).catch(err => {
                    res.status(400).json({status: 'error', message: 'Update der Arbeitszeit hat nicht funktioniert. Grund: ' + err});
                });
            } else {
                // New entry
                let wT = {
                    start: {
                        time: now,
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
                        updateUserAndSendResponse();
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
