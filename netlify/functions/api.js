// netlify/functions/api.js
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const { createApp } = require('../../backend/createApp');

const app = createApp();

// Reuse a single Mongo connection across cold starts
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

async function connect() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI, { maxPoolSize: 10 }).then(m => m);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

exports.handler = async (event, context) => {
    await connect();
    const handler = serverless(app);
    return handler(event, context);
};
