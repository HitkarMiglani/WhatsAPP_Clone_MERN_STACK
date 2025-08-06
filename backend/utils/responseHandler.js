const response = (res, statusCode, message, data = null) => {
    if (!res) {
        console.error("Invalid parameters for response handler");
    }

    const responseObject = {
        status: statusCode<400 ? "success" : "error",
        message: message,
        data: data
    };

    return res.status(statusCode).json(responseObject);
}

module.exports = response;