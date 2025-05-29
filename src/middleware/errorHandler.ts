import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { StatusCodes } from 'http-status-codes';

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error(err);

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            details: err.details,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }

    // Handle TypeORM errors
    if (err.name === 'QueryFailedError') {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Database operation failed',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Validation failed',
            details: err.message
        });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Default error
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
}; 