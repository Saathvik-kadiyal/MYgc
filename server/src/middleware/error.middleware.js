const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Default error response
    const errorResponse = {
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    };

    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            ...errorResponse,
            message: 'Validation Error',
            errors: err.errors
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            ...errorResponse,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            ...errorResponse,
            message: 'Token expired'
        });
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            ...errorResponse,
            message: 'File size too large'
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            ...errorResponse,
            message: 'Unexpected file field'
        });
    }

    // Handle mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            ...errorResponse,
            message: 'Duplicate field value entered'
        });
    }

    // Default to 500 error
    res.status(err.status || 500).json(errorResponse);
};

module.exports = errorHandler; 