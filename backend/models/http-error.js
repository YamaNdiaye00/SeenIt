class HttpError extends Error {
    constructor(message, error) {
        super(message);
        this.code = error.code;
    }
}

module.exports = HttpError;