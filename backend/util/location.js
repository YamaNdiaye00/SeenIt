const axios = require('axios');
const HttpError = require("../models/http-error");

async function getCoordsForAddress(address) {
    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
    );

    const data = response.data;

    if (!data || data.status === 'ZERO_RESULTS') {
        throw new HttpError("Could not find location for the specified address", 422);
    }

    return data.results[0].geometry.location
}

module.exports = getCoordsForAddress;