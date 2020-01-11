import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';

import jwt from './utils/jwt';
import errorHandler from './utils/errorHandler';
import mongoose from './utils/database'; // Hier wird die Datenbankverbindung aufgebaut

import UserController from './controllers/UserController';
import WorkingTimeController from './controllers/WorkingTimeController';

let app = express();

// Starte API, wenn Datenbankverbindung steht
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.once('open', function () {
    console.log('MongoDB connect successfully!');

    app.listen(process.env.API_PORT, function () {
        console.log("Running API on 127.0.0.1:" + process.env.API_PORT);
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

export default app;
