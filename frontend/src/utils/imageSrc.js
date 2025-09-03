const API_BASE = process.env.REACT_APP_BACKEND_URL // CRA
    || "";

export function getImageSrc(image) {
    if (!image) return "";                     // handle missing
    if (/^https?:\/\//i.test(image)) return image;  // Cloudinary (or any absolute URL)
    // Legacy: stored a relative path like 'uploads/images/...' or '/uploads/images/...'
    const path = image.replace(/^\/+/, "");
    return API_BASE ? `${API_BASE}/${path}` : `/${path}`;
}
