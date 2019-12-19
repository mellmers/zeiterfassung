import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import UserModel, {saltRounds as UserPinCodeSaltRounds} from '../models/User';
import {isRequestedUser, isRequestedUserOrAdmin, UserIsAdmin} from '../utils/helpers';

const router = express.Router();

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.post('/create', create);
router.get('/', getAll);
router.route('/:id')
    .get(getUserById)
    .patch(updateUser);

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
                        message: 'Erfolgreich angemeldet',
                        data: {
                            user: {
                                token: token,
                                expiresIn: expiresIn,

                                _id: user._id,
                                staffNumber: user.staffNumber,
                                familyName: user.familyName,
                                firstName: user.firstName,
                                role: user.role,
                                invitationId: user.invitationId,
                                createdAt: user.createdAt,
                                updatedAt: user.updatedAt
                            }
                        }
                    });
                } else {
                    res.status(401).json({status: 'error', message: 'Personalnummer oder Pin falsch'});
                }
            } else {
                res.status(401).json({status: 'error', message: 'Personalnummer oder Pin falsch'});
            }
        });
}

async function register(req, res, next) {
    // TODO: Generate 4 digit pin code in frontend
    let user = {
        familyName: req.body.familyName,
        firstName: req.body.firstName,
        pinCode: req.body.pinCode,
        role: 'Mitarbeiter'
    };

    await UserModel.create(user, (err, user) => {
        if (err) {
            res.status(400).json({
                status: 'error',
                message: 'Benutzer konnte nicht angelegt werden. Grund: ' + err.message || err.errmsg
            });
        } else if (user) {
            res.status(201).json({status: 'success', message: 'Benutzer erfolgreich angelegt', data: {user: user}});
        }
    });
}

async function create(req, res, next) {
    // TODO: Generate 4 digit pin code in frontend
    let user = {
        familyName: req.body.familyName,
        firstName: req.body.firstName,
        pinCode: req.body.pinCode,
        role: 'Mitarbeiter'
    };

    // Benutzer mit Benutzerrolle anlegen (dürfen aber NUR Administratoren)
    if (req.body.role && await UserIsAdmin(req.user.id, next)) {
        user.role = req.body.role;
    } else {
        res.status(403).json({status: 'error', message: 'Nur Administratoren dürfen Benutzer mit Benutzerrollen anlegen'});
        return;
    }

    await UserModel.create(user, (err, user) => {
        if (err) {
            res.status(400).json({
                status: 'error',
                message: 'Benutzer konnte nicht angelegt werden. Grund: ' + err.message || err.errmsg
            });
        } else if (user) {
            res.status(201).json({status: 'success', message: 'Benutzer erfolgreich angelegt', data: {user: user}});
        }
    });
}

async function getAll(req, res, next) {
    if (await UserIsAdmin(req.user.id, next)) {
        UserModel.find({}, (err, users) => {
            if (err) {
                res.status(400).json({status: 'error', message: 'Abfrage der Benutzerdaten gescheitert. Grund: ' + err.message || err.errmsg});
            } else if (users) {
                res.json({status: 'success', message: 'Alle Benutzerdaten erfolgreich abgefragt', data: {users: users}});
            }
        });
    } else {
        res.status(403).json({status: 'error', message: 'Zugriff verweigert'});
    }
}

async function getUserById(req, res, next) {
    const isRequestedOrAdmin = await isRequestedUserOrAdmin(req, req.params.id, next);
    if (isRequestedOrAdmin) {
        UserModel.findById(req.params.id).then(user => {
            res.json({
                status: 'success',
                message: 'Benutzer (' + user._id + ') erfolgreich geladen',
                data: {
                    user: {
                        _id: user._id,
                        staffNumber: user.staffNumber,
                        familyName: user.familyName,
                        firstName: user.firstName,
                        role: user.role,
                        invitationId: user.invitationId,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    }
                }
            });
        }).catch(err => {
            res.status(404).json({status: 'error', message: 'Benutzer nicht gefunden'});
        });
    } else {
        res.status(403).json({status: 'error', message: 'Zugriff verweigert'});
    }
}

async function updateUser(req, res, next) {
    const isRequestedOrAdmin = await isRequestedUserOrAdmin(req, req.params.id, next);

    if (isRequestedOrAdmin) {
        UserModel.findById(req.params.id).then(user => {

            const newProperties = req.body;
            for (let [key, value] of Object.entries(newProperties)) {
                if (key in user) {
                    switch (key) {
                        case 'pinCode':
                            value = bcrypt.hashSync(value, UserPinCodeSaltRounds);
                            user[key] = value;
                            break;
                        case 'role':
                            if (isRequestedOrAdmin === 'admin') {
                                user[key] = value;
                            } else {
                                res.status(403).json({status: 'error', message: 'Nur Administratoren dürfen die Benutzerrolle anpassen'});
                                return;
                            }
                            break;
                        case 'familyName':
                        case 'firstName':
                            user[key] = value;
                            break;
                    }
                }
            }

            user.save().then(updatedUser => {
                res.json({
                    status: 'success',
                    message: 'Benutzer (' + user._id + ') erfolgreich bearbeitet',
                    data: {
                        user: {
                            _id: updatedUser._id,
                            staffNumber: updatedUser.staffNumber,
                            familyName: updatedUser.familyName,
                            firstName: updatedUser.firstName,
                            role: updatedUser.role,
                            invitationId: updatedUser.invitationId,
                            createdAt: updatedUser.createdAt,
                            updatedAt: updatedUser.updatedAt
                        }
                    }
                });
            }).catch(err => {
                res.status(406).json({status: 'error', message: 'Benutzer konnte nicht bearbeitet werden. Grund: ' + err});
            });
        }).catch(err => {
            res.status(404).json({status: 'error', message: 'Benutzer nicht gefunden'});
        });
    } else {
        res.status(403).json({status: 'error', message: 'Zugriff verweigert'});
    }
}