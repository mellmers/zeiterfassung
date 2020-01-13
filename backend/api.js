import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import bcrypt from 'bcryptjs';

import jwt from './utils/jwt';
import {generateUUIDVersion4} from './utils/helpers';
import errorHandler from './utils/errorHandler';
import mongoose from './utils/database'; // Hier wird die Datenbankverbindung aufgebaut

import UserModel from './models/User';

import UserController from './controllers/UserController';
import WorkingTimeController from './controllers/WorkingTimeController';

let app = express();

// Starte API, wenn Datenbankverbindung steht
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.once('open', function () {
    console.log('MongoDB connect successfully!');

    createDefaultUser();

    app.listen(process.env.API_PORT, function () {
        console.log('Running API on 127.0.0.1:' + process.env.API_PORT);
    });
});

// Console logging
app.use(logger('dev'));

// Request body parsing
app.use(bodyParser.urlencoded({ extended: false }));

//
app.use('/api', jwt());

// Routing
app.use('/api/users', UserController);
app.use('/api/working-times', WorkingTimeController);

// global error handler
app.use(errorHandler);

app.get('/api/ping', (req, res) => {
    return res.json({
        message: 'pong'
    });
});
app.get('/api/version', (req, res) => {
    return res.json({
        version: process.env.npm_package_version || 'No version number detected'
    });
});

function createDefaultUser() {

    // Suche nach Benutzern mit dem Namen 'Terminal', 'Admin', 'Mitarbeiter'.
    UserModel.find({ familyName: { $in: ['Terminal', 'Admin', 'Mitarbeiter']} }).then(response => {

        // Wenn kein Benutzer gefunden wird (beim ersten Start), dann lege diese Benutzer an!
        if (response && response.length <= 0) {
            const defaultUsers = [
                {
                    familyName: 'Terminal',
                    firstName: 'Demo',
                    pinCode: bcrypt.hashSync('1234', 10),
                    role: 'Terminal'
                },
                {
                    familyName: 'Admin',
                    firstName: 'Demo',
                    invitationId: generateUUIDVersion4(),
                    pinCode: bcrypt.hashSync('1234', 10),
                    role: 'Administrator'
                },
                {
                    familyName: 'Mitarbeiter',
                    firstName: 'Demo',
                    invitationId: generateUUIDVersion4(),
                    pinCode: bcrypt.hashSync('1234', 10),
                    role: 'Mitarbeiter'
                }
            ];

            defaultUsers.forEach( defaultUser => {
                UserModel.create(defaultUser, (err, user) => {
                    if (err) {
                        console.log('Benutzer konnte nicht angelegt werden. Grund: ' + err.message || err.errmsg);
                    } else if (user) {
                        console.log('Benutzer ' + user.firstName + ' ' + user.familyName + ' erfolgreich angelegt.');
                    }
                });
            });
        } else {
            // Kurzen Hinweis loggen
            console.log('Die Benutzer wurden bereits erstellt.')
        }
    });
}

export default app;
