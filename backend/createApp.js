const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const placesRoute = require('./routes/places-routes');
const usersRoute = require('./routes/users-routes');
const HttpError = require('./models/http-error');

function createApp() {
    const app = express();

    app.use(bodyParser.json({limit: '10kb'}));

    app.get('/api/health', (_, res) => res.json({ok: true, ts: Date.now()}));

    // CORS
    const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
    if (allowed.length) {
        app.use(cors({
            origin: (origin, cb) => (!origin || allowed.includes(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'))),
            methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
            allowedHeaders: ['Content-Type','Authorization'],
            credentials: true
        }));
        app.options('*', cors());
    } else {
        app.use(cors()); // permissive for same-origin via Netlify proxy
    }



    app.use(helmet({
        crossOriginResourcePolicy: {policy: 'cross-origin'}
    }));

    // Legacy static (harmless to keep if you still have old local files)
    app.use('/uploads/images', express.static(path.join(__dirname, 'uploads', 'images')));

    // Routes
    app.use('/api/places', placesRoute);
    app.use('/api/users', usersRoute);

    // 404
    app.use((req, res, next) => {
        throw new HttpError('Could not find this route.', 404);
    });

    // Error handler
    app.use((error, req, res, next) => {
        // With Cloudinary + memory uploads, no local file to unlink anymore.
        if (res.headerSent) return next(error);
        res.status(error.code || 500).json({message: error.message || 'An unknown error occurred!'});
    });

    return app;
}

module.exports = {createApp};
