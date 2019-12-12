import 'dotenv/config';
import express from 'express';
// import cors from 'cors';
import bodyParser from 'body-parser';
import logger from 'morgan';

import jwt from './utils/jwt';
import errorHandler from './utils/errorHandler';
import mongoose from './utils/database'; //database

import UserController from './controllers/UserController';

let app = express();

// connection to mongodb
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.once('open', function () {
    console.log('MongoDB connect successfully!');

    app.listen(process.env.API_PORT, function () {
        console.log("Running API on 127.0.0.1:" + process.env.API_PORT);
    });
});

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cors());
app.use('/api', jwt());

// api routes
app.use('/api/users', UserController);

// global error handler
app.use(errorHandler);

// general info
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