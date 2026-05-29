const logger = require("../config/logger");
const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  logger.error({
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
    userId: req.user?._id,
    route: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

module.exports = errorHandler;
