import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import UserModel from '../models/User';

const router = express.Router();

// routes
router.post('/authenticate', authenticate);
router.post('/register', create);
router.get('/', getAll);

export default router;

// Controller methods
function authenticate(req, res, next) {
    const {staffNumber, pinCode} = req.body;
    UserModel
        .findOne({staffNumber: staffNumber})
        .select('+pinCode')
        .exec(function (err, user) {
            if (err) {
                next(err);
                return;
            }
            if (pinCode && user && user.pinCode) {
                if (bcrypt.compareSync(pinCode, user.pinCode)) {
                    const expiresIn = 60 * 60 * 24 * 365; // 1 year
                    const token = jwt.sign({id: user._id}, process.env.API_SECRET, {expiresIn: expiresIn});
                    res.json({
                        status: 'success',
                        message: 'Authentication successful',
                        data: {
                            token: token,
                            expiresIn: expiresIn,
                            user:  {
                                _id: user._id,
                                staffNumber: user.staffNumber,
                                familyName: user.familyName,
                                firstName: user.firstName,
                                createdAt: user.createdAt,
                                updatedAt: user.updatedAt
                            }
                        }
                    });
                } else {
                    res.status(400).json({status: 'error', message: 'Staff number or pin code is incorrect'});
                }
            } else {
                res.status(400).json({status: 'error', message: 'Staff number or pin code is incorrect'});
            }
        });
}

function create(req, res, next) {
    // TODO: Generate 4 digit pin code in frontend
    let user = {
        familyName: req.body.familyName,
        firstName: req.body.firstName,
        pinCode: req.body.pinCode
    };
    UserModel.create(user, (err, user) => {
        if (err) {
            res.status(400).json({
                status: 'error',
                message: 'Cannot register user. Reason: ' + err.message || err.errmsg
            });
        } else if (user) {
            res.status(201).json({status: 'success', message: 'User added successfully', data: {user: user}});
        }
    });
}

function getAll(req, res, next) {
    UserModel.find({}, (err, users) => {
        if (err) {
            res.status(400).json({status: 'error', message: 'Cannot get all users'});
        } else if (users) {
            res.json({status: 'success', message: 'Got all users', data: {users: users}});
        }
    });
}