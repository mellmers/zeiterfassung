import express from 'express';

import WorkingTimeModel from '../models/WorkingTime';

import { UserIsAdmin } from '../utils/helpers';

const router = express.Router();

// routes
router.post('/', create);
router.get('/', getAll);

export default router;

// Controller methods

async function create(req, res, next) {
    const {start, end, longitude, latitude} = req.body;
    let workingTime = {
        start: start,
        end: end,
        location: null,
        userId: req.user.id
    };

    if (req.body.userId && req.user.id) {
        if (await UserIsAdmin(req.user.id, next)) {
            workingTime.userId = req.body.userId;
        } else {
            res.status(403).json({status: 'error', message: 'Sie dürfen keine Arbeitszeit für einen anderen Benutzer speichern'});
            return;
        }
    }

    // Oldenburg: 8.1506953 | 53.1441014
    if (longitude && latitude) {
        workingTime.location = {type: 'Point', coordinates: [longitude, latitude]};
    }

    await WorkingTimeModel.create(workingTime, (err, workingTime) => {
        if (err) {
            res.status(400).json({
                status: 'error',
                message: 'Arbeitszeit kann nicht erstellt werden. Grund: ' + err.message || err.errmsg
            });
        } else if (workingTime) {
            res.status(201).json({
                status: 'success',
                message: 'Arbeitszeit erfolgreich hinzugefügt',
                data: {workingTime: workingTime}
            });
        }
    });
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
