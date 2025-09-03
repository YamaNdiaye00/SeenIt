const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config(); // make sure .env is loaded here

const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_FOLDER
} = process.env;

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key:    CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

function uploadBufferToCloudinary(buffer, { folder = CLOUDINARY_FOLDER, filename } = {}) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: filename?.replace(/\.[^.]+$/, ''), // optional fixed name (no extension)
                resource_type: 'image'
            },
            (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(buffer);
    });
}

// Try to derive Cloudinary public_id from a URL like:
// https://res.cloudinary.com/<cloud>/image/upload/v123/<folder>/name.ext
function extractPublicIdFromUrl(url) {
    try {
        const u = new URL(url);
        const parts = u.pathname.split('/'); // [, 'image', 'upload', 'v123', ...folder..., 'name.ext']
        const uploadIdx = parts.indexOf('upload');
        if (uploadIdx === -1) return null;
        const after = parts.slice(uploadIdx + 1); // e.g. ['v123','seenit-dev','places','abc123.jpg']
        // Strip version if present (starts with 'v' + digits)
        if (after[0]?.match(/^v\d+$/)) after.shift();
        const last = after.pop(); // 'abc123.jpg'
        if (!last) return null;
        const filenameNoExt = last.replace(/\.[^.]+$/, '');
        return [...after, filenameNoExt].join('/'); // '<folder>/places/abc123'
    } catch {
        return null;
    }
}

module.exports = {
    cloudinary,
    uploadBufferToCloudinary,
    extractPublicIdFromUrl,
};
