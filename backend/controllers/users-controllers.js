const HttpError = require("../models/http-error");
const {validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');

const User = require("../models/user");
const {uploadBufferToCloudinary} = require('../lib/cloudinary')

dotenv.config();

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password')
    } catch (err) {
        const error = new HttpError('Fetching users failed, please try again later.', 500);
        return next(error);
    }
    res.status(200).json({users: users.map(user => user.toObject({getters: true}))});
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const {name, email, password} = req.body;

    let existingUser
    try {
        existingUser = await User.findOne({email: email})
    } catch (err) {
        const error = new HttpError('Signing up failed, please try again later.', 500);
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError('User exists already, please login instead', 422);
        return next(error);
    }

    let hashedPassword;
    try {
        // Hash the password
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }


    // Hash password, then build user first
    const createdUser = new User({
        name,
        email,
        password: hashedPassword,
        places: []
    });

    // Upload avatar after you have an _id
    let imageUrl = null;
    if (req.file?.buffer) {
        try {
            const result = await uploadBufferToCloudinary(req.file.buffer, {
                folder: `${process.env.CLOUDINARY_FOLDER}/users/${createdUser._id}`,
            });
            imageUrl = result.secure_url;
        } catch (e) {
            return next(new HttpError(`Image upload failed: ${e.message}`, 500));
        }
    }

    // Attach image to the user object
    createdUser.image = imageUrl;

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
            // 'Signing up failed, please try again later.',
            err.message,
            500
        );
        return next(error)
    }

    let token;
    try {
        token = jwt.sign(
            {userId: createdUser.id, email: createdUser.email},
            process.env.JWT_SECRET,
            {expiresIn: '168h'}
        );

    } catch (err) {
        const error = new HttpError('Signing up failed, please try again later.', 500);
        return next(error);
    }

    res
        .status(201)
        .json({userId: createdUser.id, email: createdUser.email, token: token});
};

const login = async (req, res, next) => {
    const {email, password} = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email: email})
    } catch (err) {
        const error = new HttpError('Logging in failed, please try again later.', 500);
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError('Invalid credentials, could not log you in.', 401);
        return next(error);
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new HttpError('Invalid credentials, could not log you in.', 500);
        return next(error);
    }

    if (!isValidPassword) {
        const error = new HttpError('Invalid credentials, could not log you in.', 401);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign(
            {userId: existingUser.id, email: existingUser.email},
            process.env.JWT_SECRET,
            {expiresIn: '168h'}
        );
    } catch (err) {
        const error = new HttpError('Logging in failed, please try again later.', 500);
        return next(error);
    }

    res.json({message: "Logged in!", userId: existingUser.id, email: existingUser.email, token: token});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;