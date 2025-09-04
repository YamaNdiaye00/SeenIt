// backend/app.js
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const { createApp } = require('./createApp');

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
    throw new Error('Missing critical environment variables (JWT_SECRET or MONGO_URI)');
}

const app = createApp();
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error('Database connection error:', err));
