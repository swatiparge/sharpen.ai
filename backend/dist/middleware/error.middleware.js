"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const config_1 = require("../config");
function errorMiddleware(err, _req, res, _next) {
    console.error(err.stack);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        error: config_1.config.nodeEnv === 'production' ? 'Something went wrong' : err.message,
    });
}
//# sourceMappingURL=error.middleware.js.map