const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');


const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoute = require('./routes/places-routes');
const usersRoute = require('./routes/users-routes');
const HttpError = require('./models/http-error')

dotenv.config();

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
    throw new Error("Missing critical environment variables (JWT_SECRET or MONGO_URI)");
}

const app = express();

// Health check
app.get('/healthz', (_req, res) => res.send('ok'));

// Security: Limit incoming JSON payloads
app.use(bodyParser.json({limit: '10kb'}));

// --- CORS ---
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Fast preflight
app.options('*', cors());

// Security: Set HTTP headers
app.use(helmet({
    // allow other origins to display images/files
    crossOriginResourcePolicy: {policy: 'cross-origin'}
}));

app.use(
    '/uploads/images',
    express.static(path.join(__dirname, 'uploads', 'images'))
);


app.use('/api/places', placesRoute);

app.use('/api/users', usersRoute);

app.use((req, res, next) => {
    throw new HttpError('Could not find this route.', 404);
});

app.use((error, req, res, next) => {

    if (res.headerSent) {
        return next(error);

    }
    res.status(error.code || 500);
    res.json({message: error.message || 'An unknown error occurred!'});
});

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });
