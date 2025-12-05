const sendResponse = (res, statusCode, success, message, data = null) => {
    const response = {
        success,
        message,
        timestamp: new Date().toISOString()
    };

    if (data !== null) {
        response.data = data;
    }

    res.status(statusCode).json(response);
};

const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    sendResponse(res, statusCode, true, message, data);
};

const sendError = (res, message, statusCode = 400, data = null) => {
    sendResponse(res, statusCode, false, message, data);
};

const sendCreated = (res, data, message = 'Created successfully') => {
    sendResponse(res, 201, true, message, data);
};

const sendUnauthorized = (res, message = 'Unauthorized') => {
    sendResponse(res, 401, false, message);
};

const sendNotFound = (res, message = 'Not found') => {
    sendResponse(res, 404, false, message);
};

const sendServerError = (res, message = 'Internal server error') => {
    sendResponse(res, 500, false, message);
};

module.exports = {
    sendResponse,
    sendSuccess,
    sendError,
    sendCreated,
    sendUnauthorized,
    sendNotFound,
    sendServerError
};