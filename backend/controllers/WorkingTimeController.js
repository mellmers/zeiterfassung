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
        await UserIsAdmin(req.user.id, res, next, (user) => {
            workingTime.userId = req.body.userId;
        });
    }

    // Oldenburg: 8.1506953 | 53.1441014
    if (longitude && latitude) {
        workingTime.location = {type: 'Point', coordinates: [longitude, latitude]};
    }

    WorkingTimeModel.create(workingTime, (err, workingTime) => {
        if (err) {
            res.status(400).json({
                status: 'error',
                message: 'Cannot create working time. Reason: ' + err.message || err.errmsg
            });
        } else if (workingTime) {
            res.status(201).json({
                status: 'success',
                message: 'Working time added successfully',
                data: {workingTime: workingTime}
            });
        }
    });
}

function getAll(req, res, next) {
    WorkingTimeModel.find({}, (err, workingTimes) => {
        if (err) {
            res.status(400).json({status: 'error', message: 'Cannot get all working times. Reason: ' + err.message || err.errmsg});
        } else if (workingTimes) {
            res.json({status: 'success', message: 'Got all working times', data: {workingTimes: workingTimes}});
        }
    });
}
