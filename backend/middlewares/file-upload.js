const multer = require('multer');
const { v4: uuid } = require('uuid');

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif'
};

// memory storage for serverless + Cloudinary
const storage = multer.memoryStorage();

function makeUploader() {
    return multer({
        limits: 500000, // ~500KB
        storage,
        fileFilter: (req, file, cb) => {
            const isValid = !!MIME_TYPE_MAP[file.mimetype];
            cb(isValid ? null : new Error('Invalid mime type'), isValid);
        }
    });
}

// Export two distinct uploaders
const uploadUserImage  = makeUploader();   // /uploads/images/user-pictures/*
const uploadPlaceImage = makeUploader();  // /uploads/images/place-pictures/*

module.exports = { uploadUserImage, uploadPlaceImage };
