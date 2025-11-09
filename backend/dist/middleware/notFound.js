"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notFound = (req, res, _next) => {
    res.status(404).json({
        message: `Not Found - ${req.originalUrl}`,
    });
};
exports.default = notFound;
