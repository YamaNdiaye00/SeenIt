const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuid } = require('uuid');

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif'
};

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function makeStorage(subdir) {
    const base = path.join('uploads', 'images', subdir); // relative path (portable)
    ensureDir(base);

    return multer.diskStorage({
        destination: (req, file, cb) => cb(null, base),
        filename: (req, file, cb) => {
            const ext = MIME_TYPE_MAP[file.mimetype];
            cb(null, `${uuid()}.${ext}`);
        }
    });
}

function makeUploader(subdir) {
    return multer({
        limits: 500000, // ~500KB
        storage: makeStorage(subdir),
        fileFilter: (req, file, cb) => {
            const isValid = !!MIME_TYPE_MAP[file.mimetype];
            cb(isValid ? null : new Error('Invalid mime type'), isValid);
        }
    });
}

// Export two distinct uploaders
const uploadUserImage  = makeUploader('user-pictures');   // /uploads/images/user-pictures/*
const uploadPlaceImage = makeUploader('place-pictures');  // /uploads/images/place-pictures/*

module.exports = { uploadUserImage, uploadPlaceImage };
