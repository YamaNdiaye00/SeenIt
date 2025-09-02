const express = require('express');
const {check} = require('express-validator');

const HttpError = require('../models/http-error');
const usersController = require('../controllers/users-controllers');
const fileUpload = require('../middlewares/file-upload');
const {uploadUserImage} = require("../middlewares/file-upload");

const router = express.Router();

router.get('/', usersController.getUsers);

router.post('/signup',
    uploadUserImage.single('image'),     // 👈 goes to /uploads/images/user-pictures
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({min: 6}),
    ],
    usersController.signup);

router.post('/login', usersController.login);

module.exports = router;