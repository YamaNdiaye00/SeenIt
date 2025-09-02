const fs = require('fs');
const {validationResult} = require('express-validator');
const {mongo, startSession} = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
const {isAbsolute, join} = require("node:path");

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;

    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find a place', 500);
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find place for the provided ID', 404);
        return next(error);
    }

    res.json({place: place.toObject({getters: true})});
}

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    let places;
    try {
        places = await Place.find({creator: userId});
    } catch (err) {
        const error = new HttpError('Fetching places failed. Please try again later', 500);
        return next(error);
    }

    if (!places) {
        return next(new HttpError('Could not find places for the user ID', 404));
    }

    res.json({places: places.map(place => place.toObject({getters: true}))});

}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const {title, description, address} = req.body;

    let coordinates;

    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error)
    }

    const imgPath = req.file?.path ? req.file.path.replace(/\\/g, '/') : null;

    const createdPlace = new Place({
        title,
        description,
        location: coordinates,
        address,
        creator: req.userData.userId,
        image: imgPath
    });

    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        const error = new HttpError('Creating place failed. Please try again later', 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id', 404);
        return next(error);
    }

    try {
        const sess = await startSession();
        sess.startTransaction();
        await createdPlace.save({session: sess});
        user.places.push(createdPlace);
        await user.save({session: sess})
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Creating place failed. Please try again later', 500);
        return next(error);
    }


    try {
        await createdPlace.save();
    } catch (err) {
        const error = new HttpError(
            'Creating place failed, please try again',
            500
        );
        return next(error)
    }

    res.status(201).json(createdPlace)

};

const updatePlaceById = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const {title, description} = req.body;
    const placeId = req.params.pid;

    let place;

    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update place', 500);
        return next(error);
    }

    if (place.creator.toString() !== req.userData.userId) {
        const error = new HttpError('You are not allowed to edit this place.', 401);
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update place', 500);
        return next(error);
    }

    res.status(201).json({place: place.toObject({getters: true})});

};

const deletePlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch {
        return next(new HttpError('Something went wrong, could not delete place', 500));
    }

    if (!place) return next(new HttpError('Could not find place for provided id', 404));

    // ✅ Correct auth check after populate
    if (place.creator.id !== req.userData.userId) {
        return next(new HttpError('You are not allowed to delete this place.', 401));
    }

    const absImagePath = isAbsolute(place.image)
        ? place.image
        : join(__dirname, '..', place.image);

    const sess = await startSession();
    try {
        await sess.withTransaction(async () => {
            await place.deleteOne({session: sess});
            place.creator.places.pull(place._id);        // ✅ pull by id
            await place.creator.save({session: sess});
        });
    } catch {
        await sess.endSession();
        return next(new HttpError('Something went wrong, could not delete place', 500));
    }
    await sess.endSession();

    // Best-effort file delete
    try {
        await fs.promises.unlink(absImagePath);
    } catch (e) {
        console.warn('Could not delete image file:', absImagePath, e.message);
    }

    res.status(200).json({message: 'Place deleted.'});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;