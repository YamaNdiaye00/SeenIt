const express = require('express');
const {check} = require('express-validator');

const HttpError = require('../models/http-error');
const placesController = require('../controllers/places-controllers');
const fileUpload = require('../middlewares/file-upload');
const checkAuth = require('../middlewares/check-auth');
const {uploadPlaceImage} = require("../middlewares/file-upload");

const router = express.Router();

router.get('/:pid', placesController.getPlaceById)

router.get("/user/:uid", placesController.getPlacesByUserId);

router.use(checkAuth);

router.post('/',
    uploadPlaceImage.single('image'),
    [
        check('title').not().isEmpty(),
        check('description').isLength({min: 5}),
        check('address').not().isEmpty()
    ],
    placesController.createPlace);

router.patch('/:pid',
    [
        check('title').not().isEmpty(),
        check('description').isLength({min: 5}),
    ],
    placesController.updatePlaceById);

router.delete('/:pid', placesController.deletePlaceById);

module.exports = router;